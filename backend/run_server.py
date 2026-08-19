import uvicorn
import socket

def get_ip_address():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    host_ip = get_ip_address()
    print("=" * 65)
    print("[SERVER] SwipeX Platform Server Launching...")
    print(f"  Local Access:   http://localhost:8000")
    print(f"  Network Access: http://{host_ip}:8000")
    print("=" * 65)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
