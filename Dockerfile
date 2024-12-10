# Utiliser une image Node.js officielle comme base
FROM node:16-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install --production

# Copier tout le contenu de votre projet dans le conteneur
COPY . .

# Exposer le port utilisé par Express (important pour Heroku)
EXPOSE 3000

# Définir la commande pour démarrer l'application
CMD ["node", "bot.js"]
