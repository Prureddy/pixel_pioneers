from typing import List, Dict, Optional, Tuple
import numpy as np
from models.patient_data import VitalReading
import statistics

# Global model storage for continuous learning
_ewma_states = {}

class AnomalyDetectionConfig:
    """Configuration for anomaly detection thresholds and parameters"""
    
    # Rule-based thresholds
    HR_MIN = 40
    HR_MAX = 130
    SPO2_MIN = 90
    TEMP_MIN = 35.0
    TEMP_MAX = 38.5
    
    # EWMA parameters
    EWMA_ALPHA = 0.3
    EWMA_STD_MULTIPLIER = 3
    EWMA_MIN_HISTORY = 5
    
    # Risk fusion weights
    WEIGHT_RULE = 0.6
    WEIGHT_EWMA = 0.4
    ALERT_THRESHOLD = 0.6

def check_rule_based_anomaly(data: VitalReading) -> Dict:
    """
    Rule-based anomaly detection using clinical thresholds
    """
    triggered_rules = []
    
    if data.heart_rate and (data.heart_rate < AnomalyDetectionConfig.HR_MIN or data.heart_rate > AnomalyDetectionConfig.HR_MAX):
        triggered_rules.append(f"HR: {data.heart_rate} (normal: {AnomalyDetectionConfig.HR_MIN}-{AnomalyDetectionConfig.HR_MAX})")
    
    if data.spo2 and data.spo2 < AnomalyDetectionConfig.SPO2_MIN:
        triggered_rules.append(f"SpO2: {data.spo2}% (normal: >{AnomalyDetectionConfig.SPO2_MIN}%)")
    
    if data.bp and data.bp.get('systolic') and data.bp.get('diastolic'):
        if data.bp['systolic'] > 180 or data.bp['diastolic'] > 110:
            triggered_rules.append(f"BP: {data.bp['systolic']}/{data.bp['diastolic']} (critical threshold)")

    if data.temperature and (data.temperature < AnomalyDetectionConfig.TEMP_MIN or data.temperature > AnomalyDetectionConfig.TEMP_MAX):
        triggered_rules.append(f"Temp: {data.temperature}°C (normal: {AnomalyDetectionConfig.TEMP_MIN}-{AnomalyDetectionConfig.TEMP_MAX})")
    
    is_anomaly = len(triggered_rules) > 0
    confidence = min(len(triggered_rules) * 0.3, 1.0)
    
    return {
        "is_anomaly": is_anomaly,
        "confidence": confidence,
        "triggered_rules": triggered_rules,
        "method": "rule_based"
    }

def check_ewma_anomaly(data: VitalReading, patient_id: str, history: List[dict]) -> Dict:
    """
    EWMA-based anomaly detection for trend analysis
    """
    if len(history) < AnomalyDetectionConfig.EWMA_MIN_HISTORY:
        return {
            "is_anomaly": False,
            "confidence": 0.0,
            "reason": "Insufficient history for EWMA analysis",
            "method": "ewma"
        }
    
    vitals_to_check = {
        'heart_rate': data.heart_rate,
        'spo2': data.spo2,
        'bp_systolic': data.bp['systolic'] if data.bp and 'systolic' in data.bp else None,
        'bp_diastolic': data.bp['diastolic'] if data.bp and 'diastolic' in data.bp else None,
        'temperature': data.temperature
    }
    
    anomaly_details = []
    max_deviation = 0.0
    
    for vital_name, current_value in vitals_to_check.items():
        if current_value is None:
            continue
            
        historical_values = []
        for h in history:
            if vital_name in h:
                historical_values.append(h[vital_name])
            elif vital_name.startswith('bp_'):
                if 'bp' in h and h['bp'] and vital_name.replace('bp_', '') in h['bp']:
                    historical_values.append(h['bp'][vital_name.replace('bp_', '')])

        if len(historical_values) < AnomalyDetectionConfig.EWMA_MIN_HISTORY:
            continue
        
        ewma = statistics.mean(historical_values) # Simple mean for this version
        rolling_std = np.std(historical_values[-10:]) if len(historical_values) >= 10 else np.std(historical_values)
        
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

def calculate_risk_score(rule_result: Dict, ewma_result: Dict) -> Dict:
    """
    Fuse results from all detection methods into a final risk score
    """
    rule_score = rule_result.get("confidence", 0.0)
    ewma_score = ewma_result.get("confidence", 0.0)
    
    risk_score = (
        AnomalyDetectionConfig.WEIGHT_RULE * rule_score +
        AnomalyDetectionConfig.WEIGHT_EWMA * ewma_score
    )
    
    should_alert = risk_score >= AnomalyDetectionConfig.ALERT_THRESHOLD
    
    if risk_score >= 0.9:
        alert_level = "CRITICAL"
    elif risk_score >= 0.7:
        alert_level = "HIGH"
    elif risk_score >= 0.5:
        alert_level = "MEDIUM"
    else:
        alert_level = "LOW"
    
    triggered_methods = []
    if rule_result.get("is_anomaly"):
        triggered_methods.append("rule_based")
    if ewma_result.get("is_anomaly"):
        triggered_methods.append("ewma")
    
    return {
        "risk_score": risk_score,
        "should_alert": should_alert,
        "alert_level": alert_level,
        "triggered_methods": triggered_methods
    }