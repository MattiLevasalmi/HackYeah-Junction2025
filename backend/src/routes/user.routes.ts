import { Router } from "express";
import { getUsers, createUser, updateUserProfile, getUser } from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);
router.get("/:userId", getUser)
router.post("/", createUser);
router.patch("/:userId", updateUserProfile);

export default router;
