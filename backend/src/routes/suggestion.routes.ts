import { Router } from "express";
import { getSuggestions } from "../controllers/suggestion.controller";

const router = Router();

router.get("/", getSuggestions);

export default router;
