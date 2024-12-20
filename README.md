# Firestore data modelling

Add any relevant commands to package.json

## Setup

- Go to https://console.firebase.google.com

  - create a project
  - create a firestore and auth instance in your new project

- Fresh install NextJS project

- Setup emulator;

  - `npm i -D firebase-tools`
  - `node_modules/.bin/firebase init`
    - Select auth, firestore and emulators only in the CLI wizard
    - Select the existing project that's already been created in the console
  - Move the `firestore.indexes.json` & `firestore.rules` to the firestore folder and edit the `firebase.json` file accordingly

- Setup Jest
  - `npm i -D jest ts-jest @firebase/rules-unit-testing`
  - add `jest.config` file with the following;

```
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
```

Check jest

## Access own user's docs
