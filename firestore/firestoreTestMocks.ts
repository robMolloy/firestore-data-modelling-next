import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const collectionNames = {
  userTodos: "userTodos",
};

export const userTodoSchema = z.object({
  id: z.string(),
  uid: z.string(),
  task: z.string(),
  completed: z.boolean(),
  createdAt: z.object({ seconds: z.number(), nanoseconds: z.number() }),
  updatedAt: z.object({ seconds: z.number(), nanoseconds: z.number() }),
});

export const userTodo1: z.infer<typeof userTodoSchema> = {
  id: "id1",
  uid: "uid1",
  task: "uid1",
  completed: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};
