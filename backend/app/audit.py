import hashlib
import json
from datetime import datetime, timezone

from firebase_admin import firestore


def canonical_hash(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(raw.encode()).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def log_event(actor: str, action: str, resource_type: str, resource_id: str, outcome: str = "ok") -> None:
    """Append-only, hash-chained audit trail. Editing any past row breaks every later hash."""
    from .firebase import get_db

    db = get_db()
    head = db.collection("auditMeta").document("head")
    ev = db.collection("auditEvents").document()

    @firestore.transactional
    def _tx(tx):
        snap = head.get(transaction=tx)
        prev = snap.to_dict().get("hash", "GENESIS") if snap.exists else "GENESIS"
        body = {
            "actorId": actor, "action": action, "resourceType": resource_type,
            "resourceId": resource_id, "outcome": outcome, "prev": prev,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
        h = canonical_hash(body)
        tx.set(ev, {**body, "hash": h})
        tx.set(head, {"hash": h})

    _tx(db.transaction())


def verify_chain(events: list[dict]) -> bool:
    prev = "GENESIS"
    for e in events:
        body = {k: v for k, v in e.items() if k != "hash"}
        if body["prev"] != prev or canonical_hash(body) != e["hash"]:
            return False
        prev = e["hash"]
    return True
