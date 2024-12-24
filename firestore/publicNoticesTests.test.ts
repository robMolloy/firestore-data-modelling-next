import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import * as fsUtils from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

const publicNoticesCollectionName = "publicNotices";

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

  it(`should not allow read access to a ${publicNoticesCollectionName} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), publicNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, publicNoticesCollectionName, "id1");
    const response = await fsUtils.isRequestGranted(getDoc(docRef));
    expect(response.permissionGranted).toBe(true);
    expect(response.data).toEqual({ some: "data" });
  });

  it(`should not allow create access to a ${publicNoticesCollectionName} collection`, async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, publicNoticesCollectionName, "id1");

    const setDocResult = await fsUtils.isRequestDenied(setDoc(docRef, { some: "data2" }));
    if (setDocResult.permissionDenied) return;

    throw new Error(
      `permission granted to setDoc on ${publicNoticesCollectionName} but should not be`,
    );
  });

  it(`should not allow update access to a ${publicNoticesCollectionName} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), publicNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, publicNoticesCollectionName, "id1");

    const promises = [
      fsUtils.isRequestGranted(setDoc(docRef, { some: "data2" })),
      fsUtils.isRequestGranted(setDoc(docRef, { more: "data" }, { merge: true })),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted to setDoc updates on ${publicNoticesCollectionName} but should not be`,
    );
  });

  it(`should not allow delete access to a ${publicNoticesCollectionName} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), publicNoticesCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, publicNoticesCollectionName, "id1");
    const deleteDocResult = await fsUtils.isRequestDenied(deleteDoc(docRef));

    const isAllDenied = deleteDocResult.permissionDenied;
    if (isAllDenied) return;

    throw new Error(
      `permission granted to deleteDoc on ${publicNoticesCollectionName} but should not be`,
    );
  });
});
