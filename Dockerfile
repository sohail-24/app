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

# ---- Production Stage ----
FROM node:22-slim AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
# Drizzle config and DB schema/migrations if needed for runtime operations
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./

# Create a non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]
