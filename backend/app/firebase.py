"""Lazy Firebase Admin init so unit tests do not need credentials."""
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore, storage

from .config import settings


@lru_cache
def _app():
    if firebase_admin._apps:
        return firebase_admin.get_app()
    cred = (
        credentials.Certificate(settings.firebase_credentials)
        if settings.firebase_credentials
        else credentials.ApplicationDefault()
    )
    return firebase_admin.initialize_app(cred, {"storageBucket": settings.storage_bucket})


def get_db():
    _app()
    return firestore.client()


def get_bucket():
    _app()
    return storage.bucket()
