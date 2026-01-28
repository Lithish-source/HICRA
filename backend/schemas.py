"""
Pydantic Schemas for API Request/Response Validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


# ============ Auth Schemas ============

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str
    name: str
    email: str
    user_id: Optional[int] = None
    error: Optional[str] = None


class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str


# ============ User Schemas ============

class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    password: str
    role: str = "user"


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Applicant Profile Schemas ============

class ApplicantProfileBase(BaseModel):
    age: Optional[int] = None
    annual_income: Optional[float] = Field(None, alias="AnnualIncome")
    credit_score: Optional[int] = Field(None, alias="CreditScore")
    employment_status: Optional[str] = Field(None, alias="EmploymentStatus")
    education_level: Optional[str] = Field(None, alias="EducationLevel")
    experience: Optional[int] = Field(None, alias="Experience")
    loan_amount: Optional[float] = Field(None, alias="LoanAmount")
    loan_duration: Optional[int] = Field(None, alias="LoanDuration")
    marital_status: Optional[str] = Field(None, alias="MaritalStatus")
    number_of_dependents: Optional[int] = Field(None, alias="NumberOfDependents")
    home_ownership_status: Optional[str] = Field(None, alias="HomeOwnershipStatus")
    monthly_debt_payments: Optional[float] = Field(None, alias="MonthlyDebtPayments")
    credit_card_utilization_rate: Optional[float] = Field(None, alias="CreditCardUtilizationRate")
    number_of_open_credit_lines: Optional[int] = Field(None, alias="NumberOfOpenCreditLines")
    number_of_credit_inquiries: Optional[int] = Field(None, alias="NumberOfCreditInquiries")
    debt_to_income_ratio: Optional[float] = Field(None, alias="DebtToIncomeRatio")
    bankruptcy_history: Optional[bool] = Field(None, alias="BankruptcyHistory")
    loan_purpose: Optional[str] = Field(None, alias="LoanPurpose")
    previous_loan_defaults: Optional[bool] = Field(None, alias="PreviousLoanDefaults")
    payment_history: Optional[int] = Field(None, alias="PaymentHistory")
    length_of_credit_history: Optional[int] = Field(None, alias="LengthOfCreditHistory")
    savings_account_balance: Optional[float] = Field(None, alias="SavingsAccountBalance")
    checking_account_balance: Optional[float] = Field(None, alias="CheckingAccountBalance")
    total_assets: Optional[float] = Field(None, alias="TotalAssets")
    total_liabilities: Optional[float] = Field(None, alias="TotalLiabilities")
    monthly_income: Optional[float] = Field(None, alias="MonthlyIncome")
    job_tenure: Optional[int] = Field(None, alias="JobTenure")
    net_worth: Optional[float] = Field(None, alias="NetWorth")
    risk_score: Optional[float] = Field(None, alias="RiskScore")
    loan_approved: Optional[bool] = Field(None, alias="LoanApproved")

    class Config:
        populate_by_name = True


class ApplicantProfileCreate(ApplicantProfileBase):
    user_id: Optional[int] = None


class ApplicantProfileResponse(ApplicantProfileBase):
    id: int
    user_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Prediction Schemas ============

class PredictionInput(BaseModel):
    """Input data for making a prediction"""
    age: int
    income: float
    credit_history_length: int
    existing_loans: int
    debt_to_income_ratio: float
    loan_amount: float
    repayment_duration: int
    employment_type: str = "employed"


class ExplanationData(BaseModel):
    rules: List[str]
    feature_importance: Dict[str, float]


class PredictionResult(BaseModel):
    risk_level: str
    dt_prediction: str
    nn_prediction: str
    dt_confidence: float
    nn_confidence: float
    final_confidence: float
    agreement: bool
    explanation: Optional[ExplanationData] = None


class PredictionResponse(BaseModel):
    id: int
    user_id: Optional[int]
    risk_level: str
    dt_prediction: Optional[str]
    nn_prediction: Optional[str]
    final_confidence: Optional[float]
    agreement: Optional[bool]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Admin Schemas ============

class AdminUserData(BaseModel):
    """Schema for admin view of user data"""
    id: int
    user_id: Optional[int]
    name: str
    email: str
    AnnualIncome: Optional[float]
    LoanAmount: Optional[float]
    LengthOfCreditHistory: Optional[int]
    DebtToIncomeRatio: Optional[float]
    EmploymentStatus: Optional[str]
    RiskScore: Optional[float]
    Age: Optional[int]


class NewApplicant(BaseModel):
    """Schema for adding a new applicant"""
    name: str
    email: str
    password: str = "password123"  # Default password for new users
    age: int
    income: float
    employment_type: str
    credit_history_length: int
    existing_loans: int
    debt_to_income_ratio: float
    loan_amount: float
    repayment_duration: int
    risk_level: str = "Medium"
    risk_score: float = 50.0


# ============ Dashboard Schemas ============

class UserDashboardData(BaseModel):
    user_profile: Dict[str, Any]
    prediction_result: Dict[str, Any]
