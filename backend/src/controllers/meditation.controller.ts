import { Request, Response } from "express";

export const getMeditationRegime = (req: Request, res: Response) => {
  res.json({ regime: [] });
};
