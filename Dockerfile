# --- Stage 1 : Build de l'application React/Vite ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances d'abord (meilleur cache Docker)
COPY package*.json ./
RUN npm ci

# Copie du reste du code source
COPY . .

# Build de production (génère le dossier dist/)
RUN npm run build

# --- Stage 2 : Service avec Nginx ---
FROM nginx:alpine

# Suppression de la config par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copie des fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de notre config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]