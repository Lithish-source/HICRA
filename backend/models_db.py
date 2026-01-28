"""
SQLAlchemy Database Models for HICRA
Defines the database schema for users, applicant profiles, and predictions
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, 
    Text, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"
    USER = "user"


class User(Base):
    """
    User table for authentication.
    Stores login credentials and role information.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # 'admin' or 'user'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("ApplicantProfile", back_populates="user", uselist=False)
    predictions = relationship("Prediction", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


class ApplicantProfile(Base):
    """
    Applicant profile table.
    Stores financial and personal information for credit risk assessment.
    Mirrors the CSV data structure.
    """
    __tablename__ = "applicant_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Personal Information
    age = Column(Integer, nullable=True)
    marital_status = Column(String(50), nullable=True)
    number_of_dependents = Column(Integer, default=0)
    education_level = Column(String(100), nullable=True)
    
    # Employment & Income
    employment_status = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)  # Years of experience
    job_tenure = Column(Integer, nullable=True)  # Months at current job
    annual_income = Column(Float, nullable=True)
    monthly_income = Column(Float, nullable=True)
    
    # Credit Information
    credit_score = Column(Integer, nullable=True)
    length_of_credit_history = Column(Integer, nullable=True)  # In years
    number_of_open_credit_lines = Column(Integer, default=0)
    number_of_credit_inquiries = Column(Integer, default=0)
    credit_card_utilization_rate = Column(Float, nullable=True)
    
    # Debt Information
    monthly_debt_payments = Column(Float, nullable=True)
    debt_to_income_ratio = Column(Float, nullable=True)
    total_debt_to_income_ratio = Column(Float, nullable=True)
    bankruptcy_history = Column(Boolean, default=False)
    previous_loan_defaults = Column(Boolean, default=False)
    
    # Loan Details
    loan_amount = Column(Float, nullable=True)
    loan_duration = Column(Integer, nullable=True)  # In months
    loan_purpose = Column(String(100), nullable=True)
    base_interest_rate = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    monthly_loan_payment = Column(Float, nullable=True)
    
    # Assets & Accounts
    home_ownership_status = Column(String(50), nullable=True)
    savings_account_balance = Column(Float, nullable=True)
    checking_account_balance = Column(Float, nullable=True)
    total_assets = Column(Float, nullable=True)
    total_liabilities = Column(Float, nullable=True)
    net_worth = Column(Float, nullable=True)
    
    # Payment History
    payment_history = Column(Integer, nullable=True)  # Score or count
    utility_bills_payment_history = Column(Float, nullable=True)
    
    # Risk Assessment
    risk_score = Column(Float, nullable=True)
    loan_approved = Column(Boolean, nullable=True)
    
    # Metadata
    application_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<ApplicantProfile(id={self.id}, user_id={self.user_id}, income={self.annual_income})>"
    
    def to_prediction_input(self):
        """
        Convert profile to the format expected by the ML model.
        """
        # Map employment status to model format
        emp_map = {
            'employed': 'employed',
            'self-employed': 'self-employed', 
            'unemployed': 'unemployed'
        }
        emp_status = (self.employment_status or 'employed').lower()
        if emp_status not in emp_map:
            emp_status = 'employed'
            
        return {
            "age": self.age or 30,
            "income": self.annual_income or 50000,
            "credit_history_length": self.length_of_credit_history or 5,
            "existing_loans": self.number_of_open_credit_lines or 0,
            "debt_to_income_ratio": self.debt_to_income_ratio or 0.3,
            "loan_amount": self.loan_amount or 10000,
            "repayment_duration": self.loan_duration or 24,
            "employment_type": emp_status
        }


class Prediction(Base):
    """
    Prediction history table.
    Stores all risk predictions made by the system for audit and history tracking.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Prediction Results
    risk_level = Column(String(50), nullable=False)  # Low, Medium, High
    dt_prediction = Column(String(50), nullable=True)  # Decision Tree result
    nn_prediction = Column(String(50), nullable=True)  # Neural Network result
    dt_confidence = Column(Float, nullable=True)
    nn_confidence = Column(Float, nullable=True)
    final_confidence = Column(Float, nullable=True)
    agreement = Column(Boolean, nullable=True)  # True if DT and NN agree
    
    # Input Data (stored as JSON for flexibility)
    input_data = Column(JSON, nullable=True)
    
    # Explanation data
    feature_importance = Column(JSON, nullable=True)
    decision_rules = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction(id={self.id}, risk_level='{self.risk_level}', confidence={self.final_confidence})>"
