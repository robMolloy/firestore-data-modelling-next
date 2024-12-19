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
    - Select firestore, auth and emulators only in the CLI wizard
    - Select the existing project that's already been created in the console
  - Move the `firestore.indexes.json` & `firestore.rules` and edit the `firebase.json` file accordingly

## Access own user's docs
