
ARG VERSION=lts-alpine

FROM node:$VERSION

LABEL maintainer="IdiNium"

COPY . /app

RUN npm install typescript@latest -g && \
    cd /app && \
    npm install && \
    npm run build && \
    rm -rf src/ .idea/ .vscode/

WORKDIR /app

ENTRYPOINT ["node", "/app/dist/app.js"]