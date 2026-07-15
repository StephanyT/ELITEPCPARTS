FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g live-server
COPY --from=build /app/dist ./dist
CMD ["live-server", "dist", "--port=5173", "--host=0.0.0.0"]
