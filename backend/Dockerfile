FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Production image
FROM node:18-slim

# Use tini to handle signals properly
RUN apt-get update && apt-get install -y tini && apt-get clean

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Set tini as entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Tell Docker the preferred stop signal
STOPSIGNAL SIGTERM

EXPOSE 3000

CMD ["node", "dist/server.js"]
