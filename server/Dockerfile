# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose port for Render
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
