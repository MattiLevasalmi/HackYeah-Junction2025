import { Request, Response } from "express";

export const getUsers = (req: Request, res: Response) => {
  res.json({ users: [] });
};

export const createUser = (req: Request, res: Response) => {
  res.json({ message: "User created", user: req.body });
};
