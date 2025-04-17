# Utiliser une image Python officielle comme image de base
FROM python:3.10-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier des dépendances SEULEMENT
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code source de l'application
COPY ./src ./src

# Créer un fichier .env par défaut
RUN echo "# Configuration par défaut (remplacée par les variables d'environnement)" > ./.env && \
    echo "LOG_LEVEL=INFO" >> ./.env && \
    echo "FACE_MODEL_PATH=./models/face_landmarker_v2_with_blendshapes.task" >> ./.env

# Copier la configuration .env si elle existe
COPY .env ./.env

# Copier le modèle Mediapipe (requis pour l'analyse)
COPY ./models/face_landmarker_v2_with_blendshapes.task ./models/face_landmarker_v2_with_blendshapes.task

# Exposer le port interne
EXPOSE 8000

# Commande pour lancer l'application FastAPI
# Utilise --host 0.0.0.0 pour écouter sur toutes les interfaces
# Le port est souvent fourni par la variable d'environnement PORT sur les PaaS
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]