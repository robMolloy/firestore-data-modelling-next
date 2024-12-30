import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, serverTimestamp, Timestamp, setDoc } from "firebase/firestore";
import { userTodo1 } from "./firestoreTestMocks";
import * as fsUtils from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

const createUserTodo = fsUtils.creatify(userTodo1);
// const updateUserTodo = fsUtils.updatify(userTodo1);
type TUserTodoKey = keyof typeof userTodo1;
const userTodosCollectionName = "userTodos";

describe(`firestore rules for ${userTodosCollectionName} collection`, () => {
  beforeAll(async () => {
    fsUtils.setDefaultLogLevel();
    testEnv = await fsUtils.createTestEnvironment();
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });

  it(`should allow get access if auth.uid == existing.uid from ${userTodosCollectionName}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), userTodosCollectionName, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(unauthedDb, userTodosCollectionName, userTodo1.id);
    const response = await fsUtils.isRequestGranted(getDoc(docRef));
    expect(response.permissionGranted).toBe(true);
    expect(response.data).toEqual(userTodo1);
  });

  it(`should deny get access if unauthenticated user requests from ${userTodosCollectionName}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), userTodosCollectionName, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, userTodosCollectionName, userTodo1.id);
    const response = await fsUtils.isRequestGranted(getDoc(docRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`should deny get access if auth.uid != existing.uid from ${userTodosCollectionName}`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), userTodosCollectionName, userTodo1.id);
      await setDoc(docRef, userTodo1);
    });

    const unauthedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(unauthedDb, userTodosCollectionName, userTodo1.id);
    const response = await fsUtils.isRequestGranted(getDoc(docRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`should deny create access if missing key to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createUserTodoKeys = Object.keys(createUserTodo) as TUserTodoKey[];
    const missingKeyUserTodos = createUserTodoKeys.map((key) =>
      fsUtils.removeKey(key, createUserTodo),
    );
    const promises = missingKeyUserTodos.map((todo) => {
      return fsUtils.isRequestDenied(setDoc(docRef, todo));
    });
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`should deny create access if missing key to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const additionalKeyUserTodo = { ...createUserTodo, another: "key" };
    const result = await fsUtils.isRequestDenied(setDoc(docRef, additionalKeyUserTodo));

    expect(result.permissionDenied).toBe(true);
  });

  it(`should allow create access if auth.uid == incoming.uid to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(userTodo1.uid).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createDocResult = await fsUtils.isRequestDenied(
      setDoc(docRef, { ...userTodo1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    );

    if (createDocResult.permissionDenied)
      throw new Error(
        `permission denied to create doc on ${userTodosCollectionName} but should not be`,
      );
  });

  it(`should deny create access if auth.uid != incoming.uid to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createDocResult = await fsUtils.isRequestDenied(
      setDoc(docRef, { ...userTodo1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    );

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`should deny create access if documentId != incoming.id to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createDocResult = await fsUtils.isRequestDenied(
      setDoc(docRef, { ...createUserTodo, id: `not_${createUserTodo.id}` }),
    );

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`should deny create access if isNotNow(incoming.createdAt) to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createDocResult = await fsUtils.isRequestDenied(
      setDoc(docRef, { ...createUserTodo, createdAt: Timestamp.now() }),
    );

    expect(createDocResult.permissionDenied).toBe(true);
  });

  it(`should deny create access if isNotNow(incoming.updatedAt) to ${userTodosCollectionName}`, async () => {
    const authedDb = testEnv.authenticatedContext(`not_${userTodo1.uid}`).firestore();
    const docRef = doc(authedDb, userTodosCollectionName, userTodo1.id);

    const createDocResult = await fsUtils.isRequestDenied(
      setDoc(docRef, { ...createUserTodo, updatedAt: Timestamp.now() }),
    );

    expect(createDocResult.permissionDenied).toBe(true);
  });

  // it(`should not allow create access to a ${userTodosCollectionName} collection`, async () => {
  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();
  //   const docRef = doc(unauthedDb, userTodosCollectionName, "id1");

  //   const setDocResult = await fsUtils.isRequestDenied(setDoc(docRef, { some: "data2" }));
  //   if (setDocResult.permissionDenied) return;

  //   throw new Error(`permission granted to setDoc on ${userTodosCollectionName} but should not be`);
  // });

  // it(`should not allow update access to a ${userTodosCollectionName} collection`, async () => {
  //   await testEnv.withSecurityRulesDisabled(async (context) => {
  //     const docRef = doc(context.firestore(), userTodosCollectionName, "id1");
  //     await setDoc(docRef, { some: "data" });
  //   });

  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();
  //   const docRef = doc(unauthedDb, userTodosCollectionName, "id1");

  //   const promises = [
  //     fsUtils.isRequestGranted(setDoc(docRef, { some: "data2" })),
  //     fsUtils.isRequestGranted(setDoc(docRef, { more: "data" }, { merge: true })),
  //   ];
  //   const results = await Promise.all(promises);
  //   const isAllDenied = results.every((x) => x.permissionDenied);
  //   if (isAllDenied) return;

  //   throw new Error(
  //     `permission granted to setDoc updates on ${userTodosCollectionName} but should not be`,
  //   );
  // });

  // it(`should not allow delete access to a ${userTodosCollectionName} collection`, async () => {
  //   await testEnv.withSecurityRulesDisabled(async (context) => {
  //     const docRef = doc(context.firestore(), userTodosCollectionName, "id1");
  //     await setDoc(docRef, { some: "data" });
  //   });

  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();
  //   const docRef = doc(unauthedDb, userTodosCollectionName, "id1");
  //   const deleteDocResult = await fsUtils.isRequestDenied(deleteDoc(docRef));

  //   const isAllDenied = deleteDocResult.permissionDenied;
  //   if (isAllDenied) return;

  //   throw new Error(
  //     `permission granted to deleteDoc on ${userTodosCollectionName} but should not be`,
  //   );
  // });
});
