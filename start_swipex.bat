@echo off
TITLE SwipeX Live Production Launch Script
echo =========================================================================
echo                STARTING SWIPEX FULL-STACK PLATFORM
echo =========================================================================
echo [1/2] Starting FastAPI Backend Server on http://0.0.0.0:8000...
start /B "SwipeX Backend" "C:\Users\Hemap\AppData\Local\Programs\Python\Python313\python.exe" d:\swipex\backend\run_server.py

echo [2/2] Starting React Frontend Production Server on http://0.0.0.0:3000...
cd /d d:\swipex\frontend
start /B "SwipeX Frontend" npx serve -s build -l 3000

echo =========================================================================
echo  SwipeX is LIVE & ACCESSIBLE!
echo  - Frontend Access: http://localhost:3000 (Network: http://172.19.18.11:3000)
echo  - Backend API:     http://localhost:8000 (Network: http://172.19.18.11:8000)
echo  - Database Link:   http://localhost:8000/db (Network: http://172.19.18.11:8000/db)
echo =========================================================================
