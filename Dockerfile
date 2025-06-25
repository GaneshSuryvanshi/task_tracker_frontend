# Stage 1: Build React frontend only
FROM node:18 AS frontend-builder
WORKDIR /app/frontend

# Copy package.json and package-lock.json (if present)
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
