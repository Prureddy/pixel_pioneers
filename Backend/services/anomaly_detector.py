from typing import List
from models.patient_data import VitalReading

def check_ml_anomaly(data: VitalReading) -> bool:
    """
    Simulates a machine learning model's anomaly detection.
    A simple rule: heart rate > 120 or < 50 is an anomaly.
    """
    if data.heart_rate and (data.heart_rate > 120 or data.heart_rate < 50):
        return True
    return False

def check_historical_anomaly(current_data: VitalReading, history: List[dict]) -> bool:
    """
    Compares the current data with the last 10 entries from the database.
    """
    if not history or len(history) < 3:
        return False
        
    avg_hr = sum([d.get('heart_rate', 0) for d in history if 'heart_rate' in d]) / len(history)
    current_hr = current_data.heart_rate
    
    if current_hr and abs(current_hr - avg_hr) / avg_hr > 0.20:
        return True
        
    return False