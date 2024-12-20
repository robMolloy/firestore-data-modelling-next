# Firestore data modelling

Add any relevant commands to package.json

## Setup

1. Main Item 1
   1. Sub Item 1
   2. Sub Item 2
      1. Nested Item a
      2. Nested Item b
      3. Nested Item c
2. Main Item 2

   1. Sub Item 1
      1. Nested Item a
      2. Nested Item b
   2. Sub Item 2

3. Go to https://console.firebase.google.com
4. asdx
5.

<ol>
      <li>
        <ol type="a">
          <li>create a project</li>
          <li>create a firestore and auth instance in your new project</li>
        </ol>
      </li>
      <li>Fresh install NextJS project</li>
      <li>
        Setup linting files
        <ol type="a">
          <li>
            install linting devDependencies with{" "}
            <code>npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier-plugin-tailwindcss</code>
          </li>
          <li>
            add <code>.eslintrc.json</code> file;
            <pre>{
    "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
    "rules": { 
      "react/jsx-key": "error", 
      "@typescript-eslint/no-unused-vars": [ "warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" } ],
      "eqeqeq": "error", 
      "react-hooks/exhaustive-deps": 0, 
      "react/no-unescaped-entities": 0,
      "@next/next/no-img-element": 0 
    }
  }</pre>
          </li>
          <li>
            add <code>.prettierrc</code> file;
            <pre>{ 
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
};</pre>
          </li>
        </ol>
      </li>
      <li>
        Setup emulator;
        <ol type="a">
          <li>
            add firebase tools to the devDependencies with <code>npm i -D firebase-tools</code>{" "}
            which will enable firebase commands to be run with{" "}
            <code>node_modules/.bin/firebase</code>
          </li>
          <li>
            add the following firebase commands to <code>package.json</code> scripts, some of these
            will be used later on; (take note of the value after the <code>--project</code> flag,
            this is your <code>testEnvironmentProjectName</code> for the emulator instance, in this
            case <code>demo-firestore-data-modelling-tests</code>, and will need to match the test
            setup later)
            <pre>
  "firebase:init": "node_modules/.bin/firebase init",
  "firebase:emulators-start:offline": "node_modules/.bin/firebase --project demo-firestore-data-modelling-tests emulators:start --only auth,firestore",
  "firebase:deploy:rules": "node_modules/.bin/firebase deploy --only firestore:rules",
</pre>
          </li>
          <li>
            run <code>npm run firebase:init</code> to initialise the project;
            <ol type="i">
              <li>select auth, firestore and emulators only in the CLI wizard</li>
              <li>select the existing project that's already been created in the console</li>
            </ol>
          </li>
          <li>
            create a firestore folder in the root directory and move the{" "}
            <code>firestore.indexes.json</code> & <code>firestore.rules</code> and edit the{" "}
            <code>firebase.json</code> file accordingly
            <ol type="i">
              <li>
                you can stick to the default setup but have a look at the <code>firebase.json</code>{" "}
                file in this project if you're unsure
              </li>
            </ol>
          </li>
          <li>
            run the <code>firebase:emulators-start:offline</code> script in the terminal with{" "}
            <code>npm run firebase:emulators-start:offline</code> and edit the tests so that they
            pass/fail to make sure the test environment is working properly
          </li>
        </ol>
      </li>
      <li>
        Setup Jest
        <ol>
          <li>
            add testing packages to the devDependencies with{" "}
            <code>npm i -D jest ts-jest @firebase/rules-unit-testing</code>
          </li>
          <li>
            add the following to `package.json` scripts;
            <pre>
  "test": "jest --detectOpenHandles",
  "test:watch": "jest --watchAll --detectOpenHandles"
</pre>
          </li>
          <li>
            add <code>jest.config</code> file with the following;{" "}
            <pre>
              {`// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};`}
            </pre>
          </li>
          <li>
            create your first test file <code>initTestEnvironment.test.ts</code>
            <pre>{`describe("check test environment is working", () => {
  it("should pass", async () => {
    expect(true).toBeTruthy();
  });
});`}</pre>
          </li>
          <li>
            run the <code>test:watch</code> script in the terminal with{" "}
            <code>npm run test:watch</code> and edit the tests so that they pass/fail to make sure
            the test environment is working properly.
          </li>
        </ol>
      </li>
      <li>
        Check that the emulator is working with jest by doing the following;{" "}
        <ol>
          <li>
            create two new files;
            <ol>
              <li>
                <code>firestoreTestUtils.ts</code>
                <pre>
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
rules: readFileSync(path.resolve(\_\_dirname, "./firestore.rules"), "utf8"),
host: "127.0.0.1",
port: 8080,
},
});
};

export async function expectFirestorePermissionDenied(
promise: Promise&lt;unknown>
) {
return new Promise&lt;void>(async (resolve) => {
const errorResult = await assertFails(promise);
expect(
["permission-denied", "PERMISSION_DENIED"].includes(errorResult.code)
).toBe(true);
resolve(undefined);
});
}

</pre>
              </li>
              <li>
                <code>generalFirestoreTests.test.ts</code>
                <pre>import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
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
});`}</pre>

</li>
</ol>
</li>
<li>
run the following commands in separate terminals;
<ol>
<li>
<code>npm run test:watch</code>
</li>
<li>
<code>npm run firebase:emulators-start:offline</code>
</li>
</ol>
</li>
</ol>
</li>
</ol>

## Access own user's docs
