import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { collectionNames, groupTodo1, TGroupTodoKey, todoGroup1 } from "./firestoreTestMocks";
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

describe(`firestore rules for ${collectionNames.groupTodos} collection`, () => {
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

  it(`GT.C.0.A should allow create access if user is authenticated and data is valid to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });

    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const createDocResult = await isRequestGranted(setDoc(docRef, creatifyDoc(groupTodo1)));

    expect(createDocResult.permissionGranted).toBe(true);
  });

  it(`GT.C.1.D should deny create access if missing key to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const createDocKeys = Object.keys(creatifyDoc(groupTodo1)) as TGroupTodoKey[];

    const missingKeyDocs = createDocKeys.map((key) => removeKey(key, creatifyDoc(groupTodo1)));
    const promises = missingKeyDocs.map((todo) => isRequestDenied(setDoc(docRef, todo)));
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`GT.C.2.D should deny create access if additional key to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const additionalKeyDoc = { ...creatifyDoc(groupTodo1), another: "key" };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`GT.C.3.D should deny access if getIncomingId() != incoming.id to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const additionalKeyDoc = { ...creatifyDoc(groupTodo1), id: `not_${groupTodo1.id}` };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`GT.C.4.D should deny access if isNotNow(incoming.createdAt) to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, todoGroup1.id);

    const notNowCreatedAtDoc = { ...creatifyDoc(todoGroup1), createdAt: getNotNowTimestamp() };
    const result = await isRequestDenied(setDoc(docRef, notNowCreatedAtDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`GT.C.5.D should deny access if isNotNow(incoming.updatedAt) to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const notNowUpdatedAtDoc = { ...creatifyDoc(groupTodo1), updatedAt: getNotNowTimestamp() };
    const result = await isRequestDenied(setDoc(docRef, notNowUpdatedAtDoc));

    expect(result.permissionDenied).toBe(true);
  });

  it(`GT.C.6.D.wrongUser should deny create access if auth.uid not in incoming.uids to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const authedDb = testEnv.authenticatedContext(`not_${todoGroup1.uids[0]}`).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const createDocResult = await isRequestDenied(setDoc(docRef, creatifyDoc(groupTodo1)));

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`GT.C.6.D.unauth should deny create access if user is unauthenticated to ${collectionNames.groupTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.todoGroups, todoGroup1.id);
      await setDoc(docRef, todoGroup1);
    });
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, collectionNames.groupTodos, groupTodo1.id);

    const createDocResult = await isRequestDenied(setDoc(docRef, creatifyDoc(groupTodo1)));

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`GT.C.6.D.missingTodoGroup should deny create access in ${collectionNames.groupTodos} if related todoGroup doesn't exist`, async () => {
    const authedDb = testEnv.authenticatedContext(todoGroup1.uids[0]).firestore();
    const docRef = doc(authedDb, collectionNames.groupTodos, groupTodo1.id);

    const createDocResult = await isRequestDenied(setDoc(docRef, creatifyDoc(groupTodo1)));

    expect(createDocResult.permissionDenied).toBe(true);
  });
});
