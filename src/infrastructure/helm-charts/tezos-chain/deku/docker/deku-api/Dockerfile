FROM nginx:alpine

# Copy api source
WORKDIR /app
COPY nix /nix/
COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /app/start.sh

# Start nginx and api
CMD /app/start.sh

# Expose nginx port
EXPOSE 80
