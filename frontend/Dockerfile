# --- Stage 1: Build the Next.js application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# Ensure environment variables are available during the build
ARG NEXT_PUBLIC_API_URL
ARG GOOGLE_GENAI_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV GOOGLE_GENAI_API_KEY=$GOOGLE_GENAI_API_KEY

RUN npm run build

# --- Stage 2: Run the Next.js application ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy public directory
COPY public ./public

# Set environment variables for runtime
# NEXT_PUBLIC_ variables are available in the browser
# API_KEY is server-side only
ARG NEXT_PUBLIC_API_URL
ARG GOOGLE_GENAI_API_KEY
ARG API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV GOOGLE_GENAI_API_KEY=$GOOGLE_GENAI_API_KEY
ENV API_KEY=$API_KEY

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the Next.js production server
CMD ["npm", "start"] 