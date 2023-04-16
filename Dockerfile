# Build Step
FROM node:19.8.1-alpine as NODE_BUILD

WORKDIR /usr/app/server

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

# Run Step

FROM node:19.8.1-alpine as PROD

WORKDIR /usr/app/server

COPY --from=NODE_BUILD /usr/app/server/dist ./dist
COPY --from=NODE_BUILD /usr/app/server/node_modules ./node_modules
COPY --from=NODE_BUILD /usr/app/server/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "node", "./dist/main.js" ]