# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the AdonisJS application. This creates the 'build' directory.
RUN npm run build

RUN mkdir -p build/tmp

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Expose port 3333
EXPOSE 3333

# Set the entrypoint to our custom script
ENTRYPOINT ["/app/entrypoint.sh"]