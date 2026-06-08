FROM node:18.12.1-bullseye-slim

RUN npm install -g npm@9.1.3

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3050

CMD ["node", "app.js"]
