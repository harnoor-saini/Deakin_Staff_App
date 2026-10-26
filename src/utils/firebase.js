
import { initializeApp } from "firebase/app";

import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  writeBatch,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(firebaseapp);
export const db = getFirestore(firebaseapp);

// Google provider
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

// Register with email and password
export async function creatinguserwithsignup(email, password) {
  const cleanEmail = email?.trim();

  if (!cleanEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const result = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  await creataUserdocfromauth(result.user);

  return result;
}

// Sign in with email and password
export async function signinuser(email, password) {
  const cleanEmail = email?.trim();

  if (!cleanEmail || !password) {
    throw new Error("Email and password are required.");
  }

  return await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );
}

// Sign in with Google
export async function signinWithgoogle() {
  const result = await signInWithPopup(auth, provider);

  await creataUserdocfromauth(result.user);

  return result;
}

// Create a Firestore user document if one doesn't exist
export async function creataUserdocfromauth(
  userAuth,
  additionalInfo = {}
) {
  if (!userAuth) {
    throw new Error("No authenticated user was provided.");
  }

  const userDocRef = doc(db, "AI-X1", userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    await setDoc(userDocRef, {
      displayName: userAuth.displayName || "",
      email: userAuth.email || "",
      createdAt: new Date(),
      ...additionalInfo,
    });
  }

  return userDocRef;
}




//staff 
export async function addcollectionanddocuments(
  collectionkey,
  objectstoadd
) {
  const collectionRef = collection(db, collectionkey);
  const batch = writeBatch(db);

  objectstoadd.forEach((object) => {
    const docRef = doc(
      collectionRef,
      object.name.toLowerCase()
    );

    batch.set(docRef, object);
  });

  await batch.commit();

  console.log("transaction is successful");
}

