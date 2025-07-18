# Проксирование к pgAdmin
location /pgadmin4/ {
    proxy_pass http://localhost:8080/pgadmin4/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
