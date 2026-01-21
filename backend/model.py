import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os

class HybridModel:
    def __init__(self, model_dir="models"):
        self.dt_model = None
        self.nn_model = None
        self.scaler = None
        # self.label_encoders = {} 
        self.model_dir = model_dir
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

    def generate_synthetic_data(self, n_samples=1000):
        """
        Generates a synthetic dataset mimicking credit risk factors.
        """
        np.random.seed(42)
        data = pd.DataFrame({
            'age': np.random.randint(18, 70, n_samples),
            'income': np.random.normal(50000, 15000, n_samples).astype(int),
            'credit_history_length': np.random.randint(0, 20, n_samples),
            'existing_loans': np.random.randint(0, 5, n_samples),
            'debt_to_income_ratio': np.random.uniform(0.1, 0.9, n_samples),
            'loan_amount': np.random.randint(1000, 50000, n_samples),
            'repayment_duration': np.random.randint(6, 60, n_samples),
            'employment_type': np.random.choice(['employed', 'self-employed', 'unemployed'], n_samples)
        })
        
        # Simple logical rules for target generation to ensure interpretability
        # Risk: 0 (Low), 1 (Medium), 2 (High)
        def assign_risk(row):
            risk_score = 0
            if row['income'] < 30000: risk_score += 2
            if row['debt_to_income_ratio'] > 0.5: risk_score += 2
            if row['employment_type'] == 'unemployed': risk_score += 3
            if row['credit_history_length'] < 2: risk_score += 1
            if row['age'] < 22: risk_score += 1
            
            if risk_score <= 1: return 0 # Low
            elif risk_score <= 3: return 1 # Medium
            else: return 2 # High

        data['risk_classification'] = data.apply(assign_risk, axis=1)
        return data

    def train(self):
        print("Generating synthetic data...")
        df = self.generate_synthetic_data()
        
        # Preprocessing
        # For simplicity in this skeleton, we handle categorical encoding manually or via LabelEncoder later
        # Sticking to numericals for the prototype for now or simple mapping
        df['employment_type'] = df['employment_type'].map({'employed': 0, 'self-employed': 1, 'unemployed': 2})
        
        X = df.drop('risk_classification', axis=1)
        y = df['risk_classification']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale data
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # 1. Train Decision Tree
        print("Training Decision Tree...")
        self.dt_model = DecisionTreeClassifier(max_depth=5, random_state=42)
        self.dt_model.fit(X_train, y_train) # Use unscaled for better interpretability? Or scaled? Trees don't need scaling usually.
        # Let's use unscaled X_train for DT interpretability
        
        # 2. Train Neural Network (MLPClassifier)
        print("Training Neural Network...")
        self.nn_model = MLPClassifier(hidden_layer_sizes=(16, 8), activation='relu', solver='adam', max_iter=500, random_state=42)
        self.nn_model.fit(X_train_scaled, y_train)
        
        # Save models
        joblib.dump(self.dt_model, os.path.join(self.model_dir, "dt_model.pkl"))
        joblib.dump(self.scaler, os.path.join(self.model_dir, "scaler.pkl"))
        joblib.dump(self.nn_model, os.path.join(self.model_dir, "nn_model.pkl"))
        print("Models saved.")

    def load(self):
        self.dt_model = joblib.load(os.path.join(self.model_dir, "dt_model.pkl"))
        self.scaler = joblib.load(os.path.join(self.model_dir, "scaler.pkl"))
        self.nn_model = joblib.load(os.path.join(self.model_dir, "nn_model.pkl"))

    def predict(self, input_data):
        """
        Predicts risk using both DT and NN.
        input_data: dict of values
        """
        if self.dt_model is None or self.nn_model is None:
            self.load()

        # Convert input dict to DataFrame
        df = pd.DataFrame([input_data])
        # Map categorical
        df['employment_type'] = df['employment_type'].map({'employed': 0, 'self-employed': 1, 'unemployed': 2})
        
        # Ensure column order matches training
        # For prototype, we assume input keys match training columns. 
        # In production, enforce column order explicitly.
        feature_order = ['age', 'income', 'credit_history_length', 'existing_loans', 'debt_to_income_ratio', 'loan_amount', 'repayment_duration', 'employment_type']
        X = df[feature_order]
        
        # DT Prediction
        dt_pred_class = self.dt_model.predict(X)[0]
        dt_conf = float(np.max(self.dt_model.predict_proba(X))) # DT confidence is usually 1.0 (pure leaf) or fraction

        # NN Prediction
        X_scaled = self.scaler.transform(X)
        nn_pred_proba = self.nn_model.predict_proba(X_scaled)[0]
        nn_pred_class = int(np.argmax(nn_pred_proba))
        nn_conf = float(np.max(nn_pred_proba))

        # Hybrid Logic (Interpretability First)
        # If models disagree, we can flag it. 
        # Strategy: Use DT for the 'official' explanation and class if we want strict interpretability.
        # Or use NN for class if higher confidence, but report disagreement.
        
        # User requested: "In case of conflict, the Decision Tree explanation is prioritized over Neural Network probability."
        # This implies the DECISION (Outcome) might follow DT, or at least the EXPLANATION does.
        # Let's return both for the dashboard to show agreement.
        
        # Final Decision: Default to DT if we strictly follow "Interpretability First" for the final verdict, 
        # or weighted average? The user said "Agreement Status", implying we show both.
        # Let's say Final = DT (safe, rule-based) unless NN is SUPER confident? 
        # For this "Interpretability First" requirement, I will make DT the primary driver for the 'Risk Level' 
        # but show NN as a second opinion.
        
        final_risk = dt_pred_class # 0, 1, 2
        
        risk_map = {0: "Low", 1: "Medium", 2: "High"}
        
        return {
            "risk_level": risk_map[final_risk],
            "dt_prediction": risk_map[dt_pred_class],
            "nn_prediction": risk_map[nn_pred_class],
            "dt_confidence": round(dt_conf, 2),
            "nn_confidence": round(nn_conf, 2),
            "agreement": bool(dt_pred_class == nn_pred_class),
            "final_confidence": round((dt_conf + nn_conf) / 2, 2) # Weighted average
        }

    def explain(self, input_data):
        """
        Returns feature importance and decision path.
        """
        if self.dt_model is None:
            self.load()
            
        df = pd.DataFrame([input_data])
        df['employment_type'] = df['employment_type'].map({'employed': 0, 'self-employed': 1, 'unemployed': 2})
        feature_order = ['age', 'income', 'credit_history_length', 'existing_loans', 'debt_to_income_ratio', 'loan_amount', 'repayment_duration', 'employment_type']
        X = df[feature_order]
        
        # Feature Importance
        importances = self.dt_model.feature_importances_
        feature_imp = dict(zip(feature_order, [round(float(x), 4) for x in importances]))
        
        # Rule Path
        # We can use export_text to get a text representation, but for specific instance path:
        node_indicator = self.dt_model.decision_path(X)
        leaf_id = self.dt_model.apply(X)[0]
        feature = self.dt_model.tree_.feature
        threshold = self.dt_model.tree_.threshold
        
        sample_id = 0
        node_index = node_indicator.indices[node_indicator.indptr[sample_id]:node_indicator.indptr[sample_id + 1]]
        
        rules = []
        for node_id in node_index:
            if leaf_id == node_id:
                continue
            
            if (X.iloc[0, feature[node_id]] <= threshold[node_id]):
                threshold_sign = "<="
            else:
                threshold_sign = ">"
            
            rules.append(f"{feature_order[feature[node_id]]} {threshold_sign} {threshold[node_id]:.2f}")
            
        return {
            "rules": rules,
            "feature_importance": feature_imp
        }

if __name__ == "__main__":
    hm = HybridModel()
    hm.train()
