import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { collectionNames, todoGroup1, TTodoGroupKey } from "./firestoreTestMocks";
import {
  createTestEnvironment,
  creatifyDoc,
  getNotNowTimestamp,
  isRequestDenied,
  isRequestGranted,
  removeKey,
  setDefaultLogLevel,
} from "./firestoreTestUtils";
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

  it(`TG.C.0.A should allow create access if user is authenticated and data is valid to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const createDocResult = await isRequestGranted(setDoc(docRef, creatifyDoc(todoGroup1)));

    expect(createDocResult.permissionGranted).toBe(true);
  });

  it(`TG.C.1.D should deny create access if missing key to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const createUserTodoKeys = Object.keys(creatifyDoc(todoGroup1)) as TTodoGroupKey[];

    const missingKeyDocs = createUserTodoKeys.map((key) => removeKey(key, creatifyDoc(todoGroup1)));
    const promises = missingKeyDocs.map((todo) => isRequestDenied(setDoc(docRef, todo)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`TG.C.2.D should deny create access if additional key to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const additionalKeyDoc = { ...creatifyDoc(todoGroup1), another: "key" };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`TG.C.3.D should deny access if getIncomingId() != incoming.id to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const additionalKeyDoc = { ...creatifyDoc(todoGroup1), id: `not_${todoGroup1.id}` };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`TG.C.4.D should deny access if isNotNow(incoming.createdAt) to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const incorrectCreatedAtUserTodo = {
      ...creatifyDoc(todoGroup1),
      createdAt: getNotNowTimestamp(),
    };
    const result = await isRequestDenied(setDoc(docRef, incorrectCreatedAtUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`TG.C.5.D should deny access if isNotNow(incoming.updatedAt) to ${collectionNames.todoGroups}`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.todoGroups, todoGroup1.id);

    const incorrectUpdatedAtUserTodo = {
      ...creatifyDoc(todoGroup1),
      updatedAt: getNotNowTimestamp(),
    };
    const result = await isRequestDenied(setDoc(docRef, incorrectUpdatedAtUserTodo));

    expect(result.permissionDenied).toBe(true);
  });
});
