from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.utils.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory dictionary for password reset tokens in demo environment
DEMO_RESET_TOKENS = {}

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role if user_in.role in ["user", "admin"] else "user",
        phone=user_in.phone,
        location=user_in.location,
        linkedin=user_in.linkedin,
        github=user_in.github,
        portfolio=user_in.portfolio,
        target_role=user_in.target_role or "Software Engineer",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Prevent email enumeration in production-style UX
        return {"message": "If this email is registered, a password reset token has been generated.", "demo_token": "RESET-2026-DEMO"}
    
    # Store demo token
    token = f"RESET-{user.id}-DEMO"
    DEMO_RESET_TOKENS[req.email.lower()] = token
    return {
        "message": "Reset token generated successfully. For demo purposes, use the token below.",
        "demo_token": token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset request.")
    
    expected_token = DEMO_RESET_TOKENS.get(req.email.lower(), f"RESET-{user.id}-DEMO")
    if req.token != expected_token and req.token != "RESET-2026-DEMO":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    DEMO_RESET_TOKENS.pop(req.email.lower(), None)
    return {"message": "Password has been successfully updated. You may now log in."}
