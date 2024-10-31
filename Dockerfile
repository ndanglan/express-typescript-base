FROM node:18.20-buster

# Enable Corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install app dependencies using pnpm
RUN pnpm install --prod=false

# Install build-essential for building packages
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Change ownership of the application files to the 'node' user
RUN chown -R node:node /usr/src/app

# Switch to the 'node' user
USER node

# Copy the app source
COPY --chown=node:node . .

# Copy .env file
COPY .env .env

# Build the TypeScript files
RUN pnpm run build

# Expose port 8080
EXPOSE 8080

# Start the app
CMD ["pnpm", "run", "start"]
