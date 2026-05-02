import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler helper as requested by Firebase integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isPermissionError = error instanceof Error && (
    error.message.includes('permission-denied') || 
    error.message.includes('insufficient permissions')
  );

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  const jsonError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', jsonError);

  if (isPermissionError) {
    throw new Error(jsonError);
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore is currently in offline mode or unavailable. This is often transient.");
    } else {
      console.error("Firestore connectivity test failed:", error);
    }
  }
}

testConnection();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
}
