@echo off
echo Demarrage du backend Optical Factory...

REM Chemin direct vers Python 3.10
set PYTHON_PATH=C:\Users\mario\AppData\Local\Programs\Python\Python310\python.exe

REM Verifier si mediapipe est installe
"%PYTHON_PATH%" -c "import mediapipe" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Mediapipe n'est pas installe. Installation en cours...
    "%PYTHON_PATH%" -m pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo Erreur lors de l'installation des dependances.
        pause
        exit /b 1
    )
)

echo Demarrage du serveur FastAPI...
"%PYTHON_PATH%" -m uvicorn src.main:app --reload --port 8000

pause 