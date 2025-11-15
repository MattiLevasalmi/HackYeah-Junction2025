import { Router } from "express";
import userRoutes from "./user.routes";
import suggestionRoutes from "./suggestion.routes";
import meditationRoutes from "./meditation.routes";
import simulationRoutes from "./simulation.routes";
import saunaRoutes from "./sauna.routes";


const router = Router();

router.use("/users", userRoutes);
router.use("/suggestions", suggestionRoutes);
router.use("/meditation", meditationRoutes);
router.use("/simulation", simulationRoutes);
router.use("/sauna", saunaRoutes);

export default router;
