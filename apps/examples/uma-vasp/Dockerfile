FROM node:lts-alpine

# Set the working directory to /app
WORKDIR /app

# TODO(jeremy): Figure out how to only copy the package.json and package-lock.json files to the container.
# before running yarn. I can't seem to get the workspace to play nicely with this.
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/examples/uma-vasp/package.json ./apps/examples/uma-vasp/
COPY packages/lightspark-sdk/package.json ./packages/lightspark-sdk/
COPY packages/core/package.json packages/core/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY .yarn/releases ./.yarn/releases

RUN corepack enable
RUN corepack prepare --activate

# Install the dependencies
RUN yarn workspace @lightsparkdev/uma-vasp install

COPY turbo.json LICENSE .nvmrc ./
COPY apps/examples/uma-vasp ./apps/examples/uma-vasp/
COPY packages/lightspark-sdk ./packages/lightspark-sdk/
COPY packages/core ./packages/core/
COPY packages/eslint-config ./packages/eslint-config/
COPY packages/tsconfig ./packages/tsconfig/

RUN yarn turbo run build --filter='@lightsparkdev/uma-vasp'

# Expose port 8080
EXPOSE 8080

WORKDIR /app/apps/examples/uma-vasp

# Start the Express server
CMD ["yarn", "start:docker"]
