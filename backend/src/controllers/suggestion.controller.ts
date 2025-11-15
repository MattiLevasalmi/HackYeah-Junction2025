import { Request, Response } from "express";
import { generateSuggestions } from "../services/suggestion.service";

export const getSuggestions = async (req: Request, res: Response) => {
  res.json({ suggestions: await generateSuggestions() });
};
