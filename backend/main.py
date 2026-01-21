from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(
    title="HICRA - Hybrid Interpretable Credit Risk Assessment",
    description="API for predicting credit risk using hybrid Decision Tree + Neural Network approach with explainable AI.",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApplicantData(BaseModel):
    age: int
    income: float
    credit_history_length: int
    existing_loans: int
    debt_to_income_ratio: float
    loan_amount: float
    repayment_duration: int
    employment_type: str = "employed" # employed, self-employed, unemployed

from model import HybridModel
import os

# Initialize Model
model = HybridModel()
if not os.path.exists(model.model_dir) or not os.path.exists(os.path.join(model.model_dir, "dt_model.pkl")):
    print("Models not found. Training new models...")
    model.train()
else:
    model.load()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "credit-risk-api"}

@app.post("/predict")
def predict_risk(data: ApplicantData):
    input_dict = data.dict()
    
    # Prediction
    pred_result = model.predict(input_dict)
    
    # Explanation
    explanation = model.explain(input_dict)
    
    return {
        **pred_result,
        "explanation": explanation
    }

@app.get("/model-info")
def get_model_info():
    return {
        "model_type": "Hybrid Decision Tree + Neural Network",
        "dt_max_depth": model.dt_model.get_params().get('max_depth') if model.dt_model else "N/A",
        "nn_layers": model.nn_model.hidden_layer_sizes if model.nn_model else "N/A"
    }

# --- Authentication & Data Management ---

# Global Data Store
import pandas as pd
import random

DB_PATH = "backend/archive/Loan.csv"
users_db = []
loan_data_df = None

def load_data():
    global loan_data_df, users_db
    try:
        # Load CSV
        # Handle relative path safety
        if os.path.exists("archive/Loan.csv"):
            path = "archive/Loan.csv"
        elif os.path.exists("backend/archive/Loan.csv"):
            path = "backend/archive/Loan.csv"
        else:
            print("Warning: Loan.csv not found.")
            return

        df = pd.read_csv(path)
        
        # Take a subset for demo efficiency (e.g. 100 rows) or full if fast
        # df = df.head(100) 
        
        # Generate Synthetic User Info
        # Since CSV has no names, we create them: User 1, User 2...
        names = [f"User {i+1}" for i in range(len(df))]
        emails = [f"user{i+1}@gmail.com" for i in range(len(df))]
        
        df['name'] = names
        df['email'] = emails
        df['user_id'] = range(1, len(df) + 1)
        
        # Fill NaNs for safety
        df = df.fillna(0)
        
        loan_data_df = df
        
        # Create Users Dictionary for quick lookup
        # Default password for all users: 'password123'
        users_db = df[['email', 'name', 'user_id']].to_dict(orient='records')
        print(f"Loaded {len(df)} records from Loan.csv")
        print("DEBUG: Valid Users Example:")
        for u in users_db[:3]:
            print(f" - {u['email']} / password123")
        
    except Exception as e:
        print(f"Error loading data: {e}")

# Load on startup
load_data()

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(creds: LoginRequest):
    # 1. Admin Login
    if creds.email == "demo1@admin.com" and creds.password == "12345":
        return {
            "token": "admin-token-123",
            "role": "admin",
            "name": "Admin User",
            "email": creds.email
        }
    
    # 2. User Login
    # Find user in generated DB
    user = next((u for u in users_db if u['email'] == creds.email), None)
    if user:
        # For demo, allow any password or specific one
        if creds.password == "password123": 
            return {
                "token": f"user-token-{user['user_id']}",
                "role": "user",
                "name": user['name'],
                "email": user['email'],
                "user_id": user['user_id']
            }
    
    return {"error": "Invalid credentials", "role": "guest"}

@app.get("/user-data/{email}")
def get_user_data(email: str):
    if loan_data_df is None:
        return {"error": "Data not loaded"}
    
    try:
        # Filter by Email
        user_row = loan_data_df[loan_data_df['email'] == email]
        if user_row.empty:
            return {"error": "User data not found"}
        
        # Convert to dict and normalize keys for Frontend Dashboard
        # Mapping CSV columns to Dashboard expected keys
        row = user_row.iloc[0]
        
        print(f"DEBUG: Found user row: {row}") # Debug print

        # Calculate Risk (Mocking logic based on existing model if needed, or using CSV 'RiskScore')
        # The CSV has 'RiskScore', let's use that if available, else derive it.
        
        # Map to frontend structure
        data = {
            # Personal
            "name": row['name'],
            "email": row['email'],
            
            # Inputs (Mapped from CSV Schema)
            "age": int(float(row.get('Age', 0))),
            "income": float(row.get('AnnualIncome', 0)),
            "credit_history_length": int(float(row.get('LengthOfCreditHistory', 0))),
            "existing_loans": int(float(row.get('NumberOfOpenCreditLines', 0))), # Approx mapping
            "debt_to_income_ratio": float(row.get('DebtToIncomeRatio', 0)),
            "loan_amount": float(row.get('LoanAmount', 0)),
            "repayment_duration": int(float(row.get('LoanDuration', 0))),
            "employment_type": str(row.get('EmploymentStatus', 'Unemployed')).lower(),
            
            # Model Outputs (Pre-calculated or raw from CSV)
            # Assuming CSV has 'RiskScore' or we use model.predict() live.
            # Let's run a live prediction using the loaded model for consistency!
        }
        
        # Run Live Prediction for consistency with the Dashboard features
        pred_input = {
            "age": data["age"],
            "income": data["income"],
            "credit_history_length": data["credit_history_length"],
            "existing_loans": data["existing_loans"],
            "debt_to_income_ratio": data["debt_to_income_ratio"],
            "loan_amount": data["loan_amount"],
            "repayment_duration": data["repayment_duration"],
            "employment_type": data["employment_type"]
        }
        
        # Predict
        try:
            prediction = model.predict(pred_input)
            explanation = model.explain(pred_input)
            result = {**prediction, "explanation": explanation}
        except Exception as e:
            print(f"Prediction error: {e}")
            result = {}

        return {
            "user_profile": data,
            "prediction_result": result
        }
    except Exception as e:
        import traceback
        print(f"CRITICAL BACKEND ERROR:\n{traceback.format_exc()}")
        return {"error": f"Internal Server Error: {str(e)}"}

@app.get("/admin/all-data")
def get_all_data():
    if loan_data_df is None:
        return []
    
    # Return top 500 records for performance (newest first if new applicants added)
    records = loan_data_df.head(500).to_dict(orient='records')
    return records

class NewApplicant(BaseModel):
    name: str
    email: str
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

@app.post("/add-applicant")
def add_applicant(applicant: NewApplicant):
    global loan_data_df, users_db
    
    if loan_data_df is None:
        load_data()
    
    # Generate new user ID
    new_id = len(loan_data_df) + 1 if loan_data_df is not None else 1
    
    # Create new row matching CSV schema
    new_row = {
        'user_id': new_id,
        'name': applicant.name,
        'email': applicant.email,
        'Age': applicant.age,
        'AnnualIncome': applicant.income,
        'EmploymentStatus': applicant.employment_type.title(),
        'LengthOfCreditHistory': applicant.credit_history_length,
        'NumberOfOpenCreditLines': applicant.existing_loans,
        'DebtToIncomeRatio': applicant.debt_to_income_ratio,
        'LoanAmount': applicant.loan_amount,
        'LoanDuration': applicant.repayment_duration,
        'RiskScore': applicant.risk_score
    }
    
    # Add to DataFrame
    if loan_data_df is not None:
        loan_data_df = pd.concat([pd.DataFrame([new_row]), loan_data_df], ignore_index=True)
    else:
        loan_data_df = pd.DataFrame([new_row])
    
    # Add to users_db for login
    users_db.insert(0, {
        'email': applicant.email,
        'name': applicant.name,
        'user_id': new_id
    })
    
    print(f"Added new applicant: {applicant.name} ({applicant.email})")
    
    return {
        "success": True,
        "user_id": new_id,
        "message": f"Applicant {applicant.name} added successfully"
    }
