# Build Step
FROM node:19.8.1-alpine as NODE_BUILD

WORKDIR /usr/app/server

ENV DATABASE_URL="file:./dev.db"

COPY package*.json ./
COPY prisma ./prisma/

RUN sed 's/provider = "postgresql"/provider = "sqlite"/g' \
  ./prisma/schema.prisma >> ./prisma/schema.update.prisma

RUN rm ./prisma/schema.prisma && mv ./prisma/schema.update.prisma ./prisma/schema.prisma

RUN npm install
RUN npx prisma db push

COPY . ./

RUN npm test
RUN npm run build

# Run Step
FROM node:19.8.1-alpine as PROD

WORKDIR /usr/app/server

COPY --from=NODE_BUILD /usr/app/server/dist ./dist
COPY --from=NODE_BUILD /usr/app/server/node_modules ./node_modules
COPY --from=NODE_BUILD /usr/app/server/package.json ./package.json
COPY --from=NODE_BUILD /usr/app/server/prisma/dev.db ./dev.db

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/usr/app/server/dev.db"
ENV GOOGLE_APPLICATION_CREDENTIALS="/secrets/service-account.json"

EXPOSE ${PORT}

CMD [ "node", "./dist/src/main.js" ]