import urllib.request
import json

url = 'http://localhost:8080/api/auth/signup'
data = {
    "name": "Test User",
    "email": "testunique2030@test.com",
    "password": "password123",
    "role": "USER"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
