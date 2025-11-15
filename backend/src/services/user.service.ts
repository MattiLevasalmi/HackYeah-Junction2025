import { getUsersCollection, User } from "../db/client";
import { v4 as uuidv4 } from "uuid";

export const getAllUsers = async (): Promise<User[]> => {
  const col = getUsersCollection();
  const docs = await col.find({}).toArray();
  return docs as User[];
};

export const createNewUser = async (name: string, imagePath: string): Promise<User> => {
  const col = getUsersCollection();
  const newUser: User = {
    userId: uuidv4(),
    name,
    imagePath,
    age: 0,
    gender: "",
  } as User;

  const res = await col.insertOne(newUser as any);
  // return the user including the generated _id as string
  return { ...newUser, _id: res.insertedId.toString() } as User;
};

export const updateUser = async (
  userId: string,
  updates: { name?: string; imagePath?: string; age?: number; gender?: string }
): Promise<User | null> => {
  const col = getUsersCollection();

  // Build set object only with defined fields
  const set: any = {};
  if (updates.name !== undefined) set.name = updates.name;
  if (updates.imagePath !== undefined) set.imagePath = updates.imagePath;
  if (updates.age !== undefined) set.age = updates.age;
  if (updates.gender !== undefined) set.gender = updates.gender;

  if (Object.keys(set).length === 0) return null;

  const upd = await col.updateOne({ userId }, { $set: set });
  if (upd.matchedCount === 0) return null;
  const updated = await col.findOne({ userId });
  return (updated as User) || null;
};
