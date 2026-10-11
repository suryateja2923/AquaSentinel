"""
Trusted administrative script for assigning Firebase custom claims and Firestore roles.
Usage:
  python set_role.py chsuryachowdary12@gmail.com admin
  python set_role.py chilimursharma@gmail.com government_officer
  python set_role.py user@example.com user
"""
import os
import sys
import firebase_admin
from firebase_admin import auth, firestore, credentials

PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "astra-database-f9830")
ALLOWED_ROLES = {"admin", "government_officer", "user"}

if not PROJECT_ID:
    raise SystemExit("FIREBASE_PROJECT_ID is not configured.")

if not firebase_admin._apps:
    cred_path = os.environ.get("FIREBASE_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, options={"projectId": PROJECT_ID})
    else:
        firebase_admin.initialize_app(options={"projectId": PROJECT_ID})

def assign_role(email: str, role: str):
    email = email.strip().lower()
    role = role.strip().lower()

    # Automatically map environmental_officer to government_officer
    if role == "environmental_officer":
        role = "government_officer"

    if role not in ALLOWED_ROLES:
        raise SystemExit(f"Invalid role '{role}'. Allowed roles: {', '.join(sorted(ALLOWED_ROLES))}")

    try:
        user = auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        print(f"Error: User '{email}' was not found in Firebase Authentication.")
        print("Please ensure the user is registered or created in Firebase Console first.")
        return False
    except Exception as e:
        print(f"Error retrieving user {email}: {e}")
        return False

    # Set custom claims in Firebase Authentication
    try:
        current_claims = user.custom_claims or {}
        new_claims = {**current_claims, "role": role}
        auth.set_custom_user_claims(user.uid, new_claims)
        print(f"[OK] Assigned custom claim role='{role}' to UID {user.uid} ({email})")

        # Update Firestore user document in both USERS and users collections
        try:
            db = firestore.client()
            doc_data = {
                "uid": user.uid,
                "email": email,
                "displayName": user.display_name or (
                    "Chilimuru Sharma" if "sharma" in email else "Surya Chowdary" if "surya" in email else email.split("@")[0]
                ),
                "role": role,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            }
            db.collection("USERS").document(user.uid).set(doc_data, merge=True)
            db.collection("users").document(user.uid).set(doc_data, merge=True)
            print(f"[OK] Updated Firestore USERS & users document for {email}")
        except Exception as e:
            print(f"[NOTE] Firestore doc update skipped or offline: {e}")

        print(f"\nSuccess: {email} is now configured as '{role}'.")
        print("User must sign in again or refresh ID token to apply the new role.")
        return True
    except Exception as e:
        print(f"Failed to set custom claims: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Pre-configuring standard hackathon users:")
        assign_role("chilimurusharma@gmail.com", "admin")
        assign_role("chsuryachowdary12@gmail.com", "government_officer")
    else:
        email_arg = sys.argv[1]
        role_arg = sys.argv[2]
        assign_role(email_arg, role_arg)
