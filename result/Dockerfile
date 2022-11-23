FROM node:16.17-slim

# add curl for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# have nodemon available for local dev use (file watching)
RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci \
    && npm cache clean --force \
    && mv /app/node_modules /node_modules

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
