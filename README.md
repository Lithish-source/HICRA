# HICRA - Hybrid Interpretable Credit Risk Assessment

A production-grade, full-stack web application for assessing credit risk using a **Hybrid Decision Tree + Neural Network** approach. HICRA emphasizes **interpretability**, ensuring that every AI decision is transparent, ethical, and explainable.

## 🚀 Key Features

*   **Hybrid AI Model**: Combines the explicit rule-based logic of Decision Trees with the predictive power of Neural Networks.
*   **Interpretability First**: Prioritizes human-readable explanations (If/Then rules) over raw probability scores in cases of conflict.
*   **Interactive Dashboard**: Visualizes risk levels, model agreement status, feature importance, and decision paths.
*   **Demo Mode**: Uses a synthetic dataset to demonstrate capabilities without privacy concerns.
*   **Modern Tech Stack**: React (Vite) + Tailwind CSS Frontend, FastAPI Backend, Dockerized deployment.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React
*   **Backend**: Python 3.9, FastAPI, Scikit-Learn, TensorFlow/Keras, Pandas
*   **DevOps**: Docker, Docker Compose

## 📂 Project Structure

```
├── backend/
│   ├── main.py             # FastAPI entry point & API endpoints
│   ├── model.py            # HybridModel logic (DT + NN + Explainability)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Layout, etc.)
│   │   ├── pages/          # Page views (Home, Predict, Dashboard, Methodology)
│   │   └── App.jsx         # Routing logic
│   ├── index.html
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml      # Orchestration
```

## ⚡ Quick Start (Docker)

The easiest way to run the application is using Docker Compose.

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed.
2.  **Run**:
    ```bash
    docker-compose up --build
    ```
3.  **Access**:
    *   Frontend: `http://localhost:3000`
    *   Backend API: `http://localhost:8000/docs`

## 🔧 Local Development Setup

### Backend

1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    *The model will automatically train on synthetic data upon first startup.*

### Frontend

1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    npm install -D tailwindcss postcss autoprefixer
    npm install lucide-react recharts axios react-router-dom
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🧠 Model Methodology

### Hybrid Logic
The system trains two models on the same dataset:
1.  **Decision Tree (DT)**: optimizing for interpretability.
2.  **Neural Network (NN)**: optimizing for non-linear pattern recognition.

**Conflict Resolution**:
> "In case of conflict, the Decision Tree explanation is prioritized."

This ensures that high-risk classifications can always be justified by clear rules (e.g., *Income < $30k AND DebtRatio > 0.5*), adhering to "Right to Explanation" principles.

## 📸 Screenshots

*(Add screenshots of Home Page, Prediction Form, and Dashboard here)*

## 📄 License
Academic / MIT License.
