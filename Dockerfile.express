# =========================================
# Stage 1: Develop the React.js Application
# =========================================
ARG NODE_VERSION=24.12.0-alpine

# Use a lightweight Node.js image for development
FROM node:${NODE_VERSION} AS dev

# Set the working directory
WORKDIR /app
# Copy package.json and install dependencies
COPY package.json ./


RUN npm install
# Copy the rest of the app
COPY . .
# Expose port 3000
EXPOSE 3000
# Start the app
CMD ["npm", "run", "dev:server"]