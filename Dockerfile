# ---- Build Stage ----
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for building)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# ---- Production Stage (Backend) ----
FROM node:22-slim AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built backend code from builder stage
COPY --from=builder /app/dist/boot.js ./dist/boot.js
# The profile avatar query discovers the local assets at runtime.
COPY --from=builder /app/dist/public/avatars ./dist/public/avatars
# Drizzle config and DB schema/migrations if needed for runtime operations
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./

# Create a non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN mkdir -p /app/uploads/products \
    && chown -R appuser:appgroup /app
USER appuser

# Expose port (Internal backend port)
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]

# ---- Proxy Stage (Nginx) ----
FROM nginx:stable AS proxy

# Copy the built frontend files from builder stage
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/50x.html /usr/share/nginx/html/50x.html

# Expose port
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
