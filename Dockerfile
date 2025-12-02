# syntax=docker/dockerfile:1

# ============================================
# 9mm App Tokens - Static Assets Server
# ============================================

FROM nginx:alpine

# Copy all static assets
COPY . /usr/share/nginx/html/

# Remove unnecessary files from the container
RUN rm -rf /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.gitignore \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/README.md \
    /usr/share/nginx/html/package*.json \
    /usr/share/nginx/html/script.js

# Custom nginx config for CORS and caching
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    root /usr/share/nginx/html;

    # Enable CORS for all origins (token lists need this)
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, OPTIONS';
    add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept';

    # Cache static assets aggressively
    location ~* \.(png|jpg|jpeg|gif|ico|svg|json)$ {
        expires 1d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

