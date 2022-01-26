FROM node:12.22 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:12.22-alpine AS release
WORKDIR /usr/src/app
COPY --from=base /usr/src/app ./
EXPOSE 3000
CMD [ "node", "app.js" ]