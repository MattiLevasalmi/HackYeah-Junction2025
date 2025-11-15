import { Request, Response } from "express";

export const startSimulation = (req: Request, res: Response) => {
  res.json({ status: "Simulation started" });
};

export const getCurrentData = (req: Request, res: Response) => {
  res.json({ data: {} });
};

export const endSimulation = (req: Request, res: Response) => {
  res.json({ status: "Simulation ended", uploaded: true });
};
