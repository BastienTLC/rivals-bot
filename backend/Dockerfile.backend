# Étape 1 : Construire le frontend avec Vite
FROM node:18-alpine3.17 as build_frontend
WORKDIR /app
COPY client/ /app
RUN npm install
RUN npm run build

# Étape 2 : Préparer le backend avec les fichiers frontend
FROM node:16-alpine
WORKDIR /app

# Copier les dépendances backend
COPY backend/package*.json ./
RUN npm install

# Copier le code du backend
COPY backend/ ./

# Copier les fichiers frontend générés
COPY --from=build_frontend /app/dist /app/public

# Exposer le port 3001
EXPOSE 3001

# Démarrer le backend
CMD ["node", "bin/www"]
