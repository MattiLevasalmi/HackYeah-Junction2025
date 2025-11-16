import { Router } from "express";
import { getModelHealth, getSuggestion, getSuggestionBatch } from "../controllers/suggestion.controller";

const router = Router();

router.post('/api/sauna/recommend', getSuggestion);
router.post('/api/sauna/recommend-batch', getSuggestionBatch);
router.get('/api/sauna/health', getModelHealth)

export default router;
