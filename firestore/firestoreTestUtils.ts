import { assertFails, initializeTestEnvironment } from "@firebase/rules-unit-testing";
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
  promise: Promise<unknown>,
  options?: { onError?: () => void },
) {
  return new Promise<void>(async (resolve) => {
    const hasFailed = await (async () => {
      try {
        const errorResult = await assertFails(promise);
        return ["permission-denied", "PERMISSION_DENIED"].includes(errorResult.code);
      } catch (error) {
        return false;
      }
    })();
    if (!hasFailed) {
      if (options?.onError) options.onError();
      else throw new Error("Expected request to fail, but it succeeded.");
    } else expect(hasFailed).toBe(true);
    resolve(undefined);
  });
}
