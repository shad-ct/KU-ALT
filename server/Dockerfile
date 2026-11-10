FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Runs migrations, seeds data, and boots the API
CMD ["sh", "-c", "npm run migrate && npm run seed:all && npm start"]

