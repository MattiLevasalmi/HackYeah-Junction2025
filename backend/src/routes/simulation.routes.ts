import { Router } from "express";
import { startSimulation, updateSimulation, getCurrentData, endSimulation } from "../controllers/simulation.controller";

const router = Router();

router.post("/start", startSimulation);
router.post("/:simulationId/update", updateSimulation);
router.get("/:simulationId/current", getCurrentData);
router.post("/:simulationId/end", endSimulation);

export default router;
