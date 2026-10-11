import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

/**
 * Register a new user using official email and password
 */
export async function registerUser(name, email, password, requestedRole = "user") {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Create Firebase Auth user
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  try {
    await updateProfile(credential.user, {
      displayName: cleanName,
    });

    // Check pre-configured roles for known hackathon emails
    let assignedRole = requestedRole;
    if (cleanEmail === "chilimurusharma@gmail.com" || cleanEmail === "chilimursharma@gmail.com") {
      assignedRole = "admin";
    } else if (cleanEmail === "chsuryachowdary12@gmail.com") {
      assignedRole = "government_officer";
    }

    // Persist user profile to Firestore (both USERS and users for compatibility)
    const userDocData = {
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
    };

    try {
      await setDoc(doc(db, "USERS", credential.user.uid), userDocData, { merge: true });
    } catch (err) {
      console.warn("Notice: USERS collection write:", err);
    }

    try {
      await setDoc(doc(db, "users", credential.user.uid), userDocData, { merge: true });
    } catch (err) {
      console.warn("Notice: users collection write:", err);
    }

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
 * Automatically synchronize user profile (displayName, email, role, createdAt) to Firestore
 */
export async function syncUserToFirestore(userInfo) {
  try {
    const cleanEmail = (userInfo?.email || "").trim().toLowerCase();
    if (!cleanEmail) return;

    let role = userInfo?.role || "user";
    if (cleanEmail === "chilimurusharma@gmail.com" || cleanEmail === "chilimursharma@gmail.com") {
      role = "admin";
    } else if (cleanEmail === "chsuryachowdary12@gmail.com") {
      role = "government_officer";
    } else if (role === "environmental_officer" || role === "government_user") {
      role = "government_officer";
    }

    const displayName = userInfo?.displayName || userInfo?.name || (
      role === "admin" 
        ? "Chilimuru Sharma" 
        : (cleanEmail === "chsuryachowdary12@gmail.com" ? "Surya Chowdary" : cleanEmail.split("@")[0])
    );

    const docId = userInfo?.uid || userInfo?.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const nowIso = new Date().toISOString();

    const dataToSave = {
      displayName: displayName,
      email: cleanEmail,
      role: role,
      createdAt: nowIso,
      lastLogin: nowIso,
    };

    // 1. Save directly to USERS collection (uppercase matching Firebase Console screenshot)
    try {
      await setDoc(doc(db, "USERS", docId), dataToSave, { merge: true });
    } catch (err) {
      console.warn("Notice: USERS collection direct write:", err);
    }

    // 2. Also check if there is an existing empty or placeholder document matching email in USERS
    try {
      const q = query(collection(db, "USERS"), where("email", "==", cleanEmail));
      const querySnap = await getDocs(q);
      querySnap.forEach(async (dSnap) => {
        await updateDoc(dSnap.ref, {
          displayName: displayName,
          email: cleanEmail,
          role: role,
          lastLogin: nowIso
        });
      });
    } catch (err) {}

    // 3. Save to users collection (standard lowercase)
    try {
      await setDoc(doc(db, "users", docId), dataToSave, { merge: true });
    } catch (err) {}

    // 4. Also call the FastAPI backend to synchronize server-side
    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
      await fetch(`${apiBase}/api/sync-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, displayName, role })
      });
    } catch (apiErr) {}

    console.log(`[Firestore Auto-Sync] Saved ${cleanEmail} -> Role: ${role}, Name: ${displayName}`);
  } catch (error) {
    console.warn("syncUserToFirestore notice:", error);
  }
}

/**
 * Login using Email and Password
 */
export async function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
  if (result.user) {
    // Automatically store values to Firestore on login
    await syncUserToFirestore(result.user);
  }
  return result.user;
}

/**
 * Reset password via email
 */
export async function resetPassword(email) {
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
export async function getCurrentRole() {
  const user = auth.currentUser;
  if (!user) return "anonymous";

  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims && tokenResult.claims.role) {
      let role = String(tokenResult.claims.role);
      if (role === "environmental_officer") role = "government_officer";
      return role;
    }

    // Fallback to Firestore lookup (checks USERS and users)
    let snap = await getDoc(doc(db, "USERS", user.uid));
    if (!snap.exists()) {
      snap = await getDoc(doc(db, "users", user.uid));
    }
    if (snap.exists()) {
      let role = snap.data().role || "user";
      if (role === "environmental_officer") role = "government_officer";
      return role;
    }
  } catch (e) {
    console.warn("Could not fetch user role:", e);
  }

  const cleanEmail = (user.email || "").toLowerCase();
  if (cleanEmail === "chilimurusharma@gmail.com" || cleanEmail === "chilimursharma@gmail.com") return "admin";
  if (cleanEmail === "chsuryachowdary12@gmail.com") return "government_officer";

  return "user";
}
