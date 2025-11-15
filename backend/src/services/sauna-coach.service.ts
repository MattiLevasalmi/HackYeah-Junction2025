import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface SessionConfig {
  userId?: string;
  userIds?: string[];
  recommendations: any;
  coachTalkLevel: 'minimal' | 'moderate' | 'extensive';
  includeBreathing: boolean;
  includeMeditation: boolean;
  voicePreferences?: {
    voiceId?: string;
    speed?: number;
  };
}

interface GuidanceEvent {
  time: number; // elapsed time in minutes
  type: 'break' | 'breathing' | 'meditation' | 'reminder' | 'encouragement';
  text: string;
  audioBase64?: string;
}

interface SaunaSession {
  id: string;
  isGroupSession: boolean;
  config: SessionConfig;
  startTime: string;
  endTime?: string;
  schedule: GuidanceEvent[];
  deliveredGuidance: number[];
}

export class SaunaCoachService {
  private sessionsDir: string;
  private elevenLabsApiKey: string;
  private geminiApiKey: string;

  constructor() {
    this.sessionsDir = path.join(__dirname, '../../data/sauna-sessions');
    this.elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  // Initialize sessions directory
  async initializeSessionsDir(): Promise<void> {
    try {
      await fs.access(this.sessionsDir);
    } catch {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    }
  }

  // Create session schedule based on recommendations and preferences
  private async createSessionSchedule(config: SessionConfig): Promise<GuidanceEvent[]> {
    const schedule: GuidanceEvent[] = [];
    const recommendations = config.recommendations;
    
    // Determine if group or individual
    const isGroup = (config.userIds && config.userIds.length > 1)??false;
    const duration = isGroup 
      ? recommendations.groupRecommendation?.duration?.value 
      : recommendations.recommended_duration;
    const breaks = isGroup
      ? recommendations.groupRecommendation?.breaks?.value
      : Math.round(recommendations.recommended_breaks);

    // Welcome message
    const welcomeText = await this.generateWelcomeMessage(config, isGroup);
    schedule.push({
      time: 0,
      type: 'reminder',
      text: welcomeText
    });

    // Initial breathing guidance (if enabled)
    if (config.includeBreathing && config.coachTalkLevel !== 'minimal') {
      schedule.push({
        time: 1,
        type: 'breathing',
        text: await this.generateBreathingGuidance('initial')
      });
    }

    // Calculate break intervals
    if (breaks > 0) {
      const breakInterval = duration / (breaks + 1);
      for (let i = 1; i <= breaks; i++) {
        const breakTime = Math.round(breakInterval * i);
        schedule.push({
          time: breakTime,
          type: 'break',
          text: await this.generateBreakReminder(i, breaks)
        });
      }
    }

    // Meditation guidance (if enabled)
    if (config.includeMeditation && config.coachTalkLevel === 'extensive') {
      const meditationTime = Math.round(duration * 0.3);
      schedule.push({
        time: meditationTime,
        type: 'meditation',
        text: await this.generateMeditationGuidance()
      });
    }

    // Periodic encouragement based on talk level
    if (config.coachTalkLevel === 'extensive') {
      const encouragementIntervals = Math.floor(duration / 5);
      for (let i = 1; i < encouragementIntervals; i++) {
        if (!schedule.some(e => Math.abs(e.time - i * 5) < 2)) {
          schedule.push({
            time: i * 5,
            type: 'encouragement',
            text: await this.generateEncouragement()
          });
        }
      }
    } else if (config.coachTalkLevel === 'moderate') {
      const midpoint = Math.round(duration / 2);
      if (!schedule.some(e => Math.abs(e.time - midpoint) < 2)) {
        schedule.push({
          time: midpoint,
          type: 'encouragement',
          text: await this.generateEncouragement()
        });
      }
    }

    // Final guidance
    const finalTime = Math.round(duration - 2);
    schedule.push({
      time: finalTime,
      type: 'reminder',
      text: await this.generateFinalMessage()
    });

    // Sort by time
    schedule.sort((a, b) => a.time - b.time);

    return schedule;
  }

  // Start a new session
  async startSession(config: SessionConfig): Promise<string> {
    await this.initializeSessionsDir();

    const sessionId = uuidv4();
    const schedule = await this.createSessionSchedule(config);

    const session: SaunaSession = {
      id: sessionId,
      isGroupSession: !!(config.userIds && config.userIds.length > 1),
      config,
      startTime: new Date().toISOString(),
      schedule,
      deliveredGuidance: []
    };

    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));

    return sessionId;
  }

  // Get next guidance based on elapsed time
  async getNextGuidance(sessionId: string, elapsedTime: number): Promise<GuidanceEvent | null> {
    const session = await this.loadSession(sessionId);
    
    // Find guidance events that should be delivered at this time
    const pendingGuidance = session.schedule.filter((event, index) => 
      event.time <= elapsedTime && !session.deliveredGuidance.includes(index)
    );

    if (pendingGuidance.length === 0) {
      return null;
    }

    // Get the most recent pending guidance
    const guidance = pendingGuidance[pendingGuidance.length - 1];
    const guidanceIndex = session.schedule.indexOf(guidance);

    // Generate audio if not already generated
    if (!guidance.audioBase64) {
      guidance.audioBase64 = await this.generateVoiceResponse(
        guidance.text,
        session.config.voicePreferences?.voiceId,
        session.config.voicePreferences?.speed
      );
    }

    // Mark as delivered
    session.deliveredGuidance.push(guidanceIndex);
    await this.saveSession(session);

    return guidance;
  }

  // Get full session schedule
  async getSessionSchedule(sessionId: string): Promise<GuidanceEvent[]> {
    const session = await this.loadSession(sessionId);
    return session.schedule;
  }

  // End session
  async endSession(sessionId: string): Promise<void> {
    const session = await this.loadSession(sessionId);
    session.endTime = new Date().toISOString();
    await this.saveSession(session);
  }

  // Handle user input during session
  async handleUserInput(sessionId: string, userInput: string): Promise<{ text: string; audioBase64: string }> {
    const session = await this.loadSession(sessionId);

    // Use AI to generate contextual response
    const responseText = await this.generateContextualResponse(userInput, session);
    const audioResponse = await this.generateVoiceResponse(
      responseText,
      session.config.voicePreferences?.voiceId,
      session.config.voicePreferences?.speed
    );

    return {
      text: responseText,
      audioBase64: audioResponse
    };
  }

  // Transcribe audio
  async transcribeAudio(audioData: string): Promise<string> {
    try {
      // Note: Gemini doesn't have built-in audio transcription
      // Recommend using browser's Web Speech API on frontend instead
      // or integrate a free service like AssemblyAI
      console.warn('Audio transcription not available with Gemini. Use Web Speech API on frontend.');
      throw new Error('Audio transcription not supported. Please use text input or implement Web Speech API on frontend.');
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  // Generate voice response using ElevenLabs
  private async generateVoiceResponse(text: string, voiceId?: string, speed?: number): Promise<string> {
    try {
      const selectedVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            speed: speed || 1.0
          }
        },
        {
          headers: {
            'xi-api-key': this.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      console.error('Voice generation error:', error);
      throw new Error('Failed to generate voice response');
    }
  }

  // AI-powered message generation methods
  private async generateWelcomeMessage(config: SessionConfig, isGroup: boolean): Promise<string> {
    const prompt = isGroup
      ? `Generate a warm welcome message for a group sauna session. Keep it brief (2-3 sentences). Mention that everyone should relax and enjoy.`
      : `Generate a warm welcome message for a solo sauna session. Keep it brief (2-3 sentences). Encourage relaxation.`;

    return await this.generateAIText(prompt);
  }

  private async generateBreathingGuidance(phase: 'initial' | 'ongoing'): Promise<string> {
    const prompt = phase === 'initial'
      ? `Generate brief breathing guidance for starting a sauna session (2-3 sentences). Focus on deep, slow breathing.`
      : `Generate brief breathing reminder for during sauna session (1-2 sentences).`;

    return await this.generateAIText(prompt);
  }

  private async generateBreakReminder(currentBreak: number, totalBreaks: number): Promise<string> {
    const prompt = `Generate a gentle reminder that it's time for break ${currentBreak} of ${totalBreaks}. Suggest stepping outside or cooling down briefly. Keep it to 2 sentences.`;
    return await this.generateAIText(prompt);
  }

  private async generateMeditationGuidance(): Promise<string> {
    const prompt = `Generate calming meditation guidance for a sauna session (3-4 sentences). Focus on mindfulness and body awareness.`;
    return await this.generateAIText(prompt);
  }

  private async generateEncouragement(): Promise<string> {
    const prompt = `Generate a brief encouraging message for someone in a sauna session (1-2 sentences). Keep it positive and calming.`;
    return await this.generateAIText(prompt);
  }

  private async generateFinalMessage(): Promise<string> {
    const prompt = `Generate a brief message that the sauna session is ending soon (1-2 sentences). Remind them to cool down gradually.`;
    return await this.generateAIText(prompt);
  }

  private async generateContextualResponse(userInput: string, session: SaunaSession): Promise<string> {
    const prompt = `You are a knowledgeable sauna coach. A user in a sauna session says: "${userInput}". 
    
Provide a helpful, brief response (2-3 sentences) that addresses their question or concern. Consider sauna safety and wellness.`;

    return await this.generateAIText(prompt);
  }

  // Generate text using Gemini AI
  private async generateAIText(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: `You are a calm, knowledgeable sauna coach. Provide concise, helpful guidance.

${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data.candidates[0].content.parts[0].text.trim();
      return text;
    } catch (error) {
      console.error('AI text generation error:', error);
      // Fallback to generic message
      return 'Please continue to relax and breathe deeply.';
    }
  }

  // Helper methods for session persistence
  private async loadSession(sessionId: string): Promise<SaunaSession> {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    const data = await fs.readFile(sessionPath, 'utf-8');
    return JSON.parse(data);
  }

  private async saveSession(session: SaunaSession): Promise<void> {
    const sessionPath = path.join(this.sessionsDir, `${session.id}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
  }
}