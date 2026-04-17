import os
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv("backend/.env")

VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
TARGET_NUMBER = "+17755717156"

async def get_phone_id():
    headers = {
        "Authorization": f"Bearer {VAPI_PRIVATE_KEY}",
        "Content-Type": "application/json"
    }
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.vapi.ai/phone-number", headers=headers) as resp:
            if resp.status != 200:
                print(f"Error: {resp.status} {await resp.text()}")
                return
            
            data = await resp.json()
            # print(f"Found {len(data)} numbers")
            for phone in data:
                if phone.get("number") == TARGET_NUMBER:
                    print(f"FOUND_ID:{phone.get('id')}")
                    return
            
            print("Number not found in Vapi account")

if __name__ == "__main__":
    asyncio.run(get_phone_id())
