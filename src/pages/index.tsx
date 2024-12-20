import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <ol>
      <li>
        Go to https://console.firebase.google.com
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
            <code>
              npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
              prettier-plugin-tailwindcss
            </code>
          </li>
          <li>
            add `.eslintrc.json` file;
            <pre>
              &#123; "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
              "rules": &#123; "react/jsx-key": "error", "@typescript-eslint/no-unused-vars": [
              "warn", &#123; "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" &#125; ],
              "eqeqeq": "error", "react-hooks/exhaustive-deps": 0, "react/no-unescaped-entities": 0,
              "@next/next/no-img-element": 0 &#125; &#125;
            </pre>
          </li>
          <li>
            add <code>.prettierrc</code> file;
            <pre>
              &#123; "tabWidth": 2, "useTabs": false, "printWidth": 100, "plugins":
              ["prettier-plugin-tailwindcss"] &#125;
            </pre>
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
              "firebase:emulators-start:offline": "node_modules/.bin/firebase --project
              demo-firestore-data-modelling-tests emulators:start --only auth,firestore",
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
    </ol>
  );
}
