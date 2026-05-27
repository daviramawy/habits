import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Check if we are running in real Firebase or Mock/Development mode
export const isMockFirebase = 
  !firebaseConfig || 
  firebaseConfig.apiKey === "mock-api-key" || 
  firebaseConfig.projectId === "mock-project";

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard login popup trigger
export async function signInWithGoogle() {
  if (isMockFirebase) {
    console.warn("Using mock auth - signing in local dummy user");
    return null;
  }
  return signInWithPopup(auth, googleProvider);
}

// Security Rule Error Interface & Custom Exception Handler
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Raised: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check verification on app boot
async function verifyConnection() {
  if (isMockFirebase) {
    console.log("Guild Masters info: Running in local quest mode (offline mock schema).");
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase magic link online and verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}
verifyConnection();
