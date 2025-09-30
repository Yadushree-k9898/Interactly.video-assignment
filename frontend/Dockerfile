# Use Node 18 Alpine
FROM node:18-alpine

# Install curl and bash
RUN apk add --no-cache curl bash

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend code
COPY . .

# Expose frontend port
EXPOSE 3000

# Start frontend dev server
CMD ["npm", "run", "dev"]
