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
}

const SIMULATED_TIME_MULTIPLIER = 30; // 1 real second = 30 simulated seconds
const MEASUREMENT_INTERVAL = 1000; // Take measurement every 1 second (real time)

const activeSimulations = new Map<string, ActiveSimulation>();

interface SimulationInput {
  targetTemperature?: number;
  targetHumidity?: number;
  duration?: number;
}

export const startSimulation = (input: SimulationInput = {}): string => {
  const targetTemperature = input.targetTemperature || 80; // Default to 80°C
  const targetHumidity = input.targetHumidity || 60; // Default to 60%
  const durationMinutes = input.duration || 30; // Default to 30 minutes
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
  };

  // Initial measurement at start
  const initialData: SimulationData = {
    timestamp: 0,
    temperature: 40,
    humidity: 30,
    duration: 0,
  };
  simulation.data.push(initialData);

  // Set up interval to take measurements every real second (= 30 simulated seconds)
  simulation.interval = setInterval(() => {
    const elapsedRealMs = Date.now() - startTime;
    const elapsedSimulatedSeconds = (elapsedRealMs / 1000) * SIMULATED_TIME_MULTIPLIER;
    const maxSimulatedSeconds = durationMinutes * 60;

    if (elapsedSimulatedSeconds >= maxSimulatedSeconds) {
      // Simulation complete
      endSimulationInternal(simulationId);
      return;
    }

    // Simulate gradual temperature and humidity increase from 40°C/30% to target values
    const progressRatio = elapsedSimulatedSeconds / maxSimulatedSeconds;
    const baseTemperature = 40 + progressRatio * (targetTemperature - 40);
    const temperatureVariation = (Math.random() - 0.5) * 2;
    const temperature = Math.round((baseTemperature + temperatureVariation) * 10) / 10;

    const baseHumidity = 30 + progressRatio * (targetHumidity - 30);
    const humidityVariation = (Math.random() - 0.5) * 3;
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

export const endSimulation = (simulationId: string) => {
  endSimulationInternal(simulationId);
  const simulation = activeSimulations.get(simulationId);
  return simulation
    ? {
        simulationId,
        totalMeasurements: simulation.data.length,
        data: simulation.data,
      }
    : null;
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
