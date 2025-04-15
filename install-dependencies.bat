@echo off
echo Installation des dependances pour Optical Factory...

REM Chemin direct vers Python 3.10
set PYTHON_PATH=C:\Users\mario\AppData\Local\Programs\Python\Python310\python.exe

echo Mise a jour de pip...
"%PYTHON_PATH%" -m pip install --upgrade pip

echo Installation des dependances principales...
"%PYTHON_PATH%" -m pip install fastapi uvicorn[standard]

echo Installation de mediapipe...
"%PYTHON_PATH%" -m pip install mediapipe

echo Installation des autres dependances...
"%PYTHON_PATH%" -m pip install opencv-python-headless numpy python-multipart pydantic-settings pytest httpx requests

echo Verification des installations...
"%PYTHON_PATH%" -c "import fastapi; import uvicorn; import mediapipe; print('Toutes les dependances principales sont installees avec succes!')"

echo.
echo Installation terminee. Vous pouvez maintenant executer start-backend.bat ou start-dev.bat
echo.
pause 