import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export type TUserTodo = z.infer<typeof userTodoSchema>;
export type TUserTodoKey = keyof TUserTodo;

export const collectionNames = {
  userTodos: "userTodos",
  memberNotices: "memberNotices",
  todoGroups: "todoGroups",
  groupTodos: "groupTodos",
} as const;

export const timestampSchema = z.object({ seconds: z.number(), nanoseconds: z.number() });
export const userTodoSchema = z.object({
  id: z.string(),
  uid: z.string(),
  task: z.string(),
  completed: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const userTodo1 = {
  id: "id1",
  uid: "uid1",
  task: "uid1",
  completed: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
} as const satisfies TUserTodo;

export const memberNotice1 = { some: "data2" };
