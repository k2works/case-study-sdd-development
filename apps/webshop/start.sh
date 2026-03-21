#!/bin/bash
set -e

# Replace $PORT in nginx config
envsubst '${PORT}' < /etc/nginx/nginx-heroku.conf.template > /etc/nginx/nginx.conf

# Start Spring Boot in background
echo "Starting Spring Boot on port 8080..."
java -Xmx256m -Xms128m -jar /app/app.jar --server.port=8080 &

# Wait for Spring Boot to be ready
echo "Waiting for Spring Boot to start..."
for i in $(seq 1 60); do
    if curl -sf http://127.0.0.1:8080/api/health > /dev/null 2>&1; then
        echo "Spring Boot is ready!"
        break
    fi
    sleep 1
done

# Start nginx in foreground
echo "Starting nginx on port $PORT..."
exec nginx -g 'daemon off;'
