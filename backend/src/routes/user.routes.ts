import { Router } from "express";
import { getUsers, createUser, updateUserProfile } from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:userId", updateUserProfile);

export default router;
