from faker import Faker
import random
from datetime import datetime
from models.patient_data import PatientReading

fake = Faker()

def generate_fake_data(patient_id: str):
    """Generates a single fake patient reading."""
    return PatientReading(
        patient_id=patient_id,
        bp={"systolic": random.randint(90, 140), "diastolic": random.randint(60, 90)},
        spo2=round(random.uniform(95.0, 99.9), 1),
        heart_rate=random.randint(60, 100),
        temperature=round(random.uniform(36.0, 37.5), 1),
        ecg=[random.randint(5, 15) for _ in range(50)],
        timestamp=datetime.now().isoformat()
    )