from typing import List, Dict, Optional, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest
from models.patient_data import VitalReading

# Global model storage for continuous learning
_isolation_models = {}
_ewma_states = {}

class AnomalyDetectionConfig:
    """Configuration for anomaly detection thresholds and parameters"""
    
    # Rule-based thresholds
    HR_MIN = 40
    HR_MAX = 130
    SPO2_MIN = 90
    TEMP_MIN = 35.0
    TEMP_MAX = 38.5
    ECG_MAX = 8
    
    # EWMA parameters
    EWMA_ALPHA = 0.3
    EWMA_STD_MULTIPLIER = 3
    EWMA_MIN_HISTORY = 5
    
    # Isolation Forest parameters
    IF_N_ESTIMATORS = 100
    IF_CONTAMINATION = 0.05
    IF_RANDOM_STATE = 42
    
    # Risk fusion weights
    WEIGHT_RULE = 0.4
    WEIGHT_EWMA = 0.3
    WEIGHT_IF = 0.3
    ALERT_THRESHOLD = 0.7

def get_bp_thresholds(bmi: float) -> Tuple[float, float, float, float]:
    """
    Get BMI-aware blood pressure thresholds
    Returns: (sys_low, sys_high, dia_low, dia_high)
    """
    if bmi < 18.5:  # Underweight
        return (90, 120, 60, 80)
    elif bmi < 25:  # Normal weight
        return (110, 130, 70, 85)
    elif bmi < 30:  # Overweight
        return (120, 140, 75, 90)
    else:  # Obese
        return (130, 160, 80, 100)

def check_rule_based_anomaly(data: VitalReading) -> Dict:
    """
    Rule-based anomaly detection using clinical thresholds
    
    Args:
        data: VitalReading object with patient vitals
        
    Returns:
        Dict with anomaly flag, triggered rules, and confidence score
    """
    triggered_rules = []
    
    # Heart rate check
    if data.heart_rate:
        if data.heart_rate < AnomalyDetectionConfig.HR_MIN or data.heart_rate > AnomalyDetectionConfig.HR_MAX:
            triggered_rules.append(f"HR: {data.heart_rate} (normal: {AnomalyDetectionConfig.HR_MIN}-{AnomalyDetectionConfig.HR_MAX})")
    
    # SpO2 check
    if data.spo2:
        if data.spo2 < AnomalyDetectionConfig.SPO2_MIN:
            triggered_rules.append(f"SpO2: {data.spo2}% (normal: >{AnomalyDetectionConfig.SPO2_MIN}%)")
    
    # Blood pressure check (BMI-aware)
    if data.bp_systolic and data.bp_diastolic and hasattr(data, 'bmi') and data.bmi:
        sys_low, sys_high, dia_low, dia_high = get_bp_thresholds(data.bmi)
        if (data.bp_systolic < sys_low or data.bp_systolic > sys_high or 
            data.bp_diastolic < dia_low or data.bp_diastolic > dia_high):
            triggered_rules.append(f"BP: {data.bp_systolic}/{data.bp_diastolic} (normal: {sys_low}-{sys_high}/{dia_low}-{dia_high})")
    elif data.bp_systolic and data.bp_diastolic:
        # Fallback to standard thresholds if BMI not available
        if data.bp_systolic > 180 or data.bp_diastolic > 110:
            triggered_rules.append(f"BP: {data.bp_systolic}/{data.bp_diastolic} (critical threshold)")
    
    # Temperature check
    if data.temperature:
        if data.temperature < AnomalyDetectionConfig.TEMP_MIN or data.temperature > AnomalyDetectionConfig.TEMP_MAX:
            triggered_rules.append(f"Temp: {data.temperature}°C (normal: {AnomalyDetectionConfig.TEMP_MIN}-{AnomalyDetectionConfig.TEMP_MAX})")
    
    # ECG check (if available)
    if hasattr(data, 'ecg_score') and data.ecg_score:
        if data.ecg_score > AnomalyDetectionConfig.ECG_MAX:
            triggered_rules.append(f"ECG: {data.ecg_score} (normal: <{AnomalyDetectionConfig.ECG_MAX})")
    
    is_anomaly = len(triggered_rules) > 0
    confidence = min(len(triggered_rules) * 0.3, 1.0)  # Max confidence = 1.0
    
    return {
        "is_anomaly": is_anomaly,
        "confidence": confidence,
        "triggered_rules": triggered_rules,
        "method": "rule_based"
    }

def check_ewma_anomaly(data: VitalReading, patient_id: str, history: List[dict]) -> Dict:
    """
    EWMA-based anomaly detection for trend analysis
    
    Args:
        data: Current VitalReading
        patient_id: Unique patient identifier
        history: List of historical vital readings
        
    Returns:
        Dict with anomaly flag, EWMA values, and confidence score
    """
    if len(history) < AnomalyDetectionConfig.EWMA_MIN_HISTORY:
        return {
            "is_anomaly": False,
            "confidence": 0.0,
            "reason": "Insufficient history for EWMA analysis",
            "method": "ewma"
        }
    
    # Initialize EWMA state for patient if not exists
    if patient_id not in _ewma_states:
        _ewma_states[patient_id] = {}
    
    vitals_to_check = {
        'heart_rate': data.heart_rate,
        'spo2': data.spo2,
        'bp_systolic': data.bp_systolic,
        'bp_diastolic': data.bp_diastolic,
        'temperature': data.temperature
    }
    
    anomaly_details = []
    max_deviation = 0.0
    
    for vital_name, current_value in vitals_to_check.items():
        if current_value is None:
            continue
            
        # Extract historical values
        historical_values = [h.get(vital_name) for h in history if h.get(vital_name) is not None]
        if len(historical_values) < AnomalyDetectionConfig.EWMA_MIN_HISTORY:
            continue
        
        # Calculate EWMA
        alpha = AnomalyDetectionConfig.EWMA_ALPHA
        ewma = historical_values[0]
        for val in historical_values[1:]:
            ewma = alpha * val + (1 - alpha) * ewma
        
        # Calculate rolling standard deviation
        if len(historical_values) >= 10:
            recent_values = historical_values[-10:]
            rolling_std = np.std(recent_values)
        else:
            rolling_std = np.std(historical_values)
        
        # Check for anomaly
        if rolling_std > 0:
            deviation = abs(current_value - ewma) / rolling_std
            if deviation > AnomalyDetectionConfig.EWMA_STD_MULTIPLIER:
                anomaly_details.append(f"{vital_name}: {current_value:.1f} (EWMA: {ewma:.1f}, deviation: {deviation:.1f}σ)")
                max_deviation = max(max_deviation, deviation)
    
    is_anomaly = len(anomaly_details) > 0
    confidence = min(max_deviation / AnomalyDetectionConfig.EWMA_STD_MULTIPLIER, 1.0) if is_anomaly else 0.0
    
    return {
        "is_anomaly": is_anomaly,
        "confidence": confidence,
        "anomaly_details": anomaly_details,
        "method": "ewma"
    }

def check_isolation_forest_anomaly(data: VitalReading, patient_id: str, history: List[dict]) -> Dict:
    """
    Isolation Forest-based anomaly detection for multi-variate patterns
    
    Args:
        data: Current VitalReading
        patient_id: Unique patient identifier
        history: List of historical vital readings for training
        
    Returns:
        Dict with anomaly flag, anomaly score, and confidence
    """
    # Minimum history required for training
    if len(history) < 50:
        return {
            "is_anomaly": False,
            "confidence": 0.0,
            "anomaly_score": 0.0,
            "reason": "Insufficient history for Isolation Forest training",
            "method": "isolation_forest"
        }
    
    # Prepare feature vector for current data
    current_features = [
        data.heart_rate or 75,  # Default values for missing data
        data.spo2 or 98,
        data.bp_systolic or 120,
        data.bp_diastolic or 80,
        data.temperature or 37.0,
        getattr(data, 'ecg_score', 2) or 2  # ECG score with default
    ]
    
    # Prepare training data from history
    training_data = []
    for record in history:
        features = [
            record.get('heart_rate', 75),
            record.get('spo2', 98),
            record.get('bp_systolic', 120),
            record.get('bp_diastolic', 80),
            record.get('temperature', 37.0),
            record.get('ecg_score', 2)
        ]
        training_data.append(features)
    
    training_data = np.array(training_data)
    
    # Train or retrieve Isolation Forest model
    model_key = f"{patient_id}_isolation_forest"
    
    if model_key not in _isolation_models:
        # Train new model
        iforest = IsolationForest(
            n_estimators=AnomalyDetectionConfig.IF_N_ESTIMATORS,
            contamination=AnomalyDetectionConfig.IF_CONTAMINATION,
            random_state=AnomalyDetectionConfig.IF_RANDOM_STATE
        )
        iforest.fit(training_data)
        _isolation_models[model_key] = iforest
    else:
        iforest = _isolation_models[model_key]
    
    # Predict anomaly for current data
    current_array = np.array([current_features])
    prediction = iforest.predict(current_array)[0]  # -1 = anomaly, 1 = normal
    anomaly_score = iforest.decision_function(current_array)[0]
    
    # Convert to 0-1 scale (higher = more anomalous)
    normalized_score = max(0, (0.5 - anomaly_score))  # Rough normalization
    
    is_anomaly = prediction == -1
    confidence = normalized_score if is_anomaly else 0.0
    
    return {
        "is_anomaly": is_anomaly,
        "confidence": confidence,
        "anomaly_score": normalized_score,
        "method": "isolation_forest"
    }

def calculate_risk_score(rule_result: Dict, ewma_result: Dict, if_result: Dict) -> Dict:
    """
    Fuse results from all three detection methods into a final risk score
    
    Args:
        rule_result: Result from check_rule_based_anomaly
        ewma_result: Result from check_ewma_anomaly  
        if_result: Result from check_isolation_forest_anomaly
        
    Returns:
        Dict with final risk score and alert decision
    """
    # Extract confidence scores
    rule_score = rule_result.get("confidence", 0.0)
    ewma_score = ewma_result.get("confidence", 0.0) 
    if_score = if_result.get("confidence", 0.0)
    
    # Calculate weighted risk score
    risk_score = (
        AnomalyDetectionConfig.WEIGHT_RULE * rule_score +
        AnomalyDetectionConfig.WEIGHT_EWMA * ewma_score +
        AnomalyDetectionConfig.WEIGHT_IF * if_score
    )
    
    # Determine alert level
    should_alert = risk_score >= AnomalyDetectionConfig.ALERT_THRESHOLD
    
    if risk_score >= 0.9:
        alert_level = "CRITICAL"
    elif risk_score >= 0.7:
        alert_level = "HIGH"
    elif risk_score >= 0.5:
        alert_level = "MEDIUM"
    else:
        alert_level = "LOW"
    
    # Collect all triggered methods
    triggered_methods = []
    if rule_result.get("is_anomaly"):
        triggered_methods.append("rule_based")
    if ewma_result.get("is_anomaly"):
        triggered_methods.append("ewma")
    if if_result.get("is_anomaly"):
        triggered_methods.append("isolation_forest")
    
    return {
        "risk_score": risk_score,
        "should_alert": should_alert,
        "alert_level": alert_level,
        "triggered_methods": triggered_methods,
        "method_scores": {
            "rule_based": rule_score,
            "ewma": ewma_score,
            "isolation_forest": if_score
        },
        "details": {
            "rule_based": rule_result,
            "ewma": ewma_result,
            "isolation_forest": if_result
        }
    }

def retrain_isolation_forest(patient_id: str, normal_data: List[dict]) -> bool:
    """
    Retrain the Isolation Forest model with new normal data
    
    Args:
        patient_id: Patient identifier
        normal_data: List of confirmed normal vital readings
        
    Returns:
        Success status
    """
    if len(normal_data) < 50:
        return False
    
    try:
        # Prepare training data
        training_features = []
        for record in normal_data:
            features = [
                record.get('heart_rate', 75),
                record.get('spo2', 98),
                record.get('bp_systolic', 120),
                record.get('bp_diastolic', 80),
                record.get('temperature', 37.0),
                record.get('ecg_score', 2)
            ]
            training_features.append(features)
        
        # Retrain model
        iforest = IsolationForest(
            n_estimators=AnomalyDetectionConfig.IF_N_ESTIMATORS,
            contamination=AnomalyDetectionConfig.IF_CONTAMINATION,
            random_state=AnomalyDetectionConfig.IF_RANDOM_STATE
        )
        iforest.fit(np.array(training_features))
        
        # Update global model storage
        model_key = f"{patient_id}_isolation_forest"
        _isolation_models[model_key] = iforest
        
        return True
    except Exception as e:
        print(f"Error retraining Isolation Forest for patient {patient_id}: {e}")
        return False

# Legacy functions for backward compatibility
def check_ml_anomaly(data: VitalReading) -> bool:
    """Legacy ML anomaly check - use check_isolation_forest_anomaly instead"""
    result = check_rule_based_anomaly(data)
    return result["is_anomaly"]

def check_historical_anomaly(current_data: VitalReading, history: List[dict]) -> bool:
    """Legacy historical check - use check_ewma_anomaly instead"""
    if not history or len(history) < 3:
        return False
    
    result = check_ewma_anomaly(current_data, "legacy_patient", history)
    return result["is_anomaly"]