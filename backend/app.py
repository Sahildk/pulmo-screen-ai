from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import json
import os

app = Flask(__name__)
CORS(app)

# Load resources
model_path = os.path.join(os.path.dirname(__file__), 'model', 'best_model.pkl')
encoders_path = os.path.join(os.path.dirname(__file__), 'model', 'encoders.pkl')

best_model = joblib.load(model_path)
encoders = joblib.load(encoders_path)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # Order should match training exactly except LUNG_CANCER.
        # Let's get the original columns from encoders to be exact, but LUNG_CANCER is target
        cols = [
            'GENDER', 'AGE', 'SMOKING', 'YELLOW_FINGERS', 'ANXIETY',
            'PEER_PRESSURE', 'CHRONIC_DISEASE', 'FATIGUE', 'ALLERGY',
            'WHEEZING', 'ALCOHOL_CONSUMING', 'COUGHING', 'SHORTNESS_OF_BREATH',
            'SWALLOWING_DIFFICULTY', 'CHEST_PAIN', 'AGE_GROUP'
        ]
        
        # Keep only required columns in proper order
        df = df[cols]
        
        # Preprocess
        for col in cols:
            if col in encoders and col != 'AGE': # Age is numeric
                # Handle unknown labels if any (fallback to 0 or something, though in this form unlikely)
                try:
                    df[col] = encoders[col].transform(df[col])
                except ValueError:
                    # just a fallback
                    pass
        
        # Predict
        prediction = best_model.predict(df)
        probability = best_model.predict_proba(df)[0][1] if hasattr(best_model, 'predict_proba') else None
        
        # Inverse transform
        result = encoders['LUNG_CANCER'].inverse_transform(prediction)[0]
        
        return jsonify({
            'prediction': result,
            'probability': float(probability) if probability is not None else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        with open('model/metrics.json', 'r') as f:
            metrics = json.load(f)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    try:
        if os.path.exists('model/feature_importance.json'):
            with open('model/feature_importance.json', 'r') as f:
                importance = json.load(f)
            return jsonify(importance)
        else:
            return jsonify({})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comparison', methods=['GET'])
def get_comparison():
    try:
        with open('model/comparison.json', 'r') as f:
            comparison = json.load(f)
        return jsonify(comparison)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
