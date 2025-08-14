# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (cache optimization)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port for Render
EXPOSE 3000

# Start app
CMD ["npm", "start"]
