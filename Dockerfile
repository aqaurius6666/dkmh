FROM node:16-alpine3.15

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install 

COPY .env .

COPY . .

CMD [ "yarn", "start:tool" ]