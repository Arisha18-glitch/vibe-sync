import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()
api_key = os.getenv('STABILITY_API_KEY')

print("🔍 Testing Stability AI API...")
url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

# Try multiple prompts to find what works
test_prompts = [
    "a beautiful sunset over mountains, photorealistic",
    "a simple red apple on a table",
    "abstract geometric shapes",
    "a cat sitting on a windowsill"
]

for test_prompt in test_prompts:
    print(f"\n📝 Testing prompt: '{test_prompt}'")
    
    payload = {
        "text_prompts": [{"text": test_prompt, "weight": 1.0}],
        "cfg_scale": 7.0,
        "height": 512,
        "width": 512,
        "samples": 1,
        "steps": 20
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS!")
            break
        else:
            print(f"   ❌ Error: {response.text[:300]}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")