import { Request, Response } from "express";

export const getSuggestions = (req: Request, res: Response) => {
  res.json({ suggestions: [] });
};
