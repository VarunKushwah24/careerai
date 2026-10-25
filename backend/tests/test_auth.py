from app.utils.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw = "MySecretPass@123"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPass@123", hashed) is False

def test_jwt_token_roundtrip():
    payload = {"sub": "42", "email": "test@example.com", "role": "user"}
    token = create_access_token(payload)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert decoded["email"] == "test@example.com"
