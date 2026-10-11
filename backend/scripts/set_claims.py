"""Create an officer account and assign role + districts.
  python -m scripts.set_claims collector@example.gov.in 'Strong-Temp-Pass-1!' collector guntur
Roles: admin | collector | tahsildar | analyst | viewer"""
import sys

from firebase_admin import auth

from app.firebase import _app

email, password, role, *districts = sys.argv[1:]
_app()
try:
    u = auth.get_user_by_email(email)
except auth.UserNotFoundError:
    u = auth.create_user(email=email, password=password, email_verified=True)
auth.set_custom_user_claims(u.uid, {"role": role, "districts": districts})
auth.revoke_refresh_tokens(u.uid)
print("ok", u.uid, role, districts)
