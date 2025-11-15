from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from sauna_model_adapter import SaunaModelAdapter


# Add the directory containing the adapter to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)



app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend

# Initialize model adapter (adjust paths as needed)
# MODEL_PATH = os.getenv('MODEL_PATH', './models/sauna_model_ts.pt')
# PREPROCESSOR_PATH = os.getenv('PREPROCESSOR_PATH', './models/preprocessor.pkl')

TEST_BASE_PATH = '/home/daniel/workspace/github.com/junction_hackathon/HackYeah-Junction2025/ml-service/models/'

MODEL_PATH = os.path.join(TEST_BASE_PATH, 'sauna_model_ts.pt')
PREPROCESSOR_PATH = os.path.join(TEST_BASE_PATH, 'preprocessor.pkl')

try:
    print(f"ATTEMPTING TO LOAD MODEL FROM: {MODEL_PATH}")
    print(f"ATTEMPTING TO LOAD PREPROCESSOR FROM: {PREPROCESSOR_PATH}")
    adapter = SaunaModelAdapter(MODEL_PATH, PREPROCESSOR_PATH)
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Failed to load model: {e}")
    adapter = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if adapter is None:
        return jsonify({'status': 'unhealthy', 'error': 'Model not loaded'}), 503
    return jsonify({'status': 'healthy'}), 200


@app.route('/predict', methods=['POST'])
def predict():
    """Single prediction endpoint"""
    if adapter is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    try:
        user_data = request.json
        
        # Validate input
        is_valid, error = adapter.validate_input(user_data)
        if not is_valid:
            return jsonify({'error': error}), 400
        
        # Get prediction
        predictions = adapter.predict(user_data)
        
        return jsonify(predictions), 200
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Batch prediction endpoint"""
    if adapter is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    try:
        users_data = request.json
        
        if not isinstance(users_data, list):
            return jsonify({'error': 'Expected list of user data'}), 400
        
        # Validate all inputs
        for i, user_data in enumerate(users_data):
            is_valid, error = adapter.validate_input(user_data)
            if not is_valid:
                return jsonify({'error': f'Invalid data at index {i}: {error}'}), 400
        
        # Get predictions
        predictions = adapter.predict_batch(users_data)
        
        return jsonify(predictions), 200
        
    except Exception as e:
        print(f"Batch prediction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if adapter is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    return jsonify({
        'required_features': adapter.REQUIRED_FEATURES,
        'optional_features': adapter.OPTIONAL_FEATURES,
        'target_names': adapter.TARGET_NAMES,
    }), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='127.0.0.1', port=port, debug=False)