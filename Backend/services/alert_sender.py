import os
from twilio.rest import Client
import smtplib
from email.message import EmailMessage

async def send_sms_alert(phone_number: str, message: str):
    # Twilio Account SID and Auth Token from .env
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
    
    # client = Client(account_sid, auth_token)
    # message = client.messages.create(
    #     to=phone_number,
    #     from_=twilio_phone,
    #     body=message
    # )
    print(f"SMS Alert sent to {phone_number}: {message}")

async def send_email_alert(email_address: str, subject: str, body: str):
    # This is a placeholder for a service like SendGrid or a custom SMTP server
    print(f"Email Alert sent to {email_address} with subject '{subject}':\n{body}")

async def send_alert_via_orchestrator(patient_info: dict, message: str):
    """
    Acts as the AI Orchestrator to route alerts.
    """
    doctor_email = patient_info['doctor']['email'] # Assuming email is in patient doc
    doctor_phone = patient_info['doctor']['phone'] # Assuming phone is in patient doc
    patient_name = patient_info['name']
    
    subject = f"Urgent Anomaly Alert for Patient {patient_name}"
    
    await send_sms_alert(doctor_phone, message)
    await send_email_alert(doctor_email, subject, message)