# Optical Factory Frontend

Ce projet est le frontend de l'application Optical Factory, permettant l'essayage virtuel de lunettes avec analyse faciale.

## Déploiement sur Vercel

Le frontend peut être déployé sur Vercel sans nécessiter un backend. Dans ce cas, il utilisera des données simulées pour la démonstration.

### Étapes de déploiement

1. Assurez-vous que votre code est sur GitHub

2. Dans Vercel :
   - Importez le projet depuis GitHub
   - Configurez les paramètres de build :
     - Framework présélectionné : Create React App
     - Répertoire racine : `/` (racine du projet)
     - Commande de build : `cd src/frontend && npm install && npm run build`
     - Répertoire de sortie : `src/frontend/build`

3. Variables d'environnement (optionnel) :
   - `REACT_APP_USE_MOCK` : Définir à `true` pour forcer l'utilisation des données simulées

## Fonctionnement sans backend

En mode simulation (déploiement sur Vercel ou lorsque le backend n'est pas accessible), l'application :
- Utilise des données simulées pour l'analyse faciale
- Fournit des recommandations prédéfinies
- Affiche une note expliquant que l'application fonctionne en mode démo

## Comment déployer avec un backend

Lorsque votre backend sera prêt à être déployé :

1. Déployez votre backend sur une plateforme supportant Python (comme Railway, Heroku, DigitalOcean)
2. Modifiez le fichier `.env` pour pointer vers l'URL de votre backend déployé
3. Redéployez le frontend sur Vercel

## Développement local

Pour le développement local :

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm start
```

Le serveur de développement sera accessible à l'adresse : [http://localhost:3000](http://localhost:3000) 