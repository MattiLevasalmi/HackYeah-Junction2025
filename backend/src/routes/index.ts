import { Router } from "express";
import userRoutes from "./user.routes";
import suggestionRoutes from "./suggestion.routes";
import meditationRoutes from "./meditation.routes";
import simulationRoutes from "./simulation.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/suggestions", suggestionRoutes);
router.use("/meditation", meditationRoutes);
router.use("/simulation", simulationRoutes);

export default router;
