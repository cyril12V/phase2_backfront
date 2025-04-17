# Déploiement du Backend sur Railway

Ce guide explique comment déployer le backend de l'application Optical Factory sur Railway.

## Prérequis

1. Un compte [Railway](https://railway.app/)
2. L'outil CLI Railway (optionnel)
   ```bash
   npm install -g @railway/cli
   ```

## Méthode 1 : Déploiement via l'interface Web

1. Connectez-vous à [Railway Dashboard](https://railway.app/dashboard)
2. Cliquez sur "New Project" et sélectionnez "Deploy from GitHub repo"
3. Sélectionnez le dépôt GitHub `cyril12V/phase2_backfront`
4. Configurez le service :
   - Nom du service : `optical-factory-backend`
   - Root Directory : `/` (racine du projet)
   - Variables d'environnement : Ajoutez les variables du fichier `.env.example`

## Méthode 2 : Déploiement via CLI

1. Connectez-vous à Railway via CLI :
   ```bash
   railway login
   ```

2. Initialisez le projet Railway :
   ```bash
   railway init
   ```

3. Liez votre projet GitHub :
   ```bash
   railway link
   ```

4. Configurez les variables d'environnement (copiez depuis `.env.example`) :
   ```bash
   railway variables set LOG_LEVEL=INFO FACE_MODEL_PATH=./models/face_landmarker_v2_with_blendshapes.task ...
   ```

5. Déployez l'application :
   ```bash
   railway up
   ```

## Configuration du Frontend

Une fois le backend déployé sur Railway, vous devrez :

1. Obtenez l'URL de votre application Railway (ex: `https://optical-factory-api-production.up.railway.app`)
2. Modifiez le fichier `.env` dans `src/frontend/` :
   ```
   # URL de production (décommenter quand déployé)
   REACT_APP_API_URL=https://votre-app-railway.up.railway.app
   ```

3. Redéployez le frontend sur Vercel

## Remarques Importantes

- Railway déploie automatiquement à chaque commit sur la branche principale
- Le backend utilise le fichier `Procfile` pour déterminer la commande de démarrage
- Les variables d'environnement dans Railway remplacent celles du fichier `.env`
- Assurez-vous que les modèles ML sont correctement déployés 