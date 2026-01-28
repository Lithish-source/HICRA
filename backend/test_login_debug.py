
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    print("Testing Login...")
    payload = {"email": "user1@gmail.com", "password": "password123"}
    try:
        r = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Login Status: {r.status_code}")
        print(f"Login Response: {r.text}")
        
        if r.status_code == 200 and "token" in r.json():
            return r.json()
        else:
            print("Login failed verification.")
            return None
    except Exception as e:
        print(f"Login connection failed: {e}")
        return None

def test_user_data(token, email):
    print(f"\nTesting User Data for {email}...")
    try:
        r = requests.get(f"{BASE_URL}/user-data/{email}")
        print(f"User Data Status: {r.status_code}")
        # Print first 500 chars to avoid spam
        print(f"User Data Response: {r.text[:500]}...")
    except Exception as e:
        print(f"User data fetch failed: {e}")

if __name__ == "__main__":
    user_data = test_login()
    if user_data:
        test_user_data(user_data['token'], user_data['email'])
