import { Request, Response } from "express";
import { getAllUsers, createNewUser, updateUser } from "../services/user.service";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();

    // Already trimmed by service: { userId, firstName, lastName, imagePath }
    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, imagePath } = req.body;

    if (!firstName) {
      return res.status(400).json({ message: "firstName is required" });
    }
    if (!lastName) {
      return res.status(400).json({ message: "lastName is required" });
    }
    if (!imagePath) {
      return res.status(400).json({ message: "imagePath is required" });
    }

    const newUser = await createNewUser(firstName, lastName, imagePath);

    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      imagePath,
      age,
      sex,
      experienceLevel,
      preferences,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId param is required" });
    }

    const updates: any = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (imagePath !== undefined) updates.imagePath = imagePath;
    if (age !== undefined) updates.age = Number(age);
    if (sex !== undefined) updates.sex = sex;
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;

    // Preferences are nested
    if (preferences && typeof preferences === "object") {
      updates.preferences = {};

      if (preferences.temperature !== undefined)
        updates.preferences.temperature = preferences.temperature;
      if (preferences.humidity !== undefined)
        updates.preferences.humidity = preferences.humidity;
      if (preferences.sessionDuration !== undefined)
        updates.preferences.sessionDuration = preferences.sessionDuration;
      if (preferences.notifications !== undefined)
        updates.preferences.notifications = preferences.notifications;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await updateUser(userId, updates);
    if (!updated)
      return res.status(404).json({ message: "User not found" });

    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
