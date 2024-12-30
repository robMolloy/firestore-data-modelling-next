import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collectionNames, userTodo1 } from "./firestoreTestMocks";
import {
  setDefaultLogLevel,
  createTestEnvironment,
  isRequestDenied,
  isRequestGranted,
  creatifyDoc,
  removeKey,
  getNotNowTimestamp,
} from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

// const updateUserTodo = fsUtils.updatify(userTodo1);
type TUserTodoKey = keyof typeof userTodo1;

describe(`firestore rules for ${collectionNames.userTodos} collection`, () => {
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

  it(`should allow get access if auth.uid == existing.uid from ${collectionNames.userTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.userTodos, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(unauthedDb, collectionNames.userTodos, userTodo1.id);
    const response = await isRequestGranted(getDoc(docRef));
    expect(response.permissionGranted).toBe(true);
    expect(response.data).toEqual(userTodo1);
  });

  it(`should deny get access if unauthenticated user requests from ${collectionNames.userTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.userTodos, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, collectionNames.userTodos, userTodo1.id);
    const response = await isRequestGranted(getDoc(docRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`should deny get access if auth.uid != existing.uid from ${collectionNames.userTodos}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.userTodos, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(unauthedDb, collectionNames.userTodos, userTodo1.id);
    const response = await isRequestGranted(getDoc(docRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`UT.C.0.A should allow create access if user is authenticated and data is valid to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const createDocResult = await isRequestGranted(setDoc(docRef, creatifyDoc(userTodo1)));

    expect(createDocResult.permissionGranted).toBe(true);
  });

  it(`UT.C.1.D should deny create access if missing key to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const createUserTodoKeys = Object.keys(creatifyDoc(userTodo1)) as TUserTodoKey[];
    const missingKeyUserTodos = createUserTodoKeys.map((key) =>
      removeKey(key, creatifyDoc(userTodo1)),
    );
    const promises = missingKeyUserTodos.map((todo) => {
      return isRequestDenied(setDoc(docRef, todo));
    });
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`UT.C.2.D should deny create access if missing key to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const additionalKeyUserTodo = { ...creatifyDoc(userTodo1), another: "key" };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`UT.C.3.D should deny access if getIncomingId() != incoming.id to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const additionalKeyUserTodo = { ...creatifyDoc(userTodo1), id: `not_${userTodo1.id}` };
    const result = await isRequestDenied(setDoc(docRef, additionalKeyUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`UT.C.4.D should deny access if isNotNow(incoming.createdAt) to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const incorrectCreatedAtUserTodo = {
      ...creatifyDoc(userTodo1),
      createdAt: getNotNowTimestamp(),
    };
    const result = await isRequestDenied(setDoc(docRef, incorrectCreatedAtUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`UT.C.5.D should deny access if isNotNow(incoming.updatedAt) to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const incorrectUpdatedAtUserTodo = {
      ...creatifyDoc(userTodo1),
      updatedAt: getNotNowTimestamp(),
    };
    const result = await isRequestDenied(setDoc(docRef, incorrectUpdatedAtUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`UT.C.6.D.wrongUser should deny create access if auth.uid != incoming.uid to ${collectionNames.userTodos}`, async () => {
    const authedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(authedDb, collectionNames.userTodos, userTodo1.id);

    const createDocResult = await isRequestDenied(setDoc(docRef, creatifyDoc(userTodo1)));

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`UT.C.6.D.unauth should deny create access if user is unauthenticated to ${collectionNames.userTodos}`, async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, collectionNames.userTodos, userTodo1.id);

    const createDocResult = await isRequestDenied(setDoc(docRef, creatifyDoc(userTodo1)));

    expect(createDocResult.permissionDenied).toBe(true);
  });
});
