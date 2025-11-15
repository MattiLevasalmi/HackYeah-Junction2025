import { ObjectId } from "mongodb";
import { getUsersCollection, User } from "../db/client";

export const getAllUsers = async (): Promise<{
  userId: string;
  name: string;
  imagePath: string;
}[]> => {
  const col = getUsersCollection();
  const docs = await col
    .find(
      {},
      {
        projection: {
          firstName: 1,
          lastName: 1,
          imagePath: 1,
        },
      }
    )
    .toArray();

  return docs.map((u) => ({
    userId: u._id.toString(),
    name: u.firstName + ' ' + u.lastName,
    imagePath: u.imagePath,
  }));
};


export const createNewUser = async (
  firstName: string,
  lastName: string,
  imagePath: string
): Promise<User> => {
  const col = getUsersCollection();

  const now = new Date().toISOString();

  const newUser = {
    firstName,
    lastName,
    email: "",
    imagePath: imagePath ?? "",
    age: 0,
    sex: "",
    experienceLevel: "",
    preferences: {
      temperature: 0,
      humidity: 0,
      sessionDuration: 0,
      notifications: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  const res = await col.insertOne(newUser);

  return {
    ...newUser,
    userId: res.insertedId.toString(),
  } as User;
};

export const updateUser = async (
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    imagePath?: string;
    age?: number;
    sex?: string;
    experienceLevel?: string;
    preferences?: {
      temperature?: number;
      humidity?: number;
      sessionDuration?: number;
      notifications?: boolean;
    };
  }
): Promise<User | null> => {
  const col = getUsersCollection();
  const _id = new ObjectId(userId);

  const set: any = {};

  if (updates.firstName !== undefined) set.firstName = updates.firstName;
  if (updates.lastName !== undefined) set.lastName = updates.lastName;
  if (updates.imagePath !== undefined) set.imagePath = updates.imagePath;
  if (updates.age !== undefined) set.age = updates.age;
  if (updates.sex !== undefined) set.sex = updates.sex;
  if (updates.experienceLevel !== undefined) set.experienceLevel = updates.experienceLevel;

  // Nested preferences updates
  if (updates.preferences) {
    for (const key of Object.keys(updates.preferences)) {
      set[`preferences.${key}`] = (updates.preferences as any)[key];
    }
  }

  set.updatedAt = new Date().toISOString();

  if (Object.keys(set).length === 0) return null;

  const upd = await col.updateOne({ _id }, { $set: set });

  if (upd.matchedCount === 0) return null;

  const updated = await col.findOne({ _id });
  if (!updated) return null;

  return {
    ...updated,
    userId: updated._id.toString(),
  } as User;
};
