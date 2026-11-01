'use client';

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { requireFirebase } from '@/lib/firebase';
import type { User } from '@/lib/types';

export type ProfileInput = {
  name: string;
  phone?: string;
};

function profileRef(db: Firestore, uid: string) {
  return doc(db, 'users', uid);
}

function normalizeProfile(uid: string, data: Partial<User> | undefined, account: FirebaseUser): User {
  return {
    uid,
    name: data?.name?.trim() || account.displayName?.trim() || 'Humble Customer',
    email: data?.email?.trim() || account.email || '',
    phone: data?.phone?.trim() || '',
  };
}

export async function getOrCreateProfile(account: FirebaseUser): Promise<User> {
  const { db } = requireFirebase();
  const snapshot = await getDoc(profileRef(db, account.uid));
  const profile = normalizeProfile(account.uid, snapshot.data() as Partial<User> | undefined, account);

  if (!snapshot.exists()) {
    await setDoc(profileRef(db, account.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return profile;
}

export async function saveProfile(account: FirebaseUser, input: ProfileInput): Promise<User> {
  const { db } = requireFirebase();
  const profile = normalizeProfile(account.uid, {
    name: input.name,
    email: account.email ?? '',
    phone: input.phone,
  }, account);

  await setDoc(
    profileRef(db, account.uid),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return profile;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { auth } = requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return getOrCreateProfile(credential.user);
}

export async function register(
  email: string,
  password: string,
  input: ProfileInput,
): Promise<User> {
  const { auth } = requireFirebase();
  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: input.name.trim() || 'Humble Customer' });
  return saveProfile(credential.user, input);
}

export async function signOut(): Promise<void> {
  const { auth } = requireFirebase();
  await firebaseSignOut(auth);
}

export function authErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  };
  return messages[code] ?? (error instanceof Error ? error.message : 'Something went wrong. Please try again.');
}
