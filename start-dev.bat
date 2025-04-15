@echo off
echo Demarrage de l'environnement de developpement Optical Factory...

REM Definir les chemins
set BACKEND_DIR=%~dp0
set FRONTEND_DIR=%~dp0src\frontend
set PYTHON_PATH=C:\Users\mario\AppData\Local\Programs\Python\Python310\python.exe

REM Activer l'environnement virtuel si existant
IF EXIST "%BACKEND_DIR%venv\Scripts\activate.bat" (
    echo Activation de l'environnement virtuel Python...
    call "%BACKEND_DIR%venv\Scripts\activate.bat"
) ELSE (
    echo Utilisation de Python 3.10 installé sur le système.
)

REM Demarrer le backend dans une nouvelle fenetre
echo Demarrage du backend FastAPI...
start cmd /k "cd /d %BACKEND_DIR% && "%PYTHON_PATH%" -m uvicorn src.main:app --reload --port 8000"

REM Attendre que le backend soit pret
echo Attente du demarrage du backend (5 secondes)...
timeout /t 5 /nobreak

REM Demarrer le frontend dans une nouvelle fenetre
echo Demarrage du frontend React...
start cmd /k "cd /d %FRONTEND_DIR% && npm start"

echo Environnement de developpement demarre !
echo Backend sur http://localhost:8000
echo Frontend sur http://localhost:3000
echo.
echo Vous pouvez fermer cette fenetre.
pause