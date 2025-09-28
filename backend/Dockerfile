FROM node:18-alpine

# Install curl for debugging and bash
RUN apk add --no-cache curl bash

# Set working directory to backend
WORKDIR /usr/src/app/backend

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Run server.ts using ts-node
CMD ["npx", "ts-node", "server.ts"]
