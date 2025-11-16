"""
Sauna Model Adapter
===================
This adapter prepares data from the database/API for the sauna recommendation model
and transforms predictions back to a usable format.
"""

import torch
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime


class SaunaModelAdapter:
    """
    Adapter for the sauna recommendation model.
    Handles data preparation, prediction, and result formatting.
    """
    
    # 1. Define all RAW features
    REQUIRED_FEATURES = [
        'age', 'sex', 'experience_level', 'stress_level',
        'outside_temp', 'outside_humidity', 'sessions_last_month'
    ]
    
    OPTIONAL_FEATURES = [
        'heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
        'time_of_day', 'day_of_year', 'wind_direction', 'moon_phase',
        'session_focus', 'session_type', 'dominant_experience', 'dominant_focus'
    ]
    
    MISSING_TRAINING_FEATURES = [
        'group_size', 'sauna_avg_temp', 'min_hrv', 'calories_burned', 
        'sauna_total_time_minutes', 'sauna_avg_session_time', 'sauna_avg_bathing_duration', 
        'respiratory_rate', 'sleep_deep', 'max_resting_hr', 'sauna_30d_avg_bathing_duration', 
        'inactive_minutes', 'day_length_hours', 'workout_intensity', 'daily_activity_level', 
        'sleep_spo2', 'hrv', 'avg_age', 'night_movement_index', 'step_count', 
        'sleep_efficiency', 'sex_ratio_female', 'weather_pressure', 'sauna_30d_total_time', 
        'avg_sleep_total', 'wind_speed', 'sauna_sessions_per_month', 'skin_temp_variation', 
        'sauna_30d_sessions', 'avg_resting_hr', 'uv_index', 'avg_heart_rate_activity', 
        'sleep_light', 'sleep_rem', 'avg_daily_activity', 'sauna_avg_humidity', 
        'weather_humidity', 'resting_hr', 'sleep_awake', 'precipitation', 
        'weather_temp', 'avg_hrv', 'sauna_30d_avg_session_time', 'sleep_total'
    ]
    
    ALL_RAW_FEATURES = REQUIRED_FEATURES + OPTIONAL_FEATURES + MISSING_TRAINING_FEATURES
    
    # 2. Define all ENGINEERED features (derived from your training script)
    ENGINEERED_FEATURES = [
        'temp_hum_interaction', 'comfort_index', 'is_cold_outside', 'is_hot_outside',
        'is_dry', 'is_humid', 'is_senior', 'is_young', 'high_stress', 'low_stress',
        'is_regular', 'is_beginner', 'is_winter', 'is_summer'
    ]
    
    # 3. Define the final features expected by the ColumnTransformer (order matters!)
    # This list must match the order of columns in X_raw during training.
    # We combine RAW features + ENGINEERED features.
    PREPROCESSOR_INPUT_COLS = ALL_RAW_FEATURES + ENGINEERED_FEATURES

    # 4. CRITICAL: Mean Imputation Dictionary (PLACEHOLDERS!)
    # >>> YOU MUST UPDATE THESE WITH ACTUAL MEANS FROM TRAINING DATA! <<<
    TRAINING_MEANS: Dict[str, float] = {
        'age': 40.0, 'stress_level': 5.0, 'outside_temp': 15.0, 'outside_humidity': 60.0, 
        'sessions_last_month': 4.0, 'heart_rate': 70.0, 'blood_pressure_systolic': 120.0, 
        'blood_pressure_diastolic': 80.0, 'time_of_day': 12.0, 'day_of_year': 180.0, 
        'group_size': 1.0, 'min_hrv': 45.0, 'sleep_total': 420.0, 'avg_resting_hr': 65.0, 
        'sauna_avg_temp': 80.0, 'calories_burned': 0.0, 'sauna_total_time_minutes': 0.0, 
        'sauna_avg_session_time': 0.0, 'sauna_avg_bathing_duration': 0.0, 
        'respiratory_rate': 0.0, 'sleep_deep': 0.0, 'max_resting_hr': 0.0, 
        'sauna_30d_avg_bathing_duration': 0.0, 'inactive_minutes': 0.0, 'day_length_hours': 0.0, 
        'workout_intensity': 0.0, 'daily_activity_level': 0.0, 'sleep_spo2': 0.0, 
        'hrv': 0.0, 'avg_age': 0.0, 'night_movement_index': 0.0, 'step_count': 0.0, 
        'sleep_efficiency': 0.0, 'sex_ratio_female': 0.0, 'weather_pressure': 0.0, 
        'sauna_30d_total_time': 0.0, 'avg_sleep_total': 0.0, 'wind_speed': 0.0, 
        'sauna_sessions_per_month': 0.0, 'skin_temp_variation': 0.0, 'sauna_30d_sessions': 0.0, 
        'uv_index': 0.0, 'avg_heart_rate_activity': 0.0, 'sleep_light': 0.0, 'sleep_rem': 0.0, 
        'avg_daily_activity': 0.0, 'sauna_avg_humidity': 0.0, 'weather_humidity': 0.0, 
        'resting_hr': 0.0, 'sleep_awake': 0.0, 'precipitation': 0.0, 'weather_temp': 0.0, 
        'avg_hrv': 0.0, 'sauna_30d_avg_session_time': 0.0, 
    }
    # --------------------------------------------------------------------------
    
    # Output target names
    TARGET_NAMES = [
        'recommended_temp', 'recommended_humidity', 'recommended_duration',
        'recommended_next_session_days', 'recommended_breaks',
        'predicted_stress_level_after_sauna'
    ]
    
    def __init__(self, model_path: str, preprocessor_path: str):
        """Initialize the adapter"""
        self.model = torch.jit.load(model_path, map_location=torch.device('cpu'))
        self.model.eval()
        self.preprocessor = joblib.load(preprocessor_path)
        
        print(f"✓ Model loaded from {model_path}")
        print(f"✓ Preprocessor loaded from {preprocessor_path}")
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create engineered features that the model expects."""
        df = df.copy()
        
        # NOTE: Using .get(col) checks to ensure that if a user removes a raw feature, 
        # the downstream engineered feature is still not created.
        
        # Weather-related interactions
        if 'outside_temp' in df.columns and 'outside_humidity' in df.columns:
            df['temp_hum_interaction'] = df['outside_temp'] * df['outside_humidity'] / 100
            df['comfort_index'] = df['outside_temp'] - 0.55 * (1 - df['outside_humidity']/100) * (df['outside_temp'] - 14.5)
        
        if 'outside_temp' in df.columns:
            df['is_cold_outside'] = (df['outside_temp'] < 10).astype(int)
            df['is_hot_outside'] = (df['outside_temp'] > 25).astype(int)
        
        if 'outside_humidity' in df.columns:
            df['is_dry'] = (df['outside_humidity'] < 40).astype(int)
            df['is_humid'] = (df['outside_humidity'] > 70).astype(int)
        
        # User characteristics (CRITICAL FOR FIXING 'is_young', 'is_senior' ERROR)
        if 'age' in df.columns:
            # Must be numeric to perform comparison
            df['is_senior'] = (df['age'] > 60).astype(int)
            df['is_young'] = (df['age'] < 30).astype(int)
        
        if 'stress_level' in df.columns:
            df['high_stress'] = (df['stress_level'] > 7).astype(int)
            df['low_stress'] = (df['stress_level'] < 4).astype(int)
        
        # Experience level interactions
        if 'sessions_last_month' in df.columns:
            df['is_regular'] = (df['sessions_last_month'] >= 4).astype(int)
            df['is_beginner'] = (df['sessions_last_month'] < 2).astype(int)
        
        # Time features
        if 'day_of_year' in df.columns:
            df['is_winter'] = ((df['day_of_year'] < 80) | (df['day_of_year'] > 355)).astype(int)
            df['is_summer'] = ((df['day_of_year'] > 172) & (df['day_of_year'] < 264)).astype(int)
        
        return df
    
    def prepare_input(self, user_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Convert raw user data from database/API to model input format.
        """
        data = user_data.copy()
        
        # 0. Add Time Features
        if 'day_of_year' not in data:
            data['day_of_year'] = datetime.now().timetuple().tm_yday
        if 'time_of_day' not in data:
            data['time_of_day'] = datetime.now().hour
        
        # 1. Ensure all RAW features are present (impute with None initially)
        for feature in self.ALL_RAW_FEATURES:
            if feature not in data:
                data[feature] = None 
        
        df = pd.DataFrame([data])
        
        # 2. Handle missing/types for categorical features
        cat_cols = ['sex', 'wind_direction', 'moon_phase', 'experience_level', 
                    'session_focus', 'session_type', 'dominant_experience', 'dominant_focus']
        for col in cat_cols:
            if col in df.columns:
                df[col] = df[col].astype(str).replace('None', 'unknown')
                df[col] = df[col].fillna('unknown')
        
        # 3. Mean Imputation and Type Casting for Numeric Features
        numeric_cols_to_check = [c for c in self.ALL_RAW_FEATURES if c not in cat_cols]
        for col in numeric_cols_to_check:
            if col in df.columns:
                # Force conversion to float, coercing errors
                df[col] = pd.to_numeric(df[col], errors='coerce')
                
                if df[col].isna().any():
                    # Impute NaN with the training mean
                    impute_value = self.TRAINING_MEANS.get(col, 0.0) 
                    df[col] = df[col].fillna(impute_value)
                
                # Ensure final type is float for calculation stability
                df[col] = df[col].astype(float)
        
        # 4. Engineer features (must happen BEFORE preprocessor.transform)
        df = self.engineer_features(df)
        
        # 5. --- CRITICAL FIX: Reorder and Filter Columns ---
        # The DataFrame must contain EXACTLY the columns the preprocessor was fitted on,
        # in the exact order.
        df_final = df.reindex(columns=self.PREPROCESSOR_INPUT_COLS, fill_value=0.0)
        
        # Remove columns that still could not be created (they shouldn't exist if all raw features are covered)
        df_final = df_final.dropna(axis=1, how='all')

        return df_final
    
    def predict(self, user_data: Dict[str, Any]) -> Dict[str, float]:
        """Make a prediction for a single user."""
        df = self.prepare_input(user_data)
        
        # Transform using preprocessor
        X = self.preprocessor.transform(df)
        
        # Check for NaNs *after* preprocessing (safety check)
        if np.isnan(X).any():
             raise ValueError("NaN detected in preprocessed features. Imputation may be incorrect.")
        
        # Convert to tensor
        X_tensor = torch.tensor(X, dtype=torch.float32)
        
        # Predict
        with torch.no_grad():
            predictions = self.model(X_tensor).numpy()[0]
        
        # Format output
        result = {}
        for i, target in enumerate(self.TARGET_NAMES):
            if np.isnan(predictions[i]):
                 result[target] = float('nan')
            else:
                 result[target] = float(predictions[i])
        
        return result
    
    def predict_batch(self, users_data: List[Dict[str, Any]]) -> List[Dict[str, float]]:
        """Make predictions for multiple users."""
        dfs = [self.prepare_input(user_data) for user_data in users_data]
        df_combined = pd.concat(dfs, ignore_index=True)
        
        # Transform
        X = self.preprocessor.transform(df_combined)
        
        # Check for NaNs *after* preprocessing
        if np.isnan(X).any():
             raise ValueError("NaN detected in preprocessed features batch. Imputation may be incorrect.")

        X_tensor = torch.tensor(X, dtype=torch.float32)
        
        # Predict
        with torch.no_grad():
            predictions = self.model(X_tensor).numpy()
        
        # Format outputs
        results = []
        for pred in predictions:
            result = {}
            for i, target in enumerate(self.TARGET_NAMES):
                if np.isnan(pred[i]):
                    result[target] = float('nan')
                else:
                    result[target] = float(pred[i])
            results.append(result)
        
        return results
    
    def validate_input(self, user_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate that user data contains required fields and values are in valid ranges."""
        missing = [f for f in self.REQUIRED_FEATURES if f not in user_data]
        if missing:
            return False, f"Missing required features: {', '.join(missing)}"
        
        validations = {
            'age': (1, 120, 'Age must be between 1 and 120'),
            'stress_level': (0, 10, 'Stress level must be between 0 and 10'),
            'outside_temp': (-50, 50, 'Outside temperature must be between -50°C and 50°C'),
            'outside_humidity': (0, 100, 'Outside humidity must be between 0% and 100%'),
            'sessions_last_month': (0, 100, 'Sessions last month must be between 0 and 100')
        }
        
        for field, (min_val, max_val, msg) in validations.items():
            if field in user_data:
                val = user_data[field]
                if val is not None and (val < min_val or val > max_val):
                    return False, msg
        
        valid_sex = ['male', 'female', 'other', 'unknown']
        if user_data.get('sex') and user_data['sex'] not in valid_sex:
            return False, f"Invalid sex value. Must be one of: {', '.join(valid_sex)}"
        
        valid_experience = ['beginner', 'intermediate', 'advanced', 'unknown']
        if user_data.get('experience_level') and user_data['experience_level'] not in valid_experience:
            return False, f"Invalid experience_level. Must be one of: {', '.join(valid_experience)}"
        
        return True, None


# Example usage for testing
if __name__ == "__main__":
    try:
        adapter = SaunaModelAdapter(
            model_path='./models/sauna_model_ts.pt',
            preprocessor_path='./models/preprocessor.pkl'
        )
        
        user_data = {
            'age': 35,
            'sex': 'male',
            'experience_level': 'intermediate',
            'stress_level': 7,
            'outside_temp': 15.5,
            'outside_humidity': 65,
            'sessions_last_month': 6,
            'heart_rate': 72
        }
        
        is_valid, error = adapter.validate_input(user_data)
        if not is_valid:
            print(f"Validation error: {error}")
        else:
            predictions = adapter.predict(user_data)
            print("\nPredictions:")
            for key, value in predictions.items():
                print(f"  {key}: {value:.2f}")
        
    except Exception as e:
        print(f"Error during testing or initialization: {e}")