import requests
import time
import random
from datetime import datetime
from faker import Faker

fake = Faker()

PATIENT_NAMES = ["Alice", "Bob", "Charlie", "Diana"]
API_URL = "http://localhost:8000/api/v1/ingest_data/"

def generate_and_send_data():
    """Generates and sends a single fake reading to the FastAPI server."""
    pid = random.choice(PATIENT_NAMES)
    
    vital_reading = {
        "bp": {"systolic": random.randint(90, 140), "diastolic": random.randint(60, 90)},
        "spo2": round(random.uniform(95.0, 99.9), 1),
        "heart_rate": random.randint(50, 150),
        "temperature": round(random.uniform(36.0, 37.5), 1),
        "ecg": [random.randint(-100, 100) for _ in range(50)],
        "timestamp": datetime.utcnow().isoformat()
    }

    try:
        response = requests.post(f"{API_URL}{pid}", json=vital_reading)
        if response.status_code == 200:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Data for {pid} sent successfully.")
        else:
            # Print the full response content to help debug
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to send data for {pid}. Status code: {response.status_code}")
            print(f"Response content: {response.text}")
    except requests.exceptions.ConnectionError as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Could not connect to API. Is the FastAPI server running?")
        print(e)
    
if __name__ == "__main__":
    for name in PATIENT_NAMES:
        patient_data = {
            "pid": name,
            "name": name,
            "age": random.randint(25, 75),
            "gender": random.choice(["Male", "Female"]),
            "past_history": fake.sentence(nb_words=5),
            "doctor": {
                "did": str(random.randint(100, 999)),
                "name": fake.name(),
            }
        }
        try:
            requests.post("http://localhost:8000/api/v1/create_patient", json=patient_data)
            print(f"Initial patient {name} created.")
        except requests.exceptions.ConnectionError:
            print(f"Could not create patient {name}. Is the FastAPI server running?")
            break
    
    print("Starting continuous data generation. Press Ctrl+C to stop.")
    while True:
        generate_and_send_data()
        time.sleep(5)