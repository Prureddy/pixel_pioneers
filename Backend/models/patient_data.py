from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class VitalReading(BaseModel):
    bp: Optional[Dict[str, int]] = None
    spo2: Optional[float] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    ecg: Optional[List[int]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Alert(BaseModel):
    aid: str
    anomaly_type: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
class Doctor(BaseModel):
    did: str
    name: str
    specialization: str

class Patient(BaseModel):
    pid: str
    name: str
    age: int
    gender: str
    past_history: str
    doctor: Doctor
    vitals: List[VitalReading] = []
    alerts: List[Alert] = []

class PatientUpdate(BaseModel):
    pid: str
    vital_reading: VitalReading
    ml_anomaly: bool
    historical_anomaly: bool