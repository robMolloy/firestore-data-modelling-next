import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import {
  createTestEnvironment,
  expectFirestorePermissionDenied,
  setDefaultLogLevel,
} from "./firestoreTestUtils";

let testEnv: RulesTestEnvironment;

describe("firestore rules for a randomCollection", () => {
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

  it("should not allow read access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), "someRandomCollection", "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, "someRandomCollection", "id1");
    await expectFirestorePermissionDenied(getDoc(docRef));
  });

  it("should not allow create access to a random collection", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, "someRandomCollection", "id1");
    await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }), { onError: () => { throw new Error("setDoc to someRandomCollection allowed") } });
    await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }));
  });

  it("should not allow update access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), "someRandomCollection", "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, "someRandomCollection", "id1");
    await expectFirestorePermissionDenied(setDoc(docRef, { some: "data2" }));
    await expectFirestorePermissionDenied(
      setDoc(docRef, { more: "data" }, { merge: true })
    );
  });

  it("should not allow delete access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), "someRandomCollection", "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, "someRandomCollection", "id1");
    await expectFirestorePermissionDenied(deleteDoc(docRef));
  });
});
