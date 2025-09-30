# Use Node 18 Alpine
FROM node:18-alpine

# Install curl and bash
RUN apk add --no-cache curl bash

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to dist/
RUN npm run build

# Expose backend port
EXPOSE 4000

# Run compiled server
CMD ["node", "dist/server.js"]
