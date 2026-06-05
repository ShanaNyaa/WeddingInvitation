FROM node:lts-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source (overridden by volume mount in dev)
COPY . .

EXPOSE 5173

# --host exposes the dev server to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]

