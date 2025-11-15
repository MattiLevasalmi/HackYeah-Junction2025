import axios from 'axios';

// Types
export interface UserSaunaData {
  age: number;
  sex: 'male' | 'female' | 'other';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  stressLevel: number; // 0-10
  outsideTemp: number; // Celsius
  outsideHumidity: number; // 0-100%
  sessionsLastMonth: number;
  
  // Optional fields
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  timeOfDay?: number; // 0-23
  dayOfYear?: number; // 1-365
  windDirection?: string;
  moonPhase?: string;
  sessionFocus?: string;
  sessionType?: string;
  dominantExperience?: string;
  dominantFocus?: string;
}

export interface SaunaRecommendation {
  temperature: {
    value: number;
    unit: string;
    range: { min: number; max: number };
  };
  humidity: {
    value: number;
    unit: string;
    range: { min: number; max: number };
  };
  duration: {
    value: number;
    unit: string;
  };
  nextSession: {
    value: number;
    unit: string;
    description: string;
  };
  breaks: {
    value: number;
    unit: string;
    description: string;
  };
  expectedStressReduction: {
    before: number | null;
    after: number;
    unit: string;
  };
}

export interface RawPrediction {
  recommended_temp: number;
  recommended_humidity: number;
  recommended_duration: number;
  recommended_next_session_days: number;
  recommended_breaks: number;
  predicted_stress_level_after_sauna: number;
}

export interface TargetStatistics {
  targets: string[];
  statistics: {
    [key: string]: {
      mean: number;
      std: number;
      min: number;
      max: number;
    };
  };
}

export class SaunaModelAdapter {
  private pythonServiceUrl: string;
  private targetStats: TargetStatistics | null = null;
  
  constructor(pythonServiceUrl: string = 'http://localhost:5000') {
    this.pythonServiceUrl = pythonServiceUrl;
  }
  
  /**
   * Load target statistics from JSON file
   */
  async loadTargetStatistics(statsPath: string): Promise<void> {
    const fs = await import('fs/promises');
    const data = await fs.readFile(statsPath, 'utf-8');
    this.targetStats = JSON.parse(data);
  }
  
  /**
   * Validate user input data
   */
  validateInput(userData: Partial<UserSaunaData>): { valid: boolean; error?: string } {
    const required = ['age', 'sex', 'experienceLevel', 'stressLevel', 'outsideTemp', 'outsideHumidity', 'sessionsLastMonth'];
    
    for (const field of required) {
      if (!(field in userData)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }
    
    const data = userData as UserSaunaData;
    
    // Validate ranges
    if (data.age < 1 || data.age > 120) {
      return { valid: false, error: 'Age must be between 1 and 120' };
    }
    
    if (data.stressLevel < 0 || data.stressLevel > 10) {
      return { valid: false, error: 'Stress level must be between 0 and 10' };
    }
    
    if (data.outsideTemp < -50 || data.outsideTemp > 50) {
      return { valid: false, error: 'Outside temperature must be between -50°C and 50°C' };
    }
    
    if (data.outsideHumidity < 0 || data.outsideHumidity > 100) {
      return { valid: false, error: 'Outside humidity must be between 0% and 100%' };
    }
    
    if (data.sessionsLastMonth < 0 || data.sessionsLastMonth > 100) {
      return { valid: false, error: 'Sessions last month must be between 0 and 100' };
    }
    
    return { valid: true };
  }
  
  /**
   * Prepare user data for the Python service (convert camelCase to snake_case)
   */
  private prepareForPython(userData: UserSaunaData): Record<string, any> {
    return {
      age: userData.age,
      sex: userData.sex,
      experience_level: userData.experienceLevel,
      stress_level: userData.stressLevel,
      outside_temp: userData.outsideTemp,
      outside_humidity: userData.outsideHumidity,
      sessions_last_month: userData.sessionsLastMonth,
      heart_rate: userData.heartRate,
      blood_pressure_systolic: userData.bloodPressureSystolic,
      blood_pressure_diastolic: userData.bloodPressureDiastolic,
      time_of_day: userData.timeOfDay,
      day_of_year: userData.dayOfYear,
      wind_direction: userData.windDirection,
      moon_phase: userData.moonPhase,
      session_focus: userData.sessionFocus,
      session_type: userData.sessionType,
      dominant_experience: userData.dominantExperience,
      dominant_focus: userData.dominantFocus,
    };
  }
  
  /**
   * Get prediction from Python microservice
   */
  async predict(userData: UserSaunaData): Promise<SaunaRecommendation> {
    // Validate input
    const validation = this.validateInput(userData);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    try {
      // Call Python microservice
      const response = await axios.post<RawPrediction>(
        `${this.pythonServiceUrl}/predict`,
        this.prepareForPython(userData),
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000, // 5 second timeout
        }
      );
      
      // Format response for frontend
      return this.formatForClient(response.data, userData.stressLevel);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Model service error: ${error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Get predictions for multiple users (batch)
   */
  async predictBatch(usersData: UserSaunaData[]): Promise<SaunaRecommendation[]> {
    // Validate all inputs
    for (const userData of usersData) {
      const validation = this.validateInput(userData);
      if (!validation.valid) {
        throw new Error(`Invalid data for user: ${validation.error}`);
      }
    }
    
    try {
      const response = await axios.post<RawPrediction[]>(
        `${this.pythonServiceUrl}/predict-batch`,
        usersData.map(u => this.prepareForPython(u)),
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000, // 10 second timeout for batch
        }
      );
      
      return response.data.map((pred, i) => 
        this.formatForClient(pred, usersData[i].stressLevel)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Model service error: ${error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Format raw predictions for frontend consumption
   */
  private formatForClient(
    predictions: RawPrediction,
    stressBefore?: number
  ): SaunaRecommendation {
    return {
      temperature: {
        value: Math.round(predictions.recommended_temp * 10) / 10,
        unit: '°C',
        range: {
          min: Math.round((predictions.recommended_temp - 5) * 10) / 10,
          max: Math.round((predictions.recommended_temp + 5) * 10) / 10,
        },
      },
      humidity: {
        value: Math.round(predictions.recommended_humidity * 10) / 10,
        unit: '%',
        range: {
          min: Math.max(10, Math.round((predictions.recommended_humidity - 10) * 10) / 10),
          max: Math.min(100, Math.round((predictions.recommended_humidity + 10) * 10) / 10),
        },
      },
      duration: {
        value: Math.round(predictions.recommended_duration),
        unit: 'minutes',
      },
      nextSession: {
        value: Math.round(predictions.recommended_next_session_days * 10) / 10,
        unit: 'days',
        description: `Recommended to wait ${Math.round(predictions.recommended_next_session_days * 10) / 10} days before next session`,
      },
      breaks: {
        value: Math.round(predictions.recommended_breaks),
        unit: 'breaks',
        description: `Take ${Math.round(predictions.recommended_breaks)} cooling break${Math.round(predictions.recommended_breaks) !== 1 ? 's' : ''} during the session`,
      },
      expectedStressReduction: {
        before: stressBefore || null,
        after: Math.round(predictions.predicted_stress_level_after_sauna * 10) / 10,
        unit: 'stress level (1-10)',
      },
    };
  }
  
  /**
   * Get target statistics (useful for analytics/reporting)
   */
  getTargetStatistics(): TargetStatistics | null {
    return this.targetStats;
  }
  
  /**
   * Health check for the Python service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Example usage in Express.js route
/*
import express from 'express';
import { SaunaModelAdapter } from './sauna-model-adapter';

const app = express();
const modelAdapter = new SaunaModelAdapter('http://localhost:5000');

// Load statistics on startup
await modelAdapter.loadTargetStatistics('./models/target_statistics.json');

app.post('/api/sauna/recommend', async (req, res) => {
  try {
    const recommendation = await modelAdapter.predict(req.body);
    res.json(recommendation);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sauna/recommend-batch', async (req, res) => {
  try {
    const recommendations = await modelAdapter.predictBatch(req.body);
    res.json(recommendations);
  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sauna/health', async (req, res) => {
  const healthy = await modelAdapter.healthCheck();
  res.status(healthy ? 200 : 503).json({ healthy });
});
*/