interface SimulationData {
  timestamp: number;
  temperature: number;
  humidity: number;
  duration: number;
}

interface ActiveSimulation {
  id: string;
  startTime: number;
  data: SimulationData[];
  isRunning: boolean;
  interval: NodeJS.Timeout | null;
  targetTemperature: number;
  targetHumidity: number;
  targetDurationMinutes: number;
  userIds: string[];
}

const SIMULATED_TIME_MULTIPLIER = 10; // 1 real second = 10 simulated seconds
const MEASUREMENT_INTERVAL = 1000; // Take measurement every 1 second (real time)

const activeSimulations = new Map<string, ActiveSimulation>();

interface SimulationInput {
  targetTemperature?: number;
  targetHumidity?: number;
  duration?: number;
  userIds?: string[];
}

export const startSimulation = (input: SimulationInput = {}): string => {
  const targetTemperature = input.targetTemperature || 80; // Default to 80°C
  const targetHumidity = input.targetHumidity || 60; // Default to 60%
  const durationMinutes = input.duration || 30; // Default to 30 minutes
  const userIds = input.userIds || []; // User IDs for session tracking
  const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  const simulation: ActiveSimulation = {
    id: simulationId,
    startTime,
    data: [],
    isRunning: true,
    interval: null,
    targetTemperature,
    targetHumidity,
    targetDurationMinutes: durationMinutes,
    userIds,
  };

  // Initial measurement at start
  const initialData: SimulationData = {
    timestamp: 0,
    temperature: 40,
    humidity: 30,
    duration: 0,
  };
  simulation.data.push(initialData);

  // Set up interval to take measurements every real second (= 10 simulated seconds)
  simulation.interval = setInterval(() => {
    const elapsedRealMs = Date.now() - startTime;
    const elapsedSimulatedSeconds = (elapsedRealMs / 1000) * SIMULATED_TIME_MULTIPLIER;
    const maxSimulatedSeconds = durationMinutes * 60;

    if (elapsedSimulatedSeconds >= maxSimulatedSeconds) {
      // Simulation complete
      endSimulationInternal(simulationId);
      return;
    }

    const heatUpDuration = 5 * 60; // 5 minutes in simulated seconds
    const progressRatio = Math.min(1, elapsedSimulatedSeconds / heatUpDuration);

    // Temperature
    const baseTemperature = 40 + progressRatio * (targetTemperature - 40);
    const temperatureVariation = (Math.random() - 0.5) * (progressRatio < 1 ? 2 : 1);
    const temperature = Math.round((baseTemperature + temperatureVariation) * 10) / 10;

    // Humidity
    const baseHumidity = 30 + progressRatio * (targetHumidity - 30);
    const humidityVariation = (Math.random() - 0.5) * (progressRatio < 1 ? 3 : 1.5);
    const humidity = Math.max(0, Math.min(100, Math.round((baseHumidity + humidityVariation) * 10) / 10));

    const measurement: SimulationData = {
      timestamp: elapsedSimulatedSeconds,
      temperature,
      humidity,
      duration: elapsedSimulatedSeconds,
    };

    simulation.data.push(measurement);
  }, MEASUREMENT_INTERVAL);

  activeSimulations.set(simulationId, simulation);
  return simulationId;
};

export const getCurrentData = (simulationId: string): SimulationData[] | null => {
  const simulation = activeSimulations.get(simulationId);
  if (!simulation) return null;
  return simulation.data;
};

export const getSimulationStatus = (simulationId: string) => {
  const simulation = activeSimulations.get(simulationId);
  if (!simulation) return null;

  const elapsedRealMs = Date.now() - simulation.startTime;
  const elapsedSimulatedSeconds = (elapsedRealMs / 1000) * SIMULATED_TIME_MULTIPLIER;

  return {
    simulationId,
    isRunning: simulation.isRunning,
    elapsedSimulatedSeconds,
    totalMeasurements: simulation.data.length,
    targetTemperature: simulation.targetTemperature,
    targetHumidity: simulation.targetHumidity,
    targetDuration: simulation.targetDurationMinutes,
  };
};

const endSimulationInternal = (simulationId: string) => {
  const simulation = activeSimulations.get(simulationId);
  if (!simulation) return;

  simulation.isRunning = false;
  if (simulation.interval) {
    clearInterval(simulation.interval);
    simulation.interval = null;
  }
};

const calculateAverages = (data: SimulationData[]): { avgTemp: number; avgHumidity: number } => {
  if (data.length === 0) return { avgTemp: 0, avgHumidity: 0 };
  
  const sumTemp = data.reduce((acc, d) => acc + d.temperature, 0);
  const sumHumidity = data.reduce((acc, d) => acc + d.humidity, 0);
  
  return {
    avgTemp: Math.round((sumTemp / data.length) * 10) / 10,
    avgHumidity: Math.round((sumHumidity / data.length) * 10) / 10,
  };
};

const saveSessionToDb = async (
  userIds: string[],
  averageTemperature: number,
  averageHumidity: number,
  duration: number
): Promise<void> => {
  try {
    const { getSessionsCollection } = await import("../db/client");
    const sessionsCol = getSessionsCollection();
    
    // Save a session record for each userId
    for (const userId of userIds) {
      await sessionsCol.insertOne({
        userId,
        averageTemperature,
        averageHumidity,
        duration,
        createdAt: new Date(),
      } as any);
    }
  } catch (error) {
    console.error("✗ Failed to save session to database:", error);
  }
};

export const endSimulation = (simulationId: string) => {
  endSimulationInternal(simulationId);
  const simulation = activeSimulations.get(simulationId);
  
  if (!simulation) {
    return null;
  }

  // Calculate averages and duration
  const { avgTemp, avgHumidity } = calculateAverages(simulation.data);
  const durationSeconds = simulation.targetDurationMinutes * 60;

  // Save session to database for each user
  if (simulation.userIds.length > 0) {
    saveSessionToDb(simulation.userIds, avgTemp, avgHumidity, durationSeconds).catch((err) => {
      console.error("Failed to save session:", err);
    });
  }

  return {
    simulationId,
    totalMeasurements: simulation.data.length,
    averageTemperature: avgTemp,
    averageHumidity: avgHumidity,
    duration: durationSeconds,
    sessionsSaved: simulation.userIds,
  };
};

export const updateSimulation = (
  simulationId: string,
  updates: { targetTemperature?: number; targetHumidity?: number; duration?: number }
) => {
  const simulation = activeSimulations.get(simulationId);
  if (!simulation) return null;

  if (updates.targetTemperature !== undefined) {
    simulation.targetTemperature = updates.targetTemperature;
  }
  if (updates.targetHumidity !== undefined) {
    simulation.targetHumidity = updates.targetHumidity;
  }
  if (updates.duration !== undefined) {
    simulation.targetDurationMinutes = updates.duration;
  }

  return {
    simulationId,
    targetTemperature: simulation.targetTemperature,
    targetHumidity: simulation.targetHumidity,
    targetDurationMinutes: simulation.targetDurationMinutes,
  };
};
