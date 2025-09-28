FROM node:18-alpine

# Install curl for network debugging
RUN apk add --no-cache curl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm","run","dev"]
