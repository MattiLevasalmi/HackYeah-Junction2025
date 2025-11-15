import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

interface SensorData {
  temperature: number;
  humidity: number;
  occupied: boolean;
  lastUpdated: string;
}

interface CommandAction {
  action: 'increase' | 'decrease' | 'set' | 'toggle';
  target: 'temperature' | 'humidity' | 'occupied';
  value?: number;
}

export class SaunaSensorService {
  private dataFilePath: string;
  private elevenLabsApiKey: string;
  private geminiApiKey: string;

  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/sauna-sensor-data.json');
    this.elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  // Initialize the sensor data file if it doesn't exist
  async initializeSensorData(): Promise<void> {
    try {
      await fs.access(this.dataFilePath);
    } catch {
      const initialData: SensorData = {
        temperature: 70,
        humidity: 20,
        occupied: false,
        lastUpdated: new Date().toISOString()
      };
      const dataDir = path.dirname(this.dataFilePath);
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(this.dataFilePath, JSON.stringify(initialData, null, 2));
    }
  }

  // Get current sensor data
  async getSensorData(): Promise<SensorData> {
    await this.initializeSensorData();
    const data = await fs.readFile(this.dataFilePath, 'utf-8');
    return JSON.parse(data);
  }

  // Update sensor data
  async updateSensorData(updates: Partial<SensorData>): Promise<SensorData> {
    const currentData = await this.getSensorData();
    const updatedData: SensorData = {
      ...currentData,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(this.dataFilePath, JSON.stringify(updatedData, null, 2));
    return updatedData;
  }

  // Transcribe audio using ElevenLabs or OpenAI Whisper
  async transcribeAudio(audioData: string): Promise<string> {
    try {
      // Using OpenAI Whisper for transcription
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          file: audioData,
          model: 'whisper-1'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.geminiApiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  // Process command using AI (OpenAI GPT)
  async processCommand(commandText: string): Promise<CommandAction | null> {
    try {
      const prompt = `
You are a sauna control assistant. Parse the following voice command and extract the action.
Return ONLY a JSON object with this structure:
{
  "action": "increase" | "decrease" | "set" | "toggle",
  "target": "temperature" | "humidity" | "occupied",
  "value": number (optional, for increase/decrease/set actions)
}

Examples:
- "increase temperature by 10 degrees" -> {"action": "increase", "target": "temperature", "value": 10}
- "reduce humidity by 5 percent" -> {"action": "decrease", "target": "humidity", "value": 5}
- "set temperature to 80" -> {"action": "set", "target": "temperature", "value": 80}

Command: "${commandText}"
`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a JSON-only response assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.geminiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Command processing error:', error);
      throw new Error('Failed to process command');
    }
  }

  // Execute the parsed command
  async executeCommand(command: CommandAction | null): Promise<SensorData> {
    if (!command) {
      throw new Error('Invalid command');
    }

    const currentData = await this.getSensorData();
    const updates: Partial<SensorData> = {};

    switch (command.action) {
      case 'increase':
        if (command.target === 'temperature') {
          updates.temperature = currentData.temperature + (command.value || 0);
        } else if (command.target === 'humidity') {
          updates.humidity = Math.min(100, currentData.humidity + (command.value || 0));
        }
        break;
      case 'decrease':
        if (command.target === 'temperature') {
          updates.temperature = Math.max(0, currentData.temperature - (command.value || 0));
        } else if (command.target === 'humidity') {
          updates.humidity = Math.max(0, currentData.humidity - (command.value || 0));
        }
        break;
      case 'set':
        if (command.target === 'temperature') {
          updates.temperature = command.value;
        } else if (command.target === 'humidity') {
          updates.humidity = Math.min(100, Math.max(0, command.value || 0));
        }
        break;
      case 'toggle':
        if (command.target === 'occupied') {
          updates.occupied = !currentData.occupied;
        }
        break;
    }

    return await this.updateSensorData(updates);
  }

  // Generate voice response using ElevenLabs
  async generateVoiceResponse(text: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Default voice
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
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

      // Convert audio to base64
      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      console.error('Voice generation error:', error);
      throw new Error('Failed to generate voice response');
    }
  }
}