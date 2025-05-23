# Проксирование запросов к Node.js приложению Astro (/var/www/portal)
location / {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Обслуживание статических файлов
location /documents/ {
    alias /var/www/portal/public/documents/;
    autoindex on;
}