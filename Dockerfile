# Etapa de compilación
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Pasar variables de entorno para que se compilen en el build estático de Next.js
ENV NEXT_PUBLIC_API_URL=http://localhost:5244
ENV NEXT_PUBLIC_AI_URL=http://localhost:8000
RUN npm run build

# Etapa de runtime ligero para servir la aplicación
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]