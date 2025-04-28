FROM node:20-alpine as build

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Clean install deps with exact versions
RUN npm ci --quiet

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Smaller production image
FROM nginx:alpine-slim

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Add Nginx configuration for routing SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add non-root user
RUN addgroup -S nginxgroup && adduser -S nginxuser -G nginxgroup
USER nginxuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
