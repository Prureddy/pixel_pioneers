import requests
import time
import random
from datetime import datetime
from faker import Faker

fake = Faker()

# Define the four patient names for which to generate data
PATIENT_NAMES = ["Alice", "Bob", "Charlie", "Diana"]
API_URL = "http://localhost:8000/api/v1/ingest_data/"
CREATE_PATIENT_URL = "http://localhost:8000/api/v1/create_patient"

def generate_and_send_data():
    """Generates and sends a single fake reading to the FastAPI server."""
    # Select a patient name to use as the PID
    pid = random.choice(PATIENT_NAMES)
    
    # Generate the fake vital signs data
    vital_reading = {
        "bp": {"systolic": random.randint(90, 140), "diastolic": random.randint(60, 90)},
        "spo2": round(random.uniform(95.0, 99.9), 1),
        "heart_rate": random.randint(50, 150),
        "temperature": round(random.uniform(36.0, 37.5), 1),
        "ecg": [random.randint(-100, 100) for _ in range(50)],
        "timestamp": datetime.utcnow().isoformat()
    }

    try:
        # The pid is included in the URL, not in the JSON body
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
    # Create the initial patient documents for the specific names
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
                "specialization": "Cardiology"
            }
        }
        try:
            response = requests.post(CREATE_PATIENT_URL, json=patient_data)
            if response.status_code == 200:
                print(f"Initial patient {name} created successfully.")
            else:
                print(f"Failed to create patient {name}. Status code: {response.status_code}. Response: {response.text}")
        except requests.exceptions.ConnectionError:
            print(f"Could not connect to API. Is the FastAPI server running?")
            break
    
    print("Starting continuous data generation. Press Ctrl+C to stop.")
    while True:
        generate_and_send_data()
        time.sleep(5)