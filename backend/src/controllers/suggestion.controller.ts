import { Request, Response } from "express";
import { SaunaModelAdapter } from "../services/sauna-model-adapter";

const modelAdapter = new SaunaModelAdapter('http://localhost:5000');
(async () => {
  await modelAdapter.loadTargetStatistics('../../../ml-service/models/target_statistics.json');
})();

export const getSuggestion = async (req: Request, res: Response) => {
  try {
    const recommendation = await modelAdapter.predict(req.body);
    res.json(recommendation);
  } catch (error: any) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestionBatch = async (req: Request, res: Response) => {
  try {
    const recommendations = await modelAdapter.predictBatch(req.body);
    res.json(recommendations);
  } catch (error: any) {
    console.error('Batch prediction error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getModelHealth = async (req: Request, res: Response) => {
  const healthy = await modelAdapter.healthCheck();
  res.status(healthy ? 200 : 503).json({ healthy });
};
