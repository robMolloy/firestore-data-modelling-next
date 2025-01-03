import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, query, collection, getDocs } from "firebase/firestore";
import { collectionNames, siteConfig1, TSiteConfig } from "./firestoreTestMocks";
import {
  createTestEnvironment,
  isRequestDenied,
  isRequestGranted,
  setDefaultLogLevel,
} from "./firestoreTestUtils";
let testEnv: RulesTestEnvironment;

describe(`firestore rules for ${collectionNames.siteConfig} collection`, () => {
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

  it(`SC.G.0.A should grant get access to ${collectionNames.siteConfig} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.siteConfig, siteConfig1.id);
      await setDoc(docRef, siteConfig1);
    });

    const adminDb = testEnv.authenticatedContext(siteConfig1.adminUids[0]).firestore();
    const adminDocRef = doc(adminDb, collectionNames.siteConfig, siteConfig1.id);

    const notAdminDb = testEnv.authenticatedContext(`not_${siteConfig1.adminUids[0]}`).firestore();
    const notAdminDocRef = doc(notAdminDb, collectionNames.siteConfig, siteConfig1.id);

    const promises = [
      isRequestGranted(getDoc(adminDocRef)),
      isRequestGranted(getDoc(notAdminDocRef)),
    ];
    const responses = await Promise.all(promises);
    responses.forEach((response) => {
      expect(response.permissionGranted).toBe(true);
      expect(response.data).toEqual(siteConfig1);
    });
  });

  it(`SC.G.1.D should deny unauthenticated get access to ${collectionNames.siteConfig} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.siteConfig, siteConfig1.id);
      await setDoc(docRef, siteConfig1);
    });

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const adminDocRef = doc(unauthenticatedDb, collectionNames.siteConfig, siteConfig1.id);

    const response = await isRequestDenied(getDoc(adminDocRef));
    expect(response.permissionDenied).toBe(true);
  });

  it(`SC.L.0.D should deny list access to a ${collectionNames.siteConfig} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const siteConfigDocRef = doc(context.firestore(), collectionNames.siteConfig, siteConfig1.id);
      await setDoc(siteConfigDocRef, siteConfig1);
    });

    const ownerDb = testEnv.authenticatedContext(siteConfig1.adminUids[0]).firestore();
    const notOwnerDb = testEnv.authenticatedContext(`not_${siteConfig1.adminUids[0]}`).firestore();
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const queries = [
      query(collection(ownerDb, collectionNames.siteConfig)),
      query(collection(notOwnerDb, collectionNames.siteConfig)),
      query(collection(unauthedDb, collectionNames.siteConfig)),
    ];
    const promises = queries.map((q) => isRequestDenied(getDocs(q)));
    const responses = await Promise.all(promises);
    const isAllDenied = responses.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });

  it(`SC.U.0.D should deny update access to ${collectionNames.siteConfig} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), collectionNames.siteConfig, siteConfig1.id);
      await setDoc(docRef, siteConfig1);
    });

    const ownerDb = testEnv.authenticatedContext(siteConfig1.adminUids[0]).firestore();
    const ownerDocRef = doc(ownerDb, collectionNames.siteConfig, siteConfig1.id);

    const notOwnerDb = testEnv.authenticatedContext(`not_${siteConfig1.adminUids[0]}`).firestore();
    const notOwnerDocRef = doc(notOwnerDb, collectionNames.siteConfig, siteConfig1.id);

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const unauthDocRef = doc(unauthedDb, collectionNames.siteConfig, siteConfig1.id);

    const newSiteConfig = {
      ...siteConfig1,
      adminUids: [...siteConfig1.adminUids, "newUid"],
    } satisfies TSiteConfig;
    const requestFns = [
      () => setDoc(ownerDocRef, newSiteConfig),
      () => setDoc(ownerDocRef, newSiteConfig, { merge: true }),
      () => setDoc(notOwnerDocRef, newSiteConfig),
      () => setDoc(notOwnerDocRef, newSiteConfig, { merge: true }),
      () => setDoc(unauthDocRef, newSiteConfig),
      () => setDoc(unauthDocRef, newSiteConfig, { merge: true }),
    ];

    for (const requestFn of requestFns) {
      const response = await isRequestDenied(requestFn());
      expect(response.permissionDenied).toBe(true);
    }
  });

  it(`SC.D.0.D should deny delete access to a ${collectionNames.siteConfig} collection`, async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const siteConfigDocRef = doc(context.firestore(), collectionNames.siteConfig, siteConfig1.id);
      await setDoc(siteConfigDocRef, siteConfig1);
    });

    const ownerDb = testEnv.authenticatedContext(siteConfig1.adminUids[0]).firestore();
    const ownerDocRef = doc(ownerDb, collectionNames.siteConfig, siteConfig1.id);

    const notOwnerDb = testEnv.authenticatedContext(`not_${siteConfig1.adminUids[0]}`).firestore();
    const notOwnerDocRef = doc(notOwnerDb, collectionNames.siteConfig, siteConfig1.id);

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const unauthDocRef = doc(unauthedDb, collectionNames.siteConfig, siteConfig1.id);

    const docRefs = [ownerDocRef, notOwnerDocRef, unauthDocRef];
    const promises = docRefs.map((docRef) => isRequestDenied(deleteDoc(docRef)));
    const responses = await Promise.all(promises);
    const isAllDenied = responses.every((x) => x.permissionDenied);
    expect(isAllDenied).toBe(true);
  });
});
