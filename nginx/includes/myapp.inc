# Проксирование запросов к Node.js приложению начинающихся с /api
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Проксирование запросов к Node.js приложению начинающихся с /app
location /app {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Проксирование статических файлов
location /data/folder1 {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
}

# Обслуживание статических файлов для CSS
location /css/ {
    alias /var/www/myapp/css/;
    try_files $uri $uri/ =404;
}

# Обслуживание статических файлов для JS
location /frontend/ {
    alias /var/www/myapp/frontend/;
    try_files $uri $uri/ =404;
}
