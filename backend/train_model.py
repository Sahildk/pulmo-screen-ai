import pandas as pd
import json
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train():
    os.makedirs('model', exist_ok=True)
    df = pd.read_excel('../Dataset.xlsx')

    # Ensure no leading/trailing spaces in column names
    df.columns = df.columns.str.strip()

    # Preprocessing
    encoders = {}
    X = df.drop('LUNG_CANCER', axis=1)
    y = df['LUNG_CANCER']

    # Encode target
    label_encoder_y = LabelEncoder()
    y = label_encoder_y.fit_transform(y)
    encoders['LUNG_CANCER'] = label_encoder_y

    # Encode features
    categorical_cols = X.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le

    # Save encoders
    joblib.dump(encoders, 'model/encoders.pkl')

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    # SMOTE
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

    # Models
    models = {
        'Random Forest': RandomForestClassifier(random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'KNN': KNeighborsClassifier(),
        'Decision Tree': DecisionTreeClassifier(random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1

    for name, model in models.items():
        model.fit(X_train_resampled, y_train_resampled)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, pos_label=1) # 1 is YES
        rec = recall_score(y_test, y_pred, pos_label=1)
        f1 = f1_score(y_test, y_pred, pos_label=1)
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1': f1,
            'confusion_matrix': cm
        }

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    # Save best model
    best_model = models[best_model_name]
    joblib.dump(best_model, 'model/best_model.pkl')

    # Save feature importance if available (RF, DT, LR)
    feature_importance = {}
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        feature_importance = {col: float(imp) for col, imp in zip(X.columns, importances)}
    elif hasattr(best_model, 'coef_'):
        # For Logistic Regression, use absolute value of coefficients
        importances = abs(best_model.coef_[0])
        total = sum(importances)
        # Normalize to 1 sum to match feature_importances_
        importances = [imp / total for imp in importances]
        feature_importance = {col: float(imp) for col, imp in zip(X.columns, importances)}
        
    if feature_importance:
        # Sort descending
        feature_importance = dict(sorted(feature_importance.items(), key=lambda item: item[1], reverse=True))

    with open('model/comparison.json', 'w') as f:
        json.dump(results, f, indent=4)
        
    with open('model/metrics.json', 'w') as f:
        json.dump(results[best_model_name], f, indent=4)

    with open('model/feature_importance.json', 'w') as f:
        json.dump(feature_importance, f, indent=4)

    print(f"Training complete. Best model: {best_model_name} (F1: {best_f1:.4f})")

if __name__ == '__main__':
    train()
