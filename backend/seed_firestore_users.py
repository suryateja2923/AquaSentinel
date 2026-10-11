import os
import firebase_admin
from firebase_admin import firestore, credentials

PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "astra-database-f9830")

if not firebase_admin._apps:
    cred_path = os.environ.get("FIREBASE_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, options={"projectId": PROJECT_ID})
    else:
        try:
            firebase_admin.initialize_app(options={"projectId": PROJECT_ID})
        except Exception as e:
            print("Note:", e)

def seed():
    try:
        db = firestore.client()
        users_to_seed = [
            {
                "doc_id": "vXQ4W50HGzOpGQGWYith",  # The document created in your console screenshot
                "data": {
                    "displayName": "Chilimuru Sharma",
                    "email": "chilimurusharma@gmail.com",
                    "role": "admin",
                    "createdAt": "2026-10-11T05:40:00Z"
                }
            },
            {
                "doc_id": "usr_surya_officer_01",
                "data": {
                    "displayName": "Surya Chowdary",
                    "email": "chsuryachowdary12@gmail.com",
                    "role": "government_officer",
                    "createdAt": "2026-10-11T05:40:00Z"
                }
            }
        ]

        for u in users_to_seed:
            # Seed in USERS (matching your Firebase console)
            db.collection("USERS").document(u["doc_id"]).set(u["data"], merge=True)
            # Also seed in users (lowercase standard)
            db.collection("users").document(u["doc_id"]).set(u["data"], merge=True)
            print(f"[OK] Seeded {u['data']['email']} ({u['data']['role']}) into document {u['doc_id']}")

        print("\nAll user documents successfully written to Cloud Firestore!")
    except Exception as e:
        print(f"Firestore update requires local service account credentials or direct console entry: {e}")

if __name__ == "__main__":
    seed()
