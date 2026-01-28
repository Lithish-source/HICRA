# HICRA - Hybrid Interpretable Credit Risk Assessment

A production-grade, full-stack web application for assessing credit risk using a **Hybrid Decision Tree + Neural Network** approach. HICRA emphasizes **interpretability**, ensuring that every AI decision is transparent, ethical, and explainable.

## 🚀 Key Features

*   **Hybrid AI Model**: Combines the explicit rule-based logic of Decision Trees with the predictive power of Neural Networks.
*   **Interpretability First**: Prioritizes human-readable explanations (If/Then rules) over raw probability scores in cases of conflict.
*   **Interactive Dashboard**: Visualizes risk levels, model agreement status, feature importance, and decision paths.
*   **MySQL Database**: Production-ready data storage with SQLAlchemy ORM.
*   **Role-Based Access**: Admin and User roles with secure authentication.
*   **Modern Tech Stack**: React (Vite) + Tailwind CSS Frontend, FastAPI Backend, MySQL Database.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React
*   **Backend**: Python 3.9+, FastAPI, SQLAlchemy 2.0, Scikit-Learn
*   **Database**: MySQL 8.0+ with PyMySQL driver
*   **Security**: Passlib (bcrypt) for password hashing
*   **DevOps**: Docker, Docker Compose

## 📂 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI entry point & API endpoints
│   ├── model.py             # HybridModel logic (DT + NN + Explainability)
│   ├── database.py          # SQLAlchemy database connection
│   ├── models_db.py         # Database models (User, ApplicantProfile, Prediction)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── seed_database.py     # Database seeding script (imports CSV data)
│   ├── .env                 # Environment variables (MySQL credentials)
│   ├── .env.example         # Template for environment variables
│   ├── requirements.txt     # Python dependencies
│   ├── archive/
│   │   └── Loan.csv         # Source data for seeding
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page views (Dashboard, Predict, etc.)
│   │   └── App.jsx          # Routing logic
│   ├── index.html
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml       # Orchestration
```

## 🗄️ Database Setup (MySQL)

### Prerequisites
*   MySQL 8.0+ installed and running
*   MySQL Workbench (optional, for GUI management)

### Step 1: Create the Database

```sql
-- Open MySQL command line or Workbench and run:
CREATE DATABASE hicra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Environment Variables

Edit `backend/.env` with your MySQL credentials:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=hicra_db

ADMIN_EMAIL=demo1@admin.com
ADMIN_PASSWORD=12345
```

### Step 3: Install Backend Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Step 4: Seed the Database

This imports data from `Loan.csv` into MySQL:

```bash
python seed_database.py
```

You'll be prompted to choose how many records to import (e.g., 100, 500, or all).

### Step 5: Run the Backend

```bash
uvicorn main:app --reload
```

## 🔧 Local Development Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
python seed_database.py      # First-time setup only
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Default Login Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | demo1@admin.com   | 12345      |
| User  | user1@gmail.com   | password123|
| User  | user2@gmail.com   | password123|
| ...   | userN@gmail.com   | password123|

## 📡 API Endpoints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/health`             | Health check                         |
| POST   | `/login`              | User authentication                  |
| POST   | `/predict`            | Make risk prediction                 |
| GET    | `/user-data/{email}`  | Get user profile & prediction        |
| GET    | `/admin/all-data`     | Get all users (admin only)           |
| GET    | `/admin/stats`        | Get summary statistics               |
| POST   | `/add-applicant`      | Add new applicant                    |
| DELETE | `/admin/user/{id}`    | Delete user                          |
| GET    | `/predictions/{id}`   | Get prediction history               |

Full API documentation: `http://localhost:8000/docs`

## 🧠 Model Methodology

### Hybrid Logic
The system trains two models on the same dataset:
1.  **Decision Tree (DT)**: optimizing for interpretability.
2.  **Neural Network (NN)**: optimizing for non-linear pattern recognition.

**Conflict Resolution**:
> "In case of conflict, the Decision Tree explanation is prioritized."

This ensures that high-risk classifications can always be justified by clear rules (e.g., *Income < $30k AND DebtRatio > 0.5*), adhering to "Right to Explanation" principles.

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

Access:
*   Frontend: `http://localhost:3000`
*   Backend API: `http://localhost:8000/docs`

## 📄 License
Academic / MIT License.
