import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv

load_dotenv()

# --- MOCK FIRESTORE IMPLEMENTATION ---

class MockSnapshot:
    def __init__(self, data=None, exists=False, doc_id="mock_id"):
        self._data = data or {}
        self._exists = exists
        self.id = doc_id

    @property
    def exists(self):
        return self._exists

    def to_dict(self):
        return self._data

class MockDocument:
    def __init__(self, doc_id="mock_id"):
        self.id = doc_id

    def collection(self, name):
        return MockCollection(name)

    def set(self, data, merge=False):
        print(f"⚠️ [MOCK] set() called on document {self.id}: {data}")
        return None

    def get(self):
        # Return an empty non-existent snapshot by default
        return MockSnapshot(exists=False, doc_id=self.id)

    def update(self, data):
        print(f"⚠️ [MOCK] update() called on document {self.id}: {data}")
        return None
    
    def delete(self):
        print(f"⚠️ [MOCK] delete() called on document {self.id}")
        return None

class MockCollection:
    def __init__(self, name="mock_collection"):
        self.name = name

    def document(self, doc_id=None):
        return MockDocument(doc_id if doc_id else "mock_auto_id")

    def add(self, data):
        print(f"⚠️ [MOCK] add() called on collection {self.name}: {data}")
        return (None, MockDocument("mock_auto_id"))

    def where(self, field, op, value):
        return self

    def limit(self, count):
        return self

    def order_by(self, field, direction=None):
        return self

    def stream(self):
        return []

    def get(self):
        return []

class MockFirestoreClient:
    def collection(self, name):
        return MockCollection(name)

# --- INITIALIZATION LOGIC ---

cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
db = None

try:
    if not firebase_admin._apps:
        if cred_path and os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                db = firestore.client()
                print("✅ Firebase Admin Initialized Successfully")
            except Exception as inner_e:
                print(f"❌ Failed to load credentials at {cred_path}: {inner_e}")
        else:
            print(f"⚠️ Firebase Credentials NOT FOUND at: {cred_path}")
    else:
        # Already initialized
        db = firestore.client()

except Exception as e:
    print(f"❌ Unexpected error initializing Firebase: {e}")

# FALLBACK: If db failed to initialize (None or failed connection), use Mock
if db is None:
    print("⚠️ Firestore DB unavailable - Using MOCK FIRESTORE CLIENT (Backend will not crash, but data is ephemeral)")
    db = MockFirestoreClient()

# Verify db is valid
try:
    # Quick sanity check (optional, but good for verification)
    test_ref = db.collection("health_check_mock")
except Exception as e:
    print(f"❌ CRITICAL: db object is malformed even after mock fallback! {e}")
    # Last resort
    db = MockFirestoreClient()
