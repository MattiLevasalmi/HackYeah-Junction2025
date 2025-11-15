import { Request, Response } from "express";
import * as simulationService from "../services/simulation.service";

export const startSimulation = (req: Request, res: Response) => {
  try {
    const { targetTemperature, targetHumidity, duration, userIds } = req.body;

    const simulationId = simulationService.startSimulation({
      targetTemperature,
      targetHumidity,
      duration,
      userIds,
    });

    res.json({
      status: "Simulation started",
      simulationId,
      targetTemperature: targetTemperature || 80,
      targetHumidity: targetHumidity || 60,
      duration: duration || 30,
      userIds: userIds || [],
      message: `Simulation started. Each real second equals 10 simulated seconds.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateSimulation = (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;
    const { targetTemperature, targetHumidity, duration } = req.body;

    const result = simulationService.updateSimulation(simulationId, {
      targetTemperature,
      targetHumidity,
      duration,
    });

    if (!result) {
      return res.status(404).json({ status: "Error", message: "Simulation not found" });
    }

    res.json({
      status: "Simulation updated",
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCurrentData = (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;

    const data = simulationService.getCurrentData(simulationId);
    if (data === null) {
      return res.status(404).json({ status: "Error", message: "Simulation not found" });
    }

    const status = simulationService.getSimulationStatus(simulationId);
    const latestData = data[data.length - 1] || null;

    res.json({
      simulationId,
      data: latestData,
      status,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const endSimulation = (req: Request, res: Response) => {
  try {
    const { simulationId } = req.params;

    const result = simulationService.endSimulation(simulationId);
    if (!result) {
      return res.status(404).json({ status: "Error", message: "Simulation not found" });
    }

    res.json({
      status: "Simulation ended",
      uploaded: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
