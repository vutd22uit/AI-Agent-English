"""
Pydantic schemas for User-related requests and responses
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from uuid import UUID


# =====================================================
# USER SCHEMAS
# =====================================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for login token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# =====================================================
# USER PROFILE SCHEMAS
# =====================================================

class UserProfileBase(BaseModel):
    current_cefr_level: Optional[str] = Field(None, pattern="^(A1|A2|B1|B2|C1|C2)$")
    target_band_score: Optional[float] = Field(None, ge=4.0, le=9.0)
    target_exam_date: Optional[date] = None
    native_language: Optional[str] = Field(None, max_length=50)
    study_hours_per_week: Optional[int] = Field(None, ge=0, le=168)
    preferred_study_time: Optional[str] = Field(None, max_length=50)


class UserProfileCreate(UserProfileBase):
    """Schema for creating user profile"""
    pass


class UserProfileUpdate(UserProfileBase):
    """Schema for updating user profile"""
    pass


class UserProfileResponse(UserProfileBase):
    """Schema for user profile response"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# USER WITH PROFILE
# =====================================================

class UserWithProfile(UserResponse):
    """User with profile information"""
    profile: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True
