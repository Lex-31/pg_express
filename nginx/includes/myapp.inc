# Проксирование запросов к Node.js приложению начинающихся с /api
location /api {
    proxy_pass http://localhost:3000/api;
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


# --- Конфигурация для Production React App (SPA) ---
# Обслуживает собранное React-приложение из префикса /admin
location /admin {
    # Путь к собранным файлам вашего React-приложения.
    alias /var/www/myapp/frontend-react/dist/;

    # Эта директива - ключ к работе React Router.
    # Nginx сначала пытается найти запрошенный файл или папку.
    # Если не находит - отдает /index.html из папки, указанной в alias.
    # React Router внутри index.html уже сам разбирает URL (например, /admin/logs) и показывает нужную страницу.
    try_files $uri $uri/ /admin/index.html;
}

# --- Старая конфигурация для разработки (закомментирована) ---
# location /admin {
# #    rewrite ^/admin/(.*)$ /$1 break;
#     proxy_pass http://localhost:5173/admin;
#     proxy_http_version 1.1;
#     proxy_set_header Host $host;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection "upgrade";
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto $scheme;
# }


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

# Обслуживание статических файлов для React
location /frontend-react/ {
    alias /var/www/myapp/frontend-react/;
    try_files $uri $uri/ =404;
}

# Обслуживание статических файлов для React
#location /frontend-react/dist/ {
#    alias /var/www/myapp/frontend-react/dist/;
#    try_files $uri $uri/ =404;
#}

## Перенаправление на порт сервера разработки Vite (React-frontend)
#location /admin {
##    rewrite ^/admin/(.*)$ /$1 break;
#    proxy_pass http://localhost:5173/admin;
#    proxy_http_version 1.1;
#    proxy_set_header Host $host;
#    proxy_set_header Upgrade $http_upgrade;
#    proxy_set_header Connection "upgrade";
#    proxy_set_header X-Real-IP $remote_addr;
#    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#    proxy_set_header X-Forwarded-Proto $scheme;
#}