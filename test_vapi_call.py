import os
import asyncio
import aiohttp
import json
from dotenv import load_dotenv

load_dotenv("backend/.env")

VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
VAPI_PHONE_NUMBER_ID = os.getenv("VAPI_PHONE_NUMBER_ID")
TARGET_NUMBER = "+13185165577"

async def test_call():
    print(f"Using Assistant ID: {VAPI_ASSISTANT_ID}")
    print(f"Using Phone Number ID: {VAPI_PHONE_NUMBER_ID}")
    
    payload = {
        "assistantId": VAPI_ASSISTANT_ID,
        "phoneNumberId": VAPI_PHONE_NUMBER_ID,
        "customer": {
            "number": TARGET_NUMBER,
        },
        "assistantOverrides": {
            "firstMessage": "This is a test call from the debugging script.",
        }
    }
    
    headers = {
        "Authorization": f"Bearer {VAPI_PRIVATE_KEY}",
        "Content-Type": "application/json"
    }
    
    print("Sending request to Vapi...")
    async with aiohttp.ClientSession() as session:
        async with session.post("https://api.vapi.ai/call", json=payload, headers=headers) as resp:
            print(f"Status: {resp.status}")
            text = await resp.text()
            print(f"Response: {text}")

if __name__ == "__main__":
    asyncio.run(test_call())
