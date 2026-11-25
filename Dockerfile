# ---- Build the static files
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Shown in the sidebar. The API address is NOT baked in: it is set when the
# container starts, so the same image serves every environment.
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
RUN npm run build

# ---- Serve them
# Runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker/10-runtime-config.sh /docker-entrypoint.d/10-runtime-config.sh

# Prefix of the localStorage keys. API_URL has no default: it must be given.
ENV LOCAL_KEY=bank_account_manager

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
