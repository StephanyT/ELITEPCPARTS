# Node 22 LTS: Node 18 ya no recibe parches de seguridad y NestJS 11 pide Node 20 o más
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# npm ci instala exactamente lo que dice package-lock.json (builds reproducibles)
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]