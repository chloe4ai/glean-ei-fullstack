# Single-image build for Railway / Fly.io / any container host.
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm run install:all && npm run build
ENV PORT=8787
EXPOSE 8787
CMD ["node", "backend/server.js"]
