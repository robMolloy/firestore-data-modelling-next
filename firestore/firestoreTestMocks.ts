import { Timestamp } from "firebase/firestore";

export const collectionNames = {
  userTodos: "userTodos",
};

export const userTodo1 = {
  id: "id1",
  uid: "uid1",
  task: "uid1",
  completed: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};
