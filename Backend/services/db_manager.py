from motor.motor_asyncio import AsyncIOMotorClient
from models.patient_data import Patient, PatientUpdate, VitalReading, Alert
import os
from bson import ObjectId

class DBManager:
    def __init__(self, mongo_url: str):
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client["patient_db"]
        self.patients = self.db["patients"]
        
    async def create_patient(self, patient: Patient):
        await self.patients.insert_one(patient.dict(by_alias=True))
        
    async def get_patient(self, pid: str):
        return await self.patients.find_one({"pid": pid})

    async def add_vital_reading(self, pid: str, reading: VitalReading):
        await self.patients.update_one(
            {"pid": pid},
            {"$push": {"vitals": reading.dict(by_alias=True)}}
        )

    async def get_last_n_readings(self, pid: str, n: int):
        patient = await self.patients.find_one({"pid": pid}, {"vitals": {"$slice": -n}})
        if patient and 'vitals' in patient:
            return patient['vitals']
        return []

    async def add_alert(self, pid: str, alert: Alert):
        await self.patients.update_one(
            {"pid": pid},
            {"$push": {"alerts": alert.dict(by_alias=True)}}
        )