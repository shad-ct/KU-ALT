FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Runs migrations and boots the API
CMD ["sh", "-c", "npm run migrate && npm start"]

