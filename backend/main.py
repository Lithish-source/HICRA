"""
HICRA - Hybrid Interpretable Credit Risk Assessment
FastAPI Backend with MySQL Database Integration
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
import os
from typing import List, Optional

# Local imports
from database import get_db, engine, Base
from models_db import User, ApplicantProfile, Prediction
from schemas import (
    LoginRequest, LoginResponse, 
    PredictionInput, PredictionResult,
    NewApplicant, AdminUserData, UserDashboardData
)
from model import HybridModel

# ============ Initialize FastAPI ============

app = FastAPI(
    title="HICRA - Hybrid Interpretable Credit Risk Assessment",
    description="API for predicting credit risk using hybrid Decision Tree + Neural Network approach with explainable AI.",
    version="2.0.0"
)

# ============ CORS Configuration ============

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Initialize ML Model ============

model = HybridModel()
if not os.path.exists(model.model_dir) or not os.path.exists(os.path.join(model.model_dir, "dt_model.pkl")):
    print("📦 Models not found. Training new models...")
    model.train()
else:
    print("📦 Loading existing ML models...")
    model.load()
print("✅ ML Models ready!")

# ============ Database Initialization ============

def init_database():
    """Initialize database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized!")
        
        # Create admin user if not exists
        from dotenv import load_dotenv
        load_dotenv()
        
        db = next(get_db())
        admin_email = os.getenv("ADMIN_EMAIL", "demo1@admin.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "12345")
        
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                name="Admin User",
                password_hash=bcrypt.hash(admin_password),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin user created: {admin_email}")
        else:
            print(f"ℹ️  Admin user already exists: {admin_email}")
        
        db.close()
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        print("   Run 'python seed_database.py' to set up the database.")

# Initialize on startup
init_database()


# ============ Health Check ============

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "hicra-api", "version": "2.0.0"}


# ============ Authentication Endpoints ============

@app.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return token with role.
    Supports both admin and regular user login.
    """
    # Find user by email
    user = db.query(User).filter(User.email == creds.email).first()
    
    if not user:
        return LoginResponse(
            token="",
            role="guest",
            name="",
            email=creds.email,
            error="Invalid credentials"
        )
    
    # Verify password
    if not bcrypt.verify(creds.password, user.password_hash):
        return LoginResponse(
            token="",
            role="guest", 
            name="",
            email=creds.email,
            error="Invalid credentials"
        )
    
    # Check if user is active
    if not user.is_active:
        return LoginResponse(
            token="",
            role="guest",
            name="",
            email=creds.email,
            error="Account is disabled"
        )
    
    # Generate token (simplified - in production use JWT)
    token = f"{user.role}-token-{user.id}"
    
    return LoginResponse(
        token=token,
        role=user.role,
        name=user.name,
        email=user.email,
        user_id=user.id
    )


@app.post("/register")
def register(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=email,
        name=name,
        password_hash=bcrypt.hash(password),
        role="user",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {"success": True, "user_id": user.id, "message": "User registered successfully"}


# ============ Prediction Endpoints ============

@app.post("/predict")
def predict_risk(data: PredictionInput, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Make a credit risk prediction using the hybrid model.
    Optionally saves the prediction to database if user_id is provided.
    """
    input_dict = data.dict()
    
    # Run prediction
    pred_result = model.predict(input_dict)
    
    # Get explanation
    explanation = model.explain(input_dict)
    
    # Save to database if user_id provided
    if user_id:
        prediction = Prediction(
            user_id=user_id,
            risk_level=pred_result["risk_level"],
            dt_prediction=pred_result["dt_prediction"],
            nn_prediction=pred_result["nn_prediction"],
            dt_confidence=pred_result["dt_confidence"],
            nn_confidence=pred_result["nn_confidence"],
            final_confidence=pred_result["final_confidence"],
            agreement=pred_result["agreement"],
            input_data=input_dict,
            feature_importance=explanation.get("feature_importance"),
            decision_rules=explanation.get("rules")
        )
        db.add(prediction)
        db.commit()
    
    return {
        **pred_result,
        "explanation": explanation
    }


@app.get("/model-info")
def get_model_info():
    """Get information about the ML models"""
    return {
        "model_type": "Hybrid Decision Tree + Neural Network",
        "dt_max_depth": model.dt_model.get_params().get('max_depth') if model.dt_model else "N/A",
        "nn_layers": model.nn_model.hidden_layer_sizes if model.nn_model else "N/A",
        "version": "2.0.0"
    }


# ============ User Data Endpoints ============

@app.get("/user-data/{email}")
def get_user_data(email: str, db: Session = Depends(get_db)):
    """
    Get user profile and prediction data for the dashboard.
    Used by regular users to view their own data.
    """
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"error": "User not found"}
    
    # Get profile
    profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user.id).first()
    if not profile:
        return {"error": "Profile not found. Please complete your profile."}
    
    # Build profile data for frontend
    profile_data = {
        "name": user.name,
        "email": user.email,
        "age": profile.age,
        "income": profile.annual_income,
        "credit_history_length": profile.length_of_credit_history,
        "existing_loans": profile.number_of_open_credit_lines,
        "debt_to_income_ratio": profile.debt_to_income_ratio,
        "loan_amount": profile.loan_amount,
        "repayment_duration": profile.loan_duration,
        "employment_type": (profile.employment_status or "employed").lower()
    }
    
    # Run live prediction
    try:
        pred_input = profile.to_prediction_input()
        prediction = model.predict(pred_input)
        explanation = model.explain(pred_input)
        result = {**prediction, "explanation": explanation}
    except Exception as e:
        print(f"Prediction error: {e}")
        result = {
            "risk_level": "Medium",
            "dt_prediction": "Medium",
            "nn_prediction": "Medium",
            "final_confidence": 0.5,
            "agreement": True,
            "explanation": {"rules": [], "feature_importance": {}}
        }
    
    return {
        "user_profile": profile_data,
        "prediction_result": result
    }


# ============ Admin Endpoints ============

@app.get("/admin/all-data")
def get_all_data(db: Session = Depends(get_db)):
    """
    Get all user data for admin dashboard.
    Returns users with their profiles in a format compatible with the frontend.
    """
    # Query all users with profiles using a join
    users = db.query(User).filter(User.role == "user").all()
    
    result = []
    for user in users:
        # Get profile
        profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user.id).first()
        
        if profile:
            result.append({
                "id": user.id,
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "AnnualIncome": profile.annual_income,
                "LoanAmount": profile.loan_amount,
                "LengthOfCreditHistory": profile.length_of_credit_history,
                "DebtToIncomeRatio": profile.debt_to_income_ratio,
                "EmploymentStatus": profile.employment_status,
                "RiskScore": profile.risk_score,
                "Age": profile.age,
                "NumberOfOpenCreditLines": profile.number_of_open_credit_lines
            })
        else:
            # User without profile
            result.append({
                "id": user.id,
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "AnnualIncome": 0,
                "LoanAmount": 0,
                "LengthOfCreditHistory": 0,
                "DebtToIncomeRatio": 0,
                "EmploymentStatus": "Unknown",
                "RiskScore": 50,
                "Age": 0
            })
    
    return result


@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Get summary statistics for admin dashboard"""
    from sqlalchemy import func
    
    total_users = db.query(User).filter(User.role == "user").count()
    total_profiles = db.query(ApplicantProfile).count()
    total_predictions = db.query(Prediction).count()
    
    # Average income
    avg_income = db.query(func.avg(ApplicantProfile.annual_income)).scalar() or 0
    
    # Average loan amount
    avg_loan = db.query(func.avg(ApplicantProfile.loan_amount)).scalar() or 0
    
    # Risk distribution
    low_risk = db.query(ApplicantProfile).filter(ApplicantProfile.risk_score < 40).count()
    medium_risk = db.query(ApplicantProfile).filter(
        ApplicantProfile.risk_score >= 40,
        ApplicantProfile.risk_score < 70
    ).count()
    high_risk = db.query(ApplicantProfile).filter(ApplicantProfile.risk_score >= 70).count()
    
    return {
        "total_users": total_users,
        "total_profiles": total_profiles,
        "total_predictions": total_predictions,
        "avg_income": round(avg_income, 2),
        "avg_loan": round(avg_loan, 2),
        "risk_distribution": {
            "low": low_risk,
            "medium": medium_risk,
            "high": high_risk
        }
    }


@app.post("/add-applicant")
def add_applicant(applicant: NewApplicant, db: Session = Depends(get_db)):
    """
    Add a new applicant with user account and profile.
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == applicant.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=applicant.email,
        name=applicant.name,
        password_hash=bcrypt.hash(applicant.password),
        role="user",
        is_active=True
    )
    db.add(user)
    db.flush()  # Get user.id
    
    # Map employment type
    emp_status = applicant.employment_type.title()
    if emp_status.lower() == "self-employed":
        emp_status = "Self-Employed"
    
    # Create profile
    profile = ApplicantProfile(
        user_id=user.id,
        age=applicant.age,
        annual_income=applicant.income,
        employment_status=emp_status,
        length_of_credit_history=applicant.credit_history_length,
        number_of_open_credit_lines=applicant.existing_loans,
        debt_to_income_ratio=applicant.debt_to_income_ratio,
        loan_amount=applicant.loan_amount,
        loan_duration=applicant.repayment_duration,
        risk_score=applicant.risk_score
    )
    db.add(profile)
    db.commit()
    
    print(f"✅ Added new applicant: {applicant.name} ({applicant.email})")
    
    return {
        "success": True,
        "user_id": user.id,
        "message": f"Applicant {applicant.name} added successfully"
    }


@app.delete("/admin/user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user and their associated data"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete profile
    db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user_id).delete()
    
    # Delete predictions
    db.query(Prediction).filter(Prediction.user_id == user_id).delete()
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": f"User {user_id} deleted"}


# ============ Prediction History ============

@app.get("/predictions/{user_id}")
def get_user_predictions(user_id: int, db: Session = Depends(get_db)):
    """Get prediction history for a user"""
    predictions = db.query(Prediction).filter(
        Prediction.user_id == user_id
    ).order_by(Prediction.created_at.desc()).limit(10).all()
    
    return [
        {
            "id": p.id,
            "risk_level": p.risk_level,
            "confidence": p.final_confidence,
            "agreement": p.agreement,
            "created_at": p.created_at.isoformat()
        }
        for p in predictions
    ]


# ============ Run Server ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
