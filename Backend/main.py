from fastapi import FastAPI
from api import endpoints
import uvicorn
import os
from dotenv import load_dotenv

# This line is CRITICAL to load the .env file before anything else
load_dotenv() 

app = FastAPI(
    title="Patient Monitoring System",
    description="A backend for real-time patient health data ingestion and anomaly detection."
)

app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Patient Monitoring API!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)