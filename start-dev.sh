#!/bin/bash

echo "Démarrage de l'environnement de développement Optical Factory..."

# Définir les chemins
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"
FRONTEND_DIR="$SCRIPT_DIR/src/frontend"

# Activer l'environnement virtuel si existant
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    echo "Activation de l'environnement virtuel Python..."
    source "$BACKEND_DIR/venv/bin/activate"
else
    echo "AVERTISSEMENT: Environnement virtuel non trouvé. Utilisation de Python système."
fi

# Fonction pour arrêter tous les processus à la sortie
cleanup() {
    echo "Arrêt de tous les processus..."
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID
    exit 0
}

# Capture du signal d'interruption (Ctrl+C)
trap cleanup SIGINT SIGTERM

# Démarrer le backend en arrière-plan
echo "Démarrage du backend FastAPI..."
cd "$BACKEND_DIR" && python -m uvicorn src.main:app --reload --port 8000 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "Attente du démarrage du backend (5 secondes)..."
sleep 5

# Démarrer le frontend en arrière-plan
echo "Démarrage du frontend React..."
cd "$FRONTEND_DIR" && npm start &
FRONTEND_PID=$!

echo "Environnement de développement démarré !"
echo "Backend sur http://localhost:8000"
echo "Frontend sur http://localhost:3000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les processus."

# Attendre que les processus se terminent
wait 