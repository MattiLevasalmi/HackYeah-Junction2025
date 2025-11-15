import { Request, Response } from "express";
import { getAllUsers, createNewUser } from "../services/user.service";

export const getUsers = (req: Request, res: Response) => {
  const users = getAllUsers();
  res.json({ users });
};

export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const newUser = createNewUser(name);
  res.status(201).json({ user: newUser });
};
