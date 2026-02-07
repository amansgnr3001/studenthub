FROM node:20

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of backend code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
