from fastapi import APIRouter, HTTPException, Depends
from models.patient_data import VitalReading, Patient, Alert
from services.db_manager import DBManager
from services.anomaly_detector import check_rule_based_anomaly, check_ewma_anomaly, calculate_risk_score
from services.alert_sender import send_alert_via_orchestrator
import os
import uuid

router = APIRouter()

def get_db_manager():
    """Dependency to provide a DBManager instance with the correct URI."""
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        raise HTTPException(status_code=500, detail="MONGO_URL environment variable is not set.")
    return DBManager(mongo_url)

@router.post("/ingest_data/{pid}")
async def ingest_patient_data(pid: str, vital_reading: VitalReading, db_manager: DBManager = Depends(get_db_manager)):
    """
    Main endpoint to ingest patient data, run anomaly checks, and trigger alerts.
    """
    patient_doc = await db_manager.get_patient(pid)
    if not patient_doc:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    history_docs = await db_manager.get_last_n_readings(pid, n=50)

    rule_result = check_rule_based_anomaly(vital_reading)
    ewma_result = check_ewma_anomaly(vital_reading, pid, history_docs)
    
    risk_fusion_result = calculate_risk_score(rule_result, ewma_result)
    is_anomaly = risk_fusion_result['should_alert']

    if is_anomaly:
        alert_message = f"Critical Alert for Patient {patient_doc['name']}. Risk Score: {risk_fusion_result['risk_score']:.2f}. "
        alert_message += f"Triggered Methods: {', '.join(risk_fusion_result['triggered_methods'])}"
            
        alert_id = str(uuid.uuid4())
        
        alert = Alert(
            aid=alert_id, 
            anomaly_type=risk_fusion_result['alert_level'], 
            message=alert_message
        )
        await db_manager.add_alert(pid, alert)

        await send_alert_via_orchestrator(patient_doc, alert_message)

    await db_manager.add_vital_reading(pid, vital_reading)
    
    return {
        "message": "Data ingested successfully",
        "risk_score": risk_fusion_result['risk_score'],
        "alert_level": risk_fusion_result['alert_level']
    }

@router.post("/create_patient")
async def create_patient(patient: Patient, db_manager: DBManager = Depends(get_db_manager)):
    """
    Endpoint to create a new patient record.
    """
    existing_patient = await db_manager.get_patient(patient.pid)
    if existing_patient:
        raise HTTPException(status_code=409, detail="Patient with this PID already exists")
    
    await db_manager.create_patient(patient)
    return {"message": "Patient created successfully", "pid": patient.pid}