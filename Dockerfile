# ═══════════════════════════════════════════════════════
# Dockerfile — OneByOne App (React + Vite)
# Build multi-stage: compila os estáticos com Node e serve
# com nginx (imagem final pequena, sem Node em produção).
# ═══════════════════════════════════════════════════════

# ───────────────────────────────────────────────
# Estágio 1: build — gera os arquivos estáticos
# ───────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copia os manifestos primeiro para aproveitar o cache de camadas:
# enquanto package*.json não mudarem, o npm ci fica em cache.
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera o build de produção (pasta dist/)
COPY . .
RUN npm run build

# ───────────────────────────────────────────────
# Estágio 2: produção — nginx servindo os estáticos
# ───────────────────────────────────────────────
FROM nginx:1.27-alpine

# Substitui a configuração padrão do nginx pela nossa (proxy /api + SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os estáticos gerados no estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx já sobe sozinho; o CMD abaixo o mantém em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
