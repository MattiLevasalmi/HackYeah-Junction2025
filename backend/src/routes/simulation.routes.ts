import { Router } from "express";
import { startSimulation, getCurrentData, endSimulation } from "../controllers/simulation.controller";

const router = Router();

router.post("/start", startSimulation);
router.get("/current", getCurrentData);
router.post("/end", endSimulation);

export default router;
