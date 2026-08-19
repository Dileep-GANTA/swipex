import json
import sys
import urllib.request

payload = json.dumps({'email': 'recruiter@swipex.dev', 'password': 'password123'}).encode()
req = urllib.request.Request('http://127.0.0.1:8000/api/login/', data=payload, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        print('status', resp.status)
        print(resp.read().decode())
except Exception as exc:
    print(type(exc).__name__, exc)
    sys.exit(1)
