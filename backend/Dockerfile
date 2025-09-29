FROM node:18-alpine

# Install curl and bash
RUN apk add --no-cache curl bash

# Set working directory
WORKDIR /usr/src/app/backend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript to dist/
RUN npm run build

# Expose port
EXPOSE 4000

# Run compiled JS
CMD ["node", "dist/server.js"]
