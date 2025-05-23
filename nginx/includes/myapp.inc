# Проксирование запросов к Node.js приложению начинающихся с /api
location /api {
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

# Основной алиас для статического приложения, исключая pgadmin4 и api
location /prod/ {
    alias /var/www/myapp/;
    try_files $uri $uri/ =404;
}

# Настройка обслуживания статического файла index.html
index index.html;

# Логирование
error_log /var/log/nginx/error.log;
access_log /var/log/nginx/access.log;
