import * as React from 'react';
import { VoiceRecognitionService } from '../utils/web-speech-helper';
import './SaunaVoiceButton.css'; // Optional

interface SensorData {
  temperature: number;
  humidity: number;
  occupied: boolean;
  lastUpdated: string;
}

export const SaunaVoiceButton: React.FC = () => {
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastCommand, setLastCommand] = React.useState<string>('');
  const [sensorData, setSensorData] = React.useState<SensorData | null>(null);
  const [isSupported] = React.useState(VoiceRecognitionService.isSupported());

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      setError(null);

      const voiceService = new VoiceRecognitionService();
      const command = await voiceService.startListening();
      
      setLastCommand(command);
      setIsListening(false);
      setIsProcessing(true);

      const response = await fetch('/api/sauna/sensor/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error('Failed to process command');
      }

      const data = await response.json();
      setSensorData(data.updatedData);

      if (data.audioResponse) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioResponse}`);
        await audio.play();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Voice command error:', err);
    } finally {
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="sauna-voice-control">
      <div className="voice-button-container">
        <button
          onClick={handleVoiceCommand}
          disabled={isListening || isProcessing || !isSupported}
          className={`voice-button ${isListening ? 'listening' : ''}`}
        >
          {isListening && '🎤 Listening...'}
          {isProcessing && '⚙️ Processing...'}
          {!isListening && !isProcessing && '🎙️ Voice Command'}
        </button>

        {!isSupported && (
          <p className="warning">
            Voice recognition not supported. Please use Chrome, Edge, or Safari.
          </p>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {lastCommand && (
        <div className="last-command">
          <strong>Command:</strong> {lastCommand}
        </div>
      )}

      {sensorData && (
        <div className="sensor-data">
          <h3>Current Sauna Settings</h3>
          <div className="sensor-item">
            <span>Temperature:</span>
            <strong>{sensorData.temperature}°C</strong>
          </div>
          <div className="sensor-item">
            <span>Humidity:</span>
            <strong>{sensorData.humidity}%</strong>
          </div>
          <div className="sensor-item">
            <span>Occupied:</span>
            <strong>{sensorData.occupied ? 'Yes' : 'No'}</strong>
          </div>
          <div className="sensor-item">
            <span>Last Updated:</span>
            <small>{new Date(sensorData.lastUpdated).toLocaleString()}</small>
          </div>
        </div>
      )}
    </div>
  );
};