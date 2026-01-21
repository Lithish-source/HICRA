import urllib.request
try:
    with urllib.request.urlopen('http://localhost:8001/user-data/user1@gmail.com') as response:
        print(f"Status: {response.status}")
        print(f"Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    print(f"Body: {e.read().decode('utf-8')}")
except Exception as e:
    print(e)
