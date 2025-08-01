# Development stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port your app runs on
EXPOSE 5001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"] 