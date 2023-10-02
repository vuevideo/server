# Build Step
FROM node:19.8.1-alpine as NODE_BUILD

WORKDIR /usr/app/server

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . ./

RUN npm run build

# Run Step
FROM node:19.8.1-alpine as PROD

WORKDIR /usr/app/server

COPY --from=NODE_BUILD /usr/app/server/dist ./dist
COPY --from=NODE_BUILD /usr/app/server/node_modules ./node_modules
COPY --from=NODE_BUILD /usr/app/server/package.json ./package.json
COPY --from=NODE_BUILD /usr/app/server/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="postgresql://vuevideo_admin:password@localhost:8888/vuevideo"
ENV GOOGLE_APPLICATION_CREDENTIALS="/secrets/service-account.json"

EXPOSE ${PORT}

CMD [ "npm", "run", "start:migrate:prod" ]