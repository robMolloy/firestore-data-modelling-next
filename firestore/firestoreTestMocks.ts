import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export type TUserTodo = z.infer<typeof userTodoSchema>;
export type TUserTodoKey = keyof TUserTodo;

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

export const userTodo1 = {
  id: "id1",
  uid: "uid1",
  task: "uid1",
  completed: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TUserTodo;
