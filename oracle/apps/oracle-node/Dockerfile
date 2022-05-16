FROM node:16.14.0-alpine3.14 AS only-package-json

WORKDIR /home/node

COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs

# Keep only package.json and project.json
RUN find libs ! -name "package.json" ! -name "project.json" -type f | xargs rm
RUN find apps ! -name "package.json" ! -name "project.json" -type f | xargs rm

FROM node:16.14.0-alpine3.14 AS build

USER node
WORKDIR /home/node

COPY --from=only-package-json --chown=node:node /home/node/ .
COPY --chown=node:node package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs
COPY --chown=node:node nx.json workspace.json tsconfig.base.json jest.config.js jest.preset.js ./

RUN yarn build

FROM node:16.14.0-alpine3.14 AS prod-deps

USER node
WORKDIR /home/node

COPY --from=only-package-json --chown=node:node /home/node/ .
COPY --chown=node:node package.json yarn.lock ./


RUN yarn --production --frozen-lockfile

FROM node:16.14.0-alpine3.14 AS final

USER node
WORKDIR /home/node

#COPY --from=only-package-json --chown=node:node /home/node/ .
#COPY --chown=node:node package.json yarn.lock ./
COPY --from=prod-deps /home/node/node_modules /home/node/node_modules
COPY --from=build /home/node/dist /home/node/dist

CMD [ "node", "/home/node/dist/apps/oracle-node/main.js" ]

