# Firestore data modelling

Add any relevant commands to package.json

## Setup

<ol>
  <li>a</li>
  <li>b</li>
  <li>c</li>
</ol>

- Setup emulator;

  - add firebase tools to the devDependencies with `npm i -D firebase-tools` which will enable `firebase` commands to be run with `node_modules/.bin/firebase`
  - add the following firebase commands to `package.json` scripts, some of these will be used later on; (take note of the value after the `--project` flag, this is your `testEnvironmentProjectName` for the emulator instance, in this case `demo-firestore-data-modelling-tests`, and will need to match the test setup later)
    ```
    "firebase:init": "node_modules/.bin/firebase init",
    "firebase:emulators-start:offline": "node_modules/.bin/firebase --project demo-firestore-data-modelling-tests emulators:start --only auth,firestore",
    "firebase:deploy:rules": "node_modules/.bin/firebase deploy --only firestore:rules",
    ```
  - run `npm run firebase:init` to initialise the project;
    - select auth, firestore and emulators only in the CLI wizard
    - select the existing project that's already been created in the console
  - create a firestore folder in the root directory and move the `firestore.indexes.json` & `firestore.rules` and edit the `firebase.json` file accordingly
    - you can stick to the default setup but have a look at the `firebase.json` in this project if you're unsure
  - run the `firebase:emulators-start:offline` script in the terminal with `npm run firebase:emulators-start:offline` and edit the tests so that they pass/fail to make sure the test environment is working properly.

- Setup Jest

  - add testing packages to the devDependencies with `npm i -D jest ts-jest @firebase/rules-unit-testing`
  - add the following to `package.json` scripts;

    ```
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watchAll --detectOpenHandles"
    ```

  - add `jest.config` file with the following;

    ```
    // jest.config.js
    module.exports = {
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    };
    ```

  - create your first test file `initTestEnvironment.test.ts`
    ```
    describe("check test environment is working", () => {
      it("should pass", async () => {
        expect(true).toBeTruthy();
      });
    });
    ```
  - run the `test:watch` script in the terminal with `npm run test:watch` and edit the tests so that they pass/fail to make sure the test environment is working properly.

- Check that the emulator is working with jest by doing the following;

  - create two new files;

    - `firestoreTestUtils.ts`

      ```
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
      ```

    - `generalFirestoreTests.test.ts`

      ```
      import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
      import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
      import {
        createTestEnvironment,
        expectFirestorePermissionDenied,
        setDefaultLogLevel,
      } from "./firestoreTestUtils";

      let testEnv: RulesTestEnvironment;

      describe("firestore rules for a randomCollection", () => {
        beforeAll(async () => {
          setDefaultLogLevel();
          testEnv = await createTestEnvironment();
        });
        beforeEach(async () => {
          await testEnv.clearFirestore();
        });
        afterAll(async () => {
          await testEnv.cleanup();
        });

        it("should not allow read access to a random collection", async () => {
          await testEnv.withSecurityRulesDisabled(async (context) => {
            const docRef = doc(context.firestore(), "someRandomCollection", "id1");
            await setDoc(docRef, { some: "data" });
          });

          const unauthedDb = testEnv.unauthenticatedContext().firestore();
          const docRef = doc(unauthedDb, "someRandomCollection", "id1");
          await expectFirestorePermissionDenied(getDoc(docRef));
        });

        it("should not allow create access to a random collection", async () => {
          const unauthedDb = testEnv.unauthenticatedContext().firestore();
          const docRef = doc(unauthedDb, "someRandomCollection", "id1");
          await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }));
        });

        it("should not allow update access to a random collection", async () => {
          await testEnv.withSecurityRulesDisabled(async (context) => {
            const docRef = doc(context.firestore(), "someRandomCollection", "id1");
            await setDoc(docRef, { some: "data" });
          });

          const unauthedDb = testEnv.unauthenticatedContext().firestore();
          const docRef = doc(unauthedDb, "someRandomCollection", "id1");
          await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }));
          await expectFirestorePermissionDenied(
            setDoc(docRef, { more: "data" }, { merge: true })
          );
        });

        it("should not allow delete access to a random collection", async () => {
          await testEnv.withSecurityRulesDisabled(async (context) => {
            const docRef = doc(context.firestore(), "someRandomCollection", "id1");
            await setDoc(docRef, { some: "data" });
          });

          const unauthedDb = testEnv.unauthenticatedContext().firestore();
          const docRef = doc(unauthedDb, "someRandomCollection", "id1");
          await expectFirestorePermissionDenied(deleteDoc(docRef));
        });
      });
      ```

  - run the following commands in separate terminals; `npm run test:watch` & `npm run firebase:emulators-start:offline`

## Access own user's docs
