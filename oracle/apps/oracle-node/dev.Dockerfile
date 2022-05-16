FROM node:16.14.0-alpine3.14

WORKDIR /home/node

COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs
COPY --chown=node:node package.json yarn.lock nx.json workspace.json ./

RUN yarn --frozen-lockfile

CMD [ "/home/node/node_modules/.bin/nx", "serve" ]
