import { getUsersCollection, User } from "../db/client";

type PreferenceKey = "temperature" | "humidity" | "sessionDuration" | "notifications";

// ----------------------------------------
// GET ONE USER
// ----------------------------------------
export const getOneUser = async (userId: string): Promise<{
  email?: string;
  firstName?: string;
  lastName?: string;
  imagePath?: string;
  age?: number;
  sex?: string;
  experienceLevel?: string;
}> => {
  const col = getUsersCollection();
  const doc = await col.findOne({ _id: userId });  // <-- FIXED
  return {
    email: doc?.email,
    firstName: doc?.firstName,
    lastName: doc?.lastName,
    imagePath: doc?.imagePath,
    age: doc?.age,
    sex: doc?.sex,
    experienceLevel: doc?.experienceLevel,
  };
};

// ----------------------------------------
// GET ALL USERS
// ----------------------------------------
export const getAllUsers = async (): Promise<
  { userId: string; name: string; imagePath: string }[]
> => {
  const col = getUsersCollection();
  const docs = await col
    .find(
      {},
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          imagePath: 1,
        },
      }
    )
    .toArray();

  return docs.map((u) => ({
    userId: u._id, // <-- already a string
    name: `${u.firstName} ${u.lastName}`,
    imagePath: u.imagePath ?? "",
  }));
};

// ----------------------------------------
// CREATE NEW USER (STRING ID)
// ----------------------------------------
export const createNewUser = async (
  firstName: string,
  lastName: string,
  imagePath: string
): Promise<User> => {
  const col = getUsersCollection();
  const now = new Date().toISOString();

  const newUser: User = {
    _id: crypto.randomUUID(), // <-- STRING FIX
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

  await col.insertOne(newUser);
  return newUser;
};

// ----------------------------------------
// UPDATE USER (string ID)
// ----------------------------------------
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

  const set: Record<string, any> = {};

  if (updates.firstName !== undefined) set.firstName = updates.firstName;
  if (updates.lastName !== undefined) set.lastName = updates.lastName;
  if (updates.imagePath !== undefined) set.imagePath = updates.imagePath;
  if (updates.age !== undefined) set.age = updates.age;
  if (updates.sex !== undefined) set.sex = updates.sex;
  if (updates.experienceLevel !== undefined) set.experienceLevel = updates.experienceLevel;

  // Nested preferences
  if (updates.preferences) {
    for (const key of Object.keys(updates.preferences) as PreferenceKey[]) {
      set[`preferences.${key}`] = updates.preferences[key];
    }
  }

  set.updatedAt = new Date().toISOString();

  if (Object.keys(set).length === 0) return null;

  // FIXED: use string ID
  const upd = await col.updateOne({ _id: userId }, { $set: set });

  if (upd.matchedCount === 0) return null;

  const updated = await col.findOne({ _id: userId });
  return updated as User | null;
};
