# 1. Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (including dev) for build
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# 2. Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Install a lightweight static server
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 3000

# Serve the production build
CMD ["serve", "-s", "dist", "-l", "3000"]