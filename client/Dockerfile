# -------------------------
# Stage 1: Build React app
# -------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files first (better layer caching)
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci)
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the app for production
RUN npm run build

# -------------------------
# Stage 2: Serve with Nginx
# -------------------------
FROM nginx:1.27-alpine AS runner

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy React build output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (important for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
