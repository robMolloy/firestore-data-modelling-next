import {
  assertFails,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setLogLevel } from "firebase/firestore";
import { readFileSync } from "fs";
import path from "path";

export const setDefaultLogLevel = () => setLogLevel("error");

export const createTestEnvironment = async () => {
  return initializeTestEnvironment({
    projectId: "demo-firestore-data-modelling-tests",
    firestore: {
      rules: readFileSync(path.resolve(__dirname, "./firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
};

export async function expectFirestorePermissionDenied(
  promise: Promise<unknown>
) {
  return new Promise<void>(async (resolve) => {
    const errorResult = await assertFails(promise);
    expect(
      ["permission-denied", "PERMISSION_DENIED"].includes(errorResult.code)
    ).toBe(true);
    resolve(undefined);
  });
}
