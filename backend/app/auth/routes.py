from fastapi import APIRouter, HTTPException, Depends
from app.auth.schemas import UserCreate, UserLogin, UserResponse
from app.core.firebase import db
from firebase_admin import auth
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    try:
        # 1. Create user in Firebase Auth
        user_record = auth.create_user(
            email=user.email,
            password=user.password
        )

        # 2. Create user profile in Firestore
        user_data = {
            "uid": user_record.uid,
            "email": user.email,
            "provider": "password",
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        }
        db.collection("users").document(user_record.uid).set(user_data)

        return UserResponse(
            uid=user_record.uid,
            email=user.email,
            provider="password",
            message="User created successfully"
        )

    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    # DEV BYPASS
    if login_data.id_token == "dev-token-bypass":
        return UserResponse(
            uid="dev-user-123",
            email="dev@example.com",
            provider="dev-bypass",
            message="Dev Login Successful"
        )

    try:
        # 1. Verify Firebase ID Token
        # Allow 60 seconds clock skew (max allowed) for local development issues
        decoded_token = auth.verify_id_token(login_data.id_token, clock_skew_seconds=60)
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        email_verified = decoded_token.get('email_verified', False)
        print(f"DEBUG LOGIN: uid={uid}, email={email}, verified={email_verified}")

        if not email_verified:
             pass # raise HTTPException(status_code=403, detail="Email not verified")

        # 2. Get or Create User in Firestore (Sync)
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            # Update last login
            user_ref.update({"last_login": datetime.utcnow()})
            user_data = user_doc.to_dict()
            provider = user_data.get("provider", "unknown")
        else:
            # First time logic (e.g. for Google Auth users who haven't hit /register)
            provider = decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown')
            print(f"DEBUG LOGIN: New user, provider={provider}")
            user_data = {
                "uid": uid,
                "email": email,
                "provider": provider,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            user_ref.set(user_data)

        return UserResponse(
            uid=uid,
            email=email,
            provider=provider,
            message="Login successful"
        )

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

from fastapi import Header

async def get_current_user(authorization: str = Header(...)):
    # DEV BYPASS
    if authorization == "Bearer dev-token-bypass":
        return {"uid": "dev-user-123", "email": "dev@example.com", "email_verified": True}

    try:
        if not authorization.startswith("Bearer "):
             raise HTTPException(status_code=401, detail="Invalid header format")
        
        token = authorization.split(" ")[1]
        decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)
        
        # Extract provider from decoded_token for the new logic
        provider = decoded_token.get('firebase', {}).get('sign_in_provider', 'unknown')

        if not decoded_token.get('email_verified') and provider == 'password':
            pass # Email verification skipped
            # raise HTTPException(
            #    status_code=403,
            #    detail="Email not verified"
            # )
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    return {
        "uid": user['uid'],
        "email": user.get('email'),
        "provider": user.get('firebase', {}).get('sign_in_provider', 'unknown')
    }
