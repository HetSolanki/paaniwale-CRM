FROM nginx:alpine

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY dist /usr/share/nginx/html

# Healthcheck (optional)
HEALTHCHECK CMD wget --spider -q localhost:3001 || exit 1
    