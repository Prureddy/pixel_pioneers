from fastapi import APIRouter, HTTPException, Body
from models.patient_data import VitalReading, Patient, Alert
from services.db_manager import DBManager
from services.anomaly_detector import check_ml_anomaly, check_historical_anomaly
from services.alert_sender import send_alert_via_orchestrator
import os
import uuid

router = APIRouter()
db_manager = DBManager(os.getenv("MONGO_URL"))

@router.post("/ingest_data/{pid}")
async def ingest_patient_data(pid: str, vital_reading: VitalReading):
    """
    Main endpoint to ingest patient data, run anomaly checks, and trigger alerts.
    """
    # 1. Fetch Patient Data
    patient = await db_manager.get_patient(pid)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # 2. ML Anomaly Check
    is_ml_anomaly = check_ml_anomaly(vital_reading)
    
    # 3. Save Vital Reading to DB
    await db_manager.add_vital_reading(pid, vital_reading)
    
    # 4. Historical Anomaly Check
    history = await db_manager.get_last_n_readings(pid, n=10)
    is_historical_anomaly = check_historical_anomaly(vital_reading, history)
    
    # 5. Consolidated Alerting
    if is_ml_anomaly or is_historical_anomaly:
        alert_message = f"Critical Alert for Patient {patient['name']}."
        if is_ml_anomaly:
            alert_message += " ML model detected an anomaly."
        if is_historical_anomaly:
            alert_message += " Readings differ significantly from historical data."
            
        alert_id = str(uuid.uuid4())
        anomaly_type = "Combined Anomaly" if is_ml_anomaly and is_historical_anomaly else ("ML Anomaly" if is_ml_anomaly else "Historical Anomaly")
        
        # Add alert to database
        alert = Alert(aid=alert_id, anomaly_type=anomaly_type, message=alert_message)
        await db_manager.add_alert(pid, alert)

        # Trigger the AI Orchestrator
        await send_alert_via_orchestrator(patient, alert_message)
    
    return {
        "message": "Data ingested successfully",
        "ml_anomaly": is_ml_anomaly,
        "historical_anomaly": is_historical_anomaly
    }

@router.post("/create_patient")
async def create_patient(patient: Patient):
    """
    Endpoint to create a new patient record.
    """
    existing_patient = await db_manager.get_patient(patient.pid)
    if existing_patient:
        raise HTTPException(status_code=409, detail="Patient with this PID already exists")
    
    await db_manager.create_patient(patient)
    return {"message": "Patient created successfully", "pid": patient.pid}