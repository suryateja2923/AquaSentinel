import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "government_officer" | "user";
  department?: string;
  designation?: string;
  createdAt?: any;
}

/**
 * Register a new user using official email and password
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  requestedRole: "admin" | "government_officer" | "user" = "user"
): Promise<FirebaseUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Create Firebase Auth user
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  try {
    await updateProfile(credential.user, {
      displayName: cleanName,
    });

    // Check pre-configured roles for known hackathon emails
    let assignedRole: "admin" | "government_officer" | "user" = requestedRole;
    if (cleanEmail === "chsuryachowdary12@gmail.com") {
      assignedRole = "admin";
    } else if (cleanEmail === "chilimursharma@gmail.com") {
      assignedRole = "government_officer";
    }

    // Persist user profile to Firestore
    await setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      displayName: cleanName,
      email: cleanEmail,
      role: assignedRole,
      department: assignedRole === "admin" 
        ? "Ministry of Environment, Forest & Climate Change (MoEFCC)" 
        : assignedRole === "government_officer"
        ? "National Wetland Authority & Revenue Division"
        : "Public Wetland Watch Citizen Division",
      designation: assignedRole === "admin"
        ? "Master Portal Administrator"
        : assignedRole === "government_officer"
        ? "Authorized Government Officer"
        : "Registered Field Observer",
      createdAt: serverTimestamp(),
    }, { merge: true });

    try {
      await sendEmailVerification(credential.user);
    } catch (err) {
      console.warn("Email verification could not be sent (optional in dev):", err);
    }

    return credential.user;
  } catch (error) {
    console.error("Profile creation error:", error);
    throw error;
  }
}

/**
 * Login using Email and Password
 */
export async function loginUser(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return result.user;
}

/**
 * Reset password via email
 */
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Get current user's role from claims or Firestore
 */
export async function getCurrentRole(): Promise<string> {
  const user = auth.currentUser;
  if (!user) return "anonymous";

  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.role) {
      let role = String(tokenResult.claims.role);
      // Map environmental_officer to government_officer
      if (role === "environmental_officer") role = "government_officer";
      return role;
    }

    // Fallback to Firestore lookup
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      let role = snap.data().role || "user";
      if (role === "environmental_officer") role = "government_officer";
      return role;
    }
  } catch (e) {
    console.warn("Could not fetch user role:", e);
  }

  // Pre-configured fallback for known emails
  const cleanEmail = (user.email || "").toLowerCase();
  if (cleanEmail === "chsuryachowdary12@gmail.com") return "admin";
  if (cleanEmail === "chilimursharma@gmail.com") return "government_officer";

  return "user";
}
