# Desarrollo
FROM node:16 AS development

WORKDIR /app

RUN apt update -y && apt upgrade -y
RUN npm i -g @nestjs/cli

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Produccion
FROM development AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}