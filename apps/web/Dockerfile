FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
ENV PORT=3003
EXPOSE 3003
CMD ["npm", "run", "start", "--", "-p", "3003"]
