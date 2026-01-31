"""
Interactive Voice Ordering - Live Webhook Call
Connects to your ngrok tunnel for real-time order processing
"""
import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')

# Initialize client
client = Client(account_sid, auth_token)

# Target phone number (Anahat)
TO_NUMBER = "+919096282407"

# Your ngrok tunnel URL
NGROK_URL = "https://basinlike-compliantly-zenia.ngrok-free.dev"

def make_interactive_call():
    """Make a fully interactive voice ordering call"""
    print("\n" + "="*60)
    print("🛒 StoreStorm LIVE Voice Ordering")
    print("="*60)
    print(f"\n📞 Calling: {TO_NUMBER}")
    print(f"📱 From: {twilio_number}")
    print(f"🔗 Webhook: {NGROK_URL}/twilio/voice")
    print("\n⚡ This call connects to your LIVE backend!")
    print("   Watch your FastAPI terminal for real-time logs.\n")
    
    try:
        call = client.calls.create(
            to=TO_NUMBER,
            from_=twilio_number,
            url=f"{NGROK_URL}/twilio/voice",
            method="POST",
            status_callback=f"{NGROK_URL}/twilio/status",
            status_callback_method="POST"
        )
        
        print("✅ Call initiated!")
        print(f"📱 Call SID: {call.sid}")
        print(f"📊 Status: {call.status}")
        
        print("\n" + "-"*60)
        print("🎧 ANSWER YOUR PHONE!")
        print("-"*60)
        print("You'll hear: 'Namaste! Storm Mart mein aapka swagat hai.'")
        print("             'Aap kya order karna chahenge?'")
        print("\n💡 SAY YOUR ORDER:")
        print("   • '2 kg rice'")
        print("   • 'dal, sugar, aur atta'")
        print("   • Say 'bas' or 'done' when finished")
        print("\n👀 WATCH YOUR BACKEND TERMINAL FOR LIVE LOGS!")
        print("="*60)
        
        return call.sid
        
    except Exception as e:
        print(f"\n❌ Call failed: {e}")
        return None

if __name__ == "__main__":
    make_interactive_call()
