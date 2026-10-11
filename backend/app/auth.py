from dataclasses import dataclass, field

from fastapi import HTTPException, Request
from firebase_admin import auth as fb_auth

from .firebase import _app

ROLES = {"admin", "collector", "tahsildar", "analyst", "viewer"}
WRITE_ROLES = {"admin", "collector", "analyst"}


@dataclass
class User:
    uid: str
    role: str
    districts: list[str] = field(default_factory=list)


def current_user(request: Request) -> User:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(401, "Sign in required")
    _app()
    try:
        # check_revoked=True: a disabled or signed-out officer is rejected immediately
        claims = fb_auth.verify_id_token(header[7:], check_revoked=True)
    except Exception:
        raise HTTPException(401, "Session expired. Sign in again")
    role = claims.get("role")
    if role not in ROLES:
        raise HTTPException(403, "No role assigned to this account")
    request.state.uid = claims["uid"]
    return User(claims["uid"], role, list(claims.get("districts", [])))


def require_district(user: User, district_id: str) -> None:
    """Deny by default. Admin sees all; everyone else only their assigned districts."""
    if user.role == "admin":
        return
    if district_id not in user.districts:
        raise HTTPException(403, "This district is not assigned to you")


def require_write(user: User) -> None:
    if user.role not in WRITE_ROLES:
        raise HTTPException(403, "Your role cannot run analyses")
