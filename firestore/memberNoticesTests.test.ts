import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import * as fsUtils from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

const memberNoticesCollectionName = "memberNotices";

describe("firestore rules for a randomCollection", () => {
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

  it(`should not allow read access to ${memberNoticesCollectionName} collection if a user is unauthenticated `, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), memberNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, memberNoticesCollectionName, "id1");
    const response = await fsUtils.isRequestDenied(getDoc(docRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`should allow read access to ${memberNoticesCollectionName} collection if a user is authenticated `, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), memberNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const authedDb = testEnv.authenticatedContext("anyUid").firestore();
    const docRef2 = doc(authedDb, memberNoticesCollectionName, "id1");
    const response2 = await fsUtils.isRequestGranted(getDoc(docRef2));
    expect(response2.permissionGranted).toBe(true);
    expect(response2.data).toEqual({ some: "data" });
  });

  it(`should not allow create access to a ${memberNoticesCollectionName} collection`, async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, memberNoticesCollectionName, "id1");

    const setDocResult = await fsUtils.isRequestDenied(setDoc(docRef, { some: "data2" }));
    if (setDocResult.permissionDenied) return;

    throw new Error(
      `permission granted to setDoc on ${memberNoticesCollectionName} but should not be`,
    );
  });

  it(`should not allow update access to a ${memberNoticesCollectionName} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), memberNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, memberNoticesCollectionName, "id1");

    const promises = [
      fsUtils.isRequestGranted(setDoc(docRef, { some: "data2" })),
      fsUtils.isRequestGranted(setDoc(docRef, { more: "data" }, { merge: true })),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted to setDoc updates on ${memberNoticesCollectionName} but should not be`,
    );
  });

  it(`should not allow delete access to a ${memberNoticesCollectionName} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), memberNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, memberNoticesCollectionName, "id1");
    const deleteDocResult = await fsUtils.isRequestDenied(deleteDoc(docRef));

    const isAllDenied = deleteDocResult.permissionDenied;
    if (isAllDenied) return;

    throw new Error(
      `permission granted to deleteDoc on ${memberNoticesCollectionName} but should not be`,
    );
  });
});
