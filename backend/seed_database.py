"""
Database Seeder for HICRA
Loads data from Loan.csv into MySQL database

Run this script after setting up MySQL:
    python seed_database.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime

import pandas as pd
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from database import engine, SessionLocal, Base
from models_db import User, ApplicantProfile, Prediction


def create_tables():
    """Create all database tables"""
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")


def seed_admin_user(db: Session):
    """Create admin user if not exists"""
    admin_email = os.getenv("ADMIN_EMAIL", "demo1@admin.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "12345")
    
    # Check if admin exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"ℹ️  Admin user already exists: {admin_email}")
        return existing_admin
    
    # Create admin user
    admin = User(
        email=admin_email,
        name="Admin User",
        password_hash=bcrypt.hash(admin_password),
        role="admin",
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"✅ Admin user created: {admin_email} / {admin_password}")
    return admin


def load_csv_data(csv_path: str = None) -> pd.DataFrame:
    """Load data from Loan.csv"""
    if csv_path is None:
        base_dir = Path(__file__).parent
        potential_paths = [
            base_dir / "archive" / "Loan.csv",
            base_dir.parent / "archive" / "Loan.csv"
        ]
        
        for p in potential_paths:
            if p.exists():
                csv_path = str(p)
                break
    
    if not csv_path or not Path(csv_path).exists():
        print(f"❌ Loan.csv not found!")
        return None
    
    print(f"📂 Loading data from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"   Loaded {len(df)} records")
    return df


def seed_users_and_profiles(db: Session, df: pd.DataFrame, limit: int = None):
    """
    Seed users and applicant profiles from CSV data.
    
    Args:
        db: Database session
        df: DataFrame with loan data
        limit: Optional limit on number of records to import (for testing)
    """
    if df is None or df.empty:
        print("❌ No data to seed!")
        return
    
    if limit:
        df = df.head(limit)
        print(f"⚠️  Limited to {limit} records for seeding")
    
    # Default password for all users
    default_password_hash = bcrypt.hash("password123")
    
    # Track progress
    total = len(df)
    created_users = 0
    created_profiles = 0
    skipped = 0
    
    print(f"\n🔄 Seeding {total} users and profiles...")
    
    for idx, row in df.iterrows():
        try:
            # Generate email based on index
            email = f"user{idx + 1}@gmail.com"
            name = f"User {idx + 1}"
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                skipped += 1
                if skipped <= 5:
                    print(f"   ⏭️  Skipping existing user: {email}")
                continue
            
            # Create User
            user = User(
                email=email,
                name=name,
                password_hash=default_password_hash,
                role="user",
                is_active=True
            )
            db.add(user)
            db.flush()  # Get user.id without committing
            created_users += 1
            
            # Parse application date
            app_date = None
            if 'ApplicationDate' in row and pd.notna(row['ApplicationDate']):
                try:
                    app_date = datetime.strptime(str(row['ApplicationDate']), '%Y-%m-%d')
                except:
                    pass
            
            # Create Applicant Profile
            profile = ApplicantProfile(
                user_id=user.id,
                
                # Personal
                age=int(row.get('Age', 0)) if pd.notna(row.get('Age')) else None,
                marital_status=str(row.get('MaritalStatus', '')) if pd.notna(row.get('MaritalStatus')) else None,
                number_of_dependents=int(row.get('NumberOfDependents', 0)) if pd.notna(row.get('NumberOfDependents')) else 0,
                education_level=str(row.get('EducationLevel', '')) if pd.notna(row.get('EducationLevel')) else None,
                
                # Employment & Income
                employment_status=str(row.get('EmploymentStatus', 'Employed')) if pd.notna(row.get('EmploymentStatus')) else 'Employed',
                experience=int(row.get('Experience', 0)) if pd.notna(row.get('Experience')) else None,
                job_tenure=int(row.get('JobTenure', 0)) if pd.notna(row.get('JobTenure')) else None,
                annual_income=float(row.get('AnnualIncome', 0)) if pd.notna(row.get('AnnualIncome')) else None,
                monthly_income=float(row.get('MonthlyIncome', 0)) if pd.notna(row.get('MonthlyIncome')) else None,
                
                # Credit
                credit_score=int(row.get('CreditScore', 0)) if pd.notna(row.get('CreditScore')) else None,
                length_of_credit_history=int(row.get('LengthOfCreditHistory', 0)) if pd.notna(row.get('LengthOfCreditHistory')) else None,
                number_of_open_credit_lines=int(row.get('NumberOfOpenCreditLines', 0)) if pd.notna(row.get('NumberOfOpenCreditLines')) else 0,
                number_of_credit_inquiries=int(row.get('NumberOfCreditInquiries', 0)) if pd.notna(row.get('NumberOfCreditInquiries')) else 0,
                credit_card_utilization_rate=float(row.get('CreditCardUtilizationRate', 0)) if pd.notna(row.get('CreditCardUtilizationRate')) else None,
                
                # Debt
                monthly_debt_payments=float(row.get('MonthlyDebtPayments', 0)) if pd.notna(row.get('MonthlyDebtPayments')) else None,
                debt_to_income_ratio=float(row.get('DebtToIncomeRatio', 0)) if pd.notna(row.get('DebtToIncomeRatio')) else None,
                total_debt_to_income_ratio=float(row.get('TotalDebtToIncomeRatio', 0)) if pd.notna(row.get('TotalDebtToIncomeRatio')) else None,
                bankruptcy_history=bool(int(row.get('BankruptcyHistory', 0))) if pd.notna(row.get('BankruptcyHistory')) else False,
                previous_loan_defaults=bool(int(row.get('PreviousLoanDefaults', 0))) if pd.notna(row.get('PreviousLoanDefaults')) else False,
                
                # Loan
                loan_amount=float(row.get('LoanAmount', 0)) if pd.notna(row.get('LoanAmount')) else None,
                loan_duration=int(row.get('LoanDuration', 0)) if pd.notna(row.get('LoanDuration')) else None,
                loan_purpose=str(row.get('LoanPurpose', '')) if pd.notna(row.get('LoanPurpose')) else None,
                base_interest_rate=float(row.get('BaseInterestRate', 0)) if pd.notna(row.get('BaseInterestRate')) else None,
                interest_rate=float(row.get('InterestRate', 0)) if pd.notna(row.get('InterestRate')) else None,
                monthly_loan_payment=float(row.get('MonthlyLoanPayment', 0)) if pd.notna(row.get('MonthlyLoanPayment')) else None,
                
                # Assets
                home_ownership_status=str(row.get('HomeOwnershipStatus', '')) if pd.notna(row.get('HomeOwnershipStatus')) else None,
                savings_account_balance=float(row.get('SavingsAccountBalance', 0)) if pd.notna(row.get('SavingsAccountBalance')) else None,
                checking_account_balance=float(row.get('CheckingAccountBalance', 0)) if pd.notna(row.get('CheckingAccountBalance')) else None,
                total_assets=float(row.get('TotalAssets', 0)) if pd.notna(row.get('TotalAssets')) else None,
                total_liabilities=float(row.get('TotalLiabilities', 0)) if pd.notna(row.get('TotalLiabilities')) else None,
                net_worth=float(row.get('NetWorth', 0)) if pd.notna(row.get('NetWorth')) else None,
                
                # Payment History
                payment_history=int(row.get('PaymentHistory', 0)) if pd.notna(row.get('PaymentHistory')) else None,
                utility_bills_payment_history=float(row.get('UtilityBillsPaymentHistory', 0)) if pd.notna(row.get('UtilityBillsPaymentHistory')) else None,
                
                # Risk
                risk_score=float(row.get('RiskScore', 50)) if pd.notna(row.get('RiskScore')) else 50.0,
                loan_approved=bool(int(row.get('LoanApproved', 0))) if pd.notna(row.get('LoanApproved')) else None,
                
                # Metadata
                application_date=app_date
            )
            db.add(profile)
            created_profiles += 1
            
            # Commit in batches of 100 for performance
            if (idx + 1) % 100 == 0:
                db.commit()
                print(f"   📊 Progress: {idx + 1}/{total} records processed...")
                
        except Exception as e:
            print(f"   ❌ Error on row {idx}: {e}")
            db.rollback()
            continue
    
    # Final commit
    db.commit()
    
    print(f"\n✅ Seeding complete!")
    print(f"   Users created: {created_users}")
    print(f"   Profiles created: {created_profiles}")
    print(f"   Skipped (existing): {skipped}")


def main():
    """Main seeding function"""
    print("=" * 50)
    print("🌱 HICRA Database Seeder")
    print("=" * 50)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create tables
    create_tables()
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Seed admin user
        seed_admin_user(db)
        
        # Load CSV data
        df = load_csv_data()
        
        # Ask user for limit (optional, for testing)
        print("\n⚠️  The CSV contains many records. How many would you like to import?")
        print("   - Enter a number (e.g., 100, 500, 1000)")
        print("   - Press Enter for ALL records")
        print("   - Type 'skip' to skip CSV import")
        
        user_input = input("\n👉 Your choice: ").strip()
        
        if user_input.lower() == 'skip':
            print("⏭️  Skipping CSV import")
        elif user_input.isdigit():
            limit = int(user_input)
            seed_users_and_profiles(db, df, limit=limit)
        else:
            seed_users_and_profiles(db, df)
        
        print("\n" + "=" * 50)
        print("🎉 Database seeding completed!")
        print("=" * 50)
        
        # Show summary
        user_count = db.query(User).count()
        profile_count = db.query(ApplicantProfile).count()
        print(f"\n📊 Database Summary:")
        print(f"   Total Users: {user_count}")
        print(f"   Total Profiles: {profile_count}")
        print(f"\n🔑 Login Credentials:")
        print(f"   Admin: demo1@admin.com / 12345")
        print(f"   Users: user1@gmail.com, user2@gmail.com, ... / password123")
        
    finally:
        db.close()


if __name__ == "__main__":
    main()
