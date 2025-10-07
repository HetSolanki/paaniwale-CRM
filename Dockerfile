# ---------- Stage 1: Builder ----------
FROM node:20-alpine As node_builder

# Increase memory limit
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install dependencies and build the application
WORKDIR /build

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .


# Build with production env
ARG VITE_API_BASE_URL
ARG VITE_CLOUD_NAME
ARG VITE_CLOUD_API_KEY
ARG VITE_CLOUD_API_SECRET
ARG VITE_CLOUD_UPLOAD_PRESET
ARG VITE_WHATSAPP_BUSSINESS_ID
ARG VITE_WHATSAPP_PHONE_NUMBER_ID
ARG VITE_WHATSAPP_USER_ACCESS_TOKEN
ARG VITE_WHATSAPP_API_VERSION
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application using Vite
RUN npm run build


# ---------- Stage 2: Production Image ----------

FROM nginx:alpine

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=node_builder /build/dist /usr/share/nginx/html

# Healthcheck (optional)
HEALTHCHECK CMD wget --spider -q localhost:3001 || exit 1
