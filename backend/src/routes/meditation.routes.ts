import { Router } from "express";
import { getMeditationRegime } from "../controllers/meditation.controller";

const router = Router();

router.get("/", getMeditationRegime);

export default router;
