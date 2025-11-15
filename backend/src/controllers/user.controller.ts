import { Request, Response } from "express";
import { getAllUsers, createNewUser, updateUser } from "../services/user.service";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, imagePath } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!imagePath) {
      return res.status(400).json({ message: "Image Path is required" });
    }

    const newUser = await createNewUser(name, imagePath);
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, imagePath, age, gender } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId param is required" });
    }

    const updates: { name?: string; imagePath?: string; age?: number; gender?: string } = {};
    if (name !== undefined) updates.name = name;
    if (imagePath !== undefined) updates.imagePath = imagePath;
    if (age !== undefined) updates.age = Number(age);
    if (gender !== undefined) updates.gender = gender;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await updateUser(userId, updates);
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
  }
};
