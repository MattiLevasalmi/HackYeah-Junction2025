import { users, User } from "../db/client";
import { v4 as uuidv4 } from "uuid";

export const getAllUsers = (): User[] => {
  return users;
};

export const createNewUser = (name: string): User => {
  const newUser: User = {
    userId: uuidv4(),
    name
  };

  users.push(newUser);
  return newUser;
};
