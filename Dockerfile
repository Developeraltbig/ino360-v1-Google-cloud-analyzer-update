# Dockerfile (in your project's root directory)

# ---- Stage 1: Build the React Frontend ----
# Use an official Node.js image as the base.
# 'alpine' is a lightweight version of Linux.
FROM node:18-alpine AS frontend-builder

# Set the working directory for the frontend build
WORKDIR /app/frontend

# Copy package.json and package-lock.json first to leverage Docker caching
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend for production
RUN npm run build


# ---- Stage 2: Build the Node.js Backend ----
# Use another Node.js image for the final application
FROM node:20-alpine AS final-image

# Set the working directory for the backend
WORKDIR /app

# Copy package.json and package-lock.json for the backend
COPY backend/package*.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --only=production

# Copy the backend source code
COPY backend/ ./

# ** Crucial Step **
# Copy the built frontend files from the first stage into the backend's 'public' folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Your server.js listens on process.env.PORT. Cloud Run will set this variable (usually to 8080).
# We expose it here for documentation purposes.
EXPOSE 8080

# The command to start the server
CMD ["node", "server.js"]