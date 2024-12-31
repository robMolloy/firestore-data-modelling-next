import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collectionNames } from "./firestoreTestMocks";
import { createTestEnvironment, setDefaultLogLevel } from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

describe(`firestore rules for ${collectionNames.todoGroups} collection`, () => {
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

  it(`init test from ${collectionNames.todoGroups}`, async () => {
    expect(true).toEqual(true);
  });
});
