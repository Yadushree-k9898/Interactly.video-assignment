FROM node:18-alpine

# Install curl for debugging and bash for convenience
RUN apk add --no-cache curl bash

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Use ts-node to run server.ts directly in backend/
CMD ["npx", "ts-node", "server.ts"]
