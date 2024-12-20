# Firestore data modelling

Add any relevant commands to package.json

## Setup

1.  Go to https://console.firebase.google.com
    1. create a project
    2. create a firestore and auth instance in your new project
2.  Fresh install NextJS project
3.  Setup linting
    1. install linting devDependencies with `npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier-plugin-tailwindcss`
    2. add <code>.eslintrc.json</code> file;
       ```
       {
         "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
         "rules": {
           "react/jsx-key": "error",
           "@typescript-eslint/no-unused-vars": [ "warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" } ],
           "eqeqeq": "error",
           "react-hooks/exhaustive-deps": 0,
           "react/no-unescaped-entities": 0,
           "@next/next/no-img-element": 0
         }
       }
       ```
    3. add `.prettierrc` file;
       ```
       {
         "tabWidth": 2,
         "useTabs": false,
         "printWidth": 100,
         "plugins": ["prettier-plugin-tailwindcss"]
       }
       ```
4.  Setup emulator;

    1. add firebase tools to the devDependencies with `npm i -D firebase-tools` which will enable firebase commands to be run with `node_modules/.bin/firebase`
    2. add the following firebase commands to `package.json` scripts, some of these will be used later on; (take note of the value after the `--project` flag, this is your `testEnvironmentProjectName` for the emulator instance, in this case `demo-firestore-data-modelling-tests`, and will need to match the test setup later)

    ```
      "firebase:init": "node_modules/.bin/firebase init",
      "firebase:emulators-start:offline": "node_modules/.bin/firebase --project demo-firestore-data-modelling-tests emulators:start --only auth,firestore",
      "firebase:deploy:rules": "node_modules/.bin/firebase deploy --only firestore:rules",
    ```

    3. run `npm run firebase:init` to initialise the project;

       1. select auth, firestore and emulators only in the CLI wizard
       2. select the existing project that's already been created in the console

    4. create a firestore folder in the root directory and move the `firestore.indexes.json` & `firestore.rules` and edit the `firebase.json` file accordingly

       1. you can stick to the default setup but have a look at the `firebase.json` file in this project if you're unsure

    5. run the `firebase:emulators-start:offline` script in the terminal with `npm run firebase:emulators-start:offline` and edit the tests so that they pass/fail to make sure the test environment is working properly

5.  Setup Jest

    1. initialise jest

       1. add testing packages to the devDependencies with `npm i -D jest ts-jest @firebase/rules-unit-testing`
       2. add the following to `package.json` scripts;

       ```
         "test": "jest --detectOpenHandles",
         "test:watch": "jest --watchAll --detectOpenHandles"
       ```

       3. add `jest.config` file with the following;

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

    2. Check the test environment is working properly

       1. create your first test file `initTestEnvironment.test.ts`

       ```
       describe("check test environment is working", () => {
        it("should pass", async () => {
          expect(true).toBeTruthy();
        });
       });
       ```

       2. run the `test:watch` script in the terminal with `npm run test:watch` and edit the tests so that they pass/fail to make sure the test environment is working properly

    3. setup first set of firestore tests

       1. Create `firestoreTestUtils.ts` file

       ```
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
       ```

       10. create `generalFirestoreTests.test.ts` file

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
           await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }), { onError: () => { throw new Error("setDoc to someRandomCollection allowed") } });
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

    4. run the following commands in separate terminals to check the current tests;
       1. `npm run firebase:emulators-start:offline`
       2. `npm run test:watch`

## Access own user's docs

```

```
