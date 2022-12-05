FROM node:16-alpine3.15

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn

COPY .env .

COPY . .

CMD [ "yarn", "start:tool" ]