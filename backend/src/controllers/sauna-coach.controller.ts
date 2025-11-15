import { Request, Response } from 'express';
import { SaunaCoachService } from '../services/sauna-coach.service';

export class SaunaCoachController {
  private saunaCoachService: SaunaCoachService;

  constructor() {
    this.saunaCoachService = new SaunaCoachService();
  }

  // Start a sauna coaching session
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { 
        userId, 
        userIds, // for group sessions
        recommendations, 
        coachTalkLevel, // 'minimal' | 'moderate' | 'extensive'
        includeBreathing,
        includeMeditation,
        voicePreferences
      } = req.body;

      // Determine if it's a group or individual session
      const isGroupSession = userIds && userIds.length > 1;
      
      const sessionId = await this.saunaCoachService.startSession({
        userId: isGroupSession ? undefined : userId,
        userIds: isGroupSession ? userIds : undefined,
        recommendations,
        coachTalkLevel: coachTalkLevel || 'moderate',
        includeBreathing: includeBreathing !== false,
        includeMeditation: includeMeditation !== false,
        voicePreferences
      });

      res.status(200).json({
        success: true,
        sessionId,
        message: 'Sauna session started'
      });
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({ 
        error: 'Failed to start session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get next guidance/instruction during session
  async getNextGuidance(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { elapsedTime } = req.body; // in minutes

      const guidance = await this.saunaCoachService.getNextGuidance(
        sessionId,
        elapsedTime
      );

      res.status(200).json({
        success: true,
        guidance
      });
    } catch (error) {
      console.error('Get guidance error:', error);
      res.status(500).json({ 
        error: 'Failed to get guidance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all scheduled guidance for the session
  async getSessionSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const schedule = await this.saunaCoachService.getSessionSchedule(sessionId);

      res.status(200).json({
        success: true,
        schedule
      });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ 
        error: 'Failed to get session schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // End the session
  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      await this.saunaCoachService.endSession(sessionId);

      res.status(200).json({
        success: true,
        message: 'Session ended successfully'
      });
    } catch (error) {
      console.error('End session error:', error);
      res.status(500).json({ 
        error: 'Failed to end session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Handle user interruption or question during session
  async handleUserInput(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { audioData, text } = req.body;

      let userInput = text;
      if (audioData && !text) {
        // Transcribe audio if provided
        userInput = await this.saunaCoachService.transcribeAudio(audioData);
      }

      const response = await this.saunaCoachService.handleUserInput(
        sessionId,
        userInput
      );

      res.status(200).json({
        success: true,
        response
      });
    } catch (error) {
      console.error('Handle input error:', error);
      res.status(500).json({ 
        error: 'Failed to handle user input',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}