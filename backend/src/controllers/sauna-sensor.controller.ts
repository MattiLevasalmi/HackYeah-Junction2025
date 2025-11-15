import { Request, Response } from 'express';
import { SaunaSensorService } from '../services/sauna-sensor.service';

export class SaunaSensorController {
  private saunaSensorService: SaunaSensorService;

  constructor() {
    this.saunaSensorService = new SaunaSensorService();
  }

  // Get current sauna sensor data
  async getSensorData(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.saunaSensorService.getSensorData();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve sensor data' });
    }
  }

  // Process voice command to control sauna
  async processVoiceCommand(req: Request, res: Response): Promise<void> {
    try {
      const { audioData, command } = req.body;
      
      // If audio data is provided, transcribe it first
      let commandText = command;
      if (audioData) {
        commandText = await this.saunaSensorService.transcribeAudio(audioData);
      }

      if (!commandText) {
        res.status(400).json({ error: 'No command provided' });
        return;
      }

      // Process the command using AI
      const processedCommand = await this.saunaSensorService.processCommand(commandText);
      
      // Execute the command and update sensor data
      const updatedData = await this.saunaSensorService.executeCommand(processedCommand);
      
      // Generate voice response
      const audioResponse = await this.saunaSensorService.generateVoiceResponse('Done');

      res.status(200).json({
        success: true,
        message: 'Command executed successfully',
        updatedData,
        audioResponse, // base64 encoded audio
        commandText
      });
    } catch (error) {
      console.error('Voice command error:', error);
      res.status(500).json({ 
        error: 'Failed to process voice command',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Manual update endpoint (for testing)
  async updateSensorData(req: Request, res: Response): Promise<void> {
    try {
      const { temperature, humidity, occupied } = req.body;
      const updatedData = await this.saunaSensorService.updateSensorData({
        temperature,
        humidity,
        occupied
      });
      res.status(200).json(updatedData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update sensor data' });
    }
  }
}