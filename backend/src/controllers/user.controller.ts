import { Request, Response } from "express";
import { getAllUsers, createNewUser } from "../services/user.service";

export const getUsers = (req: Request, res: Response) => {
  const users = getAllUsers();
  res.json({ users });
};

export const createUser = (req: Request, res: Response) => {
  const { name, imagePath } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!imagePath) {
    return res.status(400).json({ message: "Image Path is required" });
  }

  const newUser = createNewUser(name, imagePath);
  res.status(201).json({ user: newUser });
};
