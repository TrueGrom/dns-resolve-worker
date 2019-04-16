FROM node:10.15.3-alpine

COPY package.json package-lock.json ./
RUN npm i
COPY . .
CMD ["node", "worker"]
