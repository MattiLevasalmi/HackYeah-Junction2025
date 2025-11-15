"""
Python Microservice for Sauna Model Predictions
Serves the PyTorch model via REST API for Node.js backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the directory containing the adapter to Python path
sys.path.append(os.path.dirname(__file__))

from sauna_model_adapter import SaunaModelAdapter

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend

# Initialize model adapter (adjust paths as needed)
MODEL_PATH = os.getenv('MODEL_PATH', './models/sauna_model_ts.pt')
PREPROCESSOR_PATH = os.getenv('PREPROCESSOR_PATH', './models/preprocessor.pkl')

try:
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
    """Batch prediction endpoint - returns individual predictions"""
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


@app.route('/predict-group', methods=['POST'])
def predict_group():
    """Group session prediction endpoint - calculates consensus for group"""
    if adapter is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    try:
        data = request.json
        
        # Support both formats: direct array or object with participants
        if isinstance(data, list):
            users_data = data
        elif isinstance(data, dict) and 'participants' in data:
            users_data = data['participants']
        else:
            return jsonify({'error': 'Expected list of user data or object with "participants" array'}), 400
        
        if not users_data or len(users_data) == 0:
            return jsonify({'error': 'At least one participant required'}), 400
        
        # Validate all inputs
        for i, user_data in enumerate(users_data):
            is_valid, error = adapter.validate_input(user_data)
            if not is_valid:
                return jsonify({'error': f'Invalid data for participant {i}: {error}'}), 400
        
        # Get individual predictions
        individual_predictions = adapter.predict_batch(users_data)
        
        # Calculate group consensus
        group_recommendation = calculate_group_consensus(individual_predictions, users_data)
        
        return jsonify(group_recommendation), 200
        
    except Exception as e:
        print(f"Group prediction error: {e}")
        return jsonify({'error': str(e)}), 500


def calculate_group_consensus(predictions, users_data):
    """Calculate optimal group settings from individual predictions"""
    
    # Extract values
    temps = [p['recommended_temp'] for p in predictions]
    humidities = [p['recommended_humidity'] for p in predictions]
    durations = [p['recommended_duration'] for p in predictions]
    breaks = [p['recommended_breaks'] for p in predictions]
    stress_after = [p['predicted_stress_level_after_sauna'] for p in predictions]
    
    # Calculate averages (rounded)
    avg_temp = round(sum(temps) / len(temps), 1)
    avg_humidity = round(sum(humidities) / len(humidities), 1)
    avg_duration = round(sum(durations) / len(durations))
    avg_breaks = round(sum(breaks) / len(breaks))
    avg_stress_after = round(sum(stress_after) / len(stress_after), 1)
    
    # Calculate variance
    temp_variance = round(max(temps) - min(temps), 1)
    humidity_variance = round(max(humidities) - min(humidities), 1)
    duration_variance = round(max(durations) - min(durations))
    
    # Determine consensus quality
    if temp_variance < 8:
        consensus_level = "excellent"
        consensus_note = "All participants have very similar preferences. Ideal group composition."
    elif temp_variance < 12:
        consensus_level = "good"
        consensus_note = "Minor differences in preferences. Group settings should satisfy everyone."
    elif temp_variance < 18:
        consensus_level = "moderate"
        consensus_note = "Noticeable differences in preferences. Some compromise required."
    else:
        consensus_level = "challenging"
        consensus_note = "Significant differences in preferences. Consider two separate sessions or be prepared for compromise."
    
    # Build participant details
    participants = []
    for i, (pred, user_data) in enumerate(zip(predictions, users_data)):
        participant = {
            'index': i,
            'userId': user_data.get('user_id', f'user_{i}'),
            'name': user_data.get('name', f'Participant {i+1}'),
            'experienceLevel': user_data.get('experience_level', 'unknown'),
            'individualRecommendation': {
                'temperature': round(pred['recommended_temp'], 1),
                'humidity': round(pred['recommended_humidity'], 1),
                'duration': round(pred['recommended_duration']),
                'breaks': round(pred['recommended_breaks']),
                'stressAfter': round(pred['predicted_stress_level_after_sauna'], 1)
            },
            'deviation': {
                'temperature': round(pred['recommended_temp'] - avg_temp, 1),
                'humidity': round(pred['recommended_humidity'] - avg_humidity, 1),
                'duration': round(pred['recommended_duration'] - avg_duration)
            }
        }
        participants.append(participant)
    
    # Sort by who needs to compromise most
    participants_sorted = sorted(participants, 
                                 key=lambda x: abs(x['deviation']['temperature']), 
                                 reverse=True)
    
    return {
        'participantCount': len(predictions),
        'groupRecommendation': {
            'temperature': {
                'value': avg_temp,
                'unit': '°C',
                'range': {
                    'min': round(min(temps), 1),
                    'max': round(max(temps), 1)
                }
            },
            'humidity': {
                'value': avg_humidity,
                'unit': '%',
                'range': {
                    'min': round(min(humidities), 1),
                    'max': round(max(humidities), 1)
                }
            },
            'duration': {
                'value': avg_duration,
                'unit': 'minutes',
                'range': {
                    'min': round(min(durations)),
                    'max': round(max(durations))
                }
            },
            'breaks': {
                'value': avg_breaks,
                'unit': 'breaks',
                'range': {
                    'min': round(min(breaks)),
                    'max': round(max(breaks))
                }
            },
            'expectedStressReduction': {
                'average': avg_stress_after,
                'unit': 'stress level (1-10)'
            }
        },
        'consensus': {
            'level': consensus_level,
            'note': consensus_note,
            'variance': {
                'temperature': temp_variance,
                'humidity': humidity_variance,
                'duration': duration_variance
            }
        },
        'participants': participants_sorted,
        'recommendations': {
            'bestFor': participants_sorted[-1]['name'] if participants_sorted else None,
            'mostCompromise': participants_sorted[0]['name'] if participants_sorted else None,
            'suggestion': get_group_suggestion(consensus_level, temp_variance, participants)
        }
    }


def get_group_suggestion(consensus_level, temp_variance, participants):
    """Generate helpful suggestions for group sessions"""
    if consensus_level == "excellent":
        return "Perfect group match! Everyone should be comfortable with these settings."
    elif consensus_level == "good":
        return "Good group compatibility. Start with these settings and adjust based on feedback."
    elif consensus_level == "moderate":
        suggestions = [
            "Consider starting at the average temperature and adjusting after 10 minutes.",
            "Those preferring cooler temperatures should sit on lower benches.",
            "Take breaks together to maintain group cohesion."
        ]
        return suggestions
    else:
        # Challenging group
        beginners = [p for p in participants if p.get('experienceLevel') == 'beginner']
        advanced = [p for p in participants if p.get('experienceLevel') == 'advanced']
        
        if beginners and advanced:
            return [
                "Large experience gap detected. Consider:",
                "- Two separate sessions (beginners first, then advanced)",
                "- Or start mild and let experienced users stay longer",
                f"- Temperature compromise may be uncomfortable for {beginners[0]['name']}"
            ]
        else:
            return [
                "Significant preference differences. Options:",
                "- Split into two groups",
                "- Start at lower temp, gradually increase",
                "- More frequent breaks to accommodate everyone"
            ]


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