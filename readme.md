8	Автозапуск сервера Node.js
Создание сервиса Systemd:
–	sudo nano /etc/systemd/system/myapp.service
Добавить в файл myapp.service:

[Unit]
#краткое описание сервиса
Description=My Node.js Application
Documentation=http://172.22.1.106:3000
#указывает что сервис должен быть запущен После запуска сети
After=network.target portal.service

[Service]
#команда для запуска приложения
ExecStart=/root/.nvm/versions/node/v22.14.0/bin/node /var/www/myapp/server.js
#рабочая директория приложения
WorkingDirectory=/var/www/myapp
#сервис должен быть перезапущен в случае сбоя
Restart=always
#автоматический перезапуск приложения каждые 10 минут, если оно завершилось с ошибкой
RestartSec=600
#пользователь и группа под которыми будет выполняться сервис
User=root
Group=root
#установка переменных окружения
Environment=PATH=/usr/bin:/usr/local/bin:/root/.nvm/versions/node/v22.14.0/bin
Environment=NODE_ENV=production
#Логи будут записываться в журнал (journal), который можно просматривать с помощью команды journalctl
StandardOutput=journal
#Логирование ошибок
StandardError=journal
#Логирование стандартного вывода
SyslogIdentifier=myapp

[Install]
#указывает что сервис должен быть запущен при достижении цели multi-user.target
WantedBy=multi-user.target

Перезагрузить Systemd для применения изменений:
–	sudo systemctl daemon-reload
Запуск сервиса и включение его для автоматического запуска при старте ОС:
–	sudo systemctl start myapp.service
–	sudo systemctl enable myapp.service
Проверка статуса сервиса:
–	sudo systemctl status myapp.service
Логи будут записываться в журнал (journal), который можно просматривать с помощью команды
–	journalctl -u myapp.service -b


9	Установка и настройка NGINX
Установите пакеты, необходимые для подключения apt-репозитория:
–	sudo apt install curl gnupg2 ca-certificates lsb-release ubuntu-keyring
Нужно импортировать официальный ключ, используемый apt для проверки подлинности пакетов. Скачайте ключ:
–	curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \ | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
Проверьте, верный ли ключ был загружен:
–	gpg --dry-run --quiet --no-keyring --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
Для подключения apt-репозитория для стабильной версии nginx, выполните следующую команду:
–	echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" | sudo tee /etc/apt/sources.list.d/nginx.list
Для использования пакетов из нашего репозитория вместо распространяемых в дистрибутиве, настройте закрепление:
–	echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | sudo tee /etc/apt/preferences.d/99nginx
Чтобы установить nginx, выполните следующие команды:
–	sudo apt update
–	sudo apt install nginx
В директории “/etc/nginx/sites-available/” нужно создать файл myapp следующего содержания:
server {
    listen 80;
    server_name 172.22.1.106;

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
    location / {
        alias /var/www/myapp/;
        try_files $uri $uri/ =404;
    }

    # Настройка обслуживания статического файла index.html
    index index.html;

    # Логирование
    error_log /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
}

Активация конфигурации:
–	sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
Проверка конфигурации:
–	sudo nginx -t
–	sudo systemctl restart nginx
Деактивация конфигурации apache2 и выключение:
–	a2dissite 000-default.conf
–	sudo systemctl stop apache2 (не получится, иначе pgadmin не работает)
–	sudo systemctl disable apache2 (не получится, иначе pgadmin не работает)


10	Установка pgAdmin
# Установите открытый ключ для репозитория (если это не было сделано ранее): 
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg 
# Создаем файл конфигурации репозитория: 
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update' 
# Устанавливаем pgAdmin 
# Устанавливаем для режимов рабочего стола и веб: 
sudo apt install pgadmin4 
# Устанавливаем только для режима рабочего стола: 
sudo apt install pgadmin4-desktop 
# Устанавливаем только для веб-режима: 
sudo apt install pgadmin4-web 
# Настраиваем веб-сервер, если установлен pgadmin4-web: 
sudo /usr/pgadmin4/bin/setup-web.sh


11	Настройка pgAdmin с apache на backend а nginx на frontend на 80порт
В файле /etc/apache2/ports.conf меняем настройку на Listen 8080
Перезапускаем: sudo systemctl restart apache2
Создаем файл конфигурации /etc/nginx/sites-available/pgadmin:
server {
    listen 80;
    server_name 172.22.1.106;
# Проксирование к pgAdmin
    location /pgadmin4/ {
        proxy_pass http://localhost:8080/pgadmin4/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
Активация конфигурации:
–	sudo ln -s /etc/nginx/sites-available/pgadmin /etc/nginx/sites-enabled/
Проверка конфигурации:
–	sudo nginx -t
–	sudo systemctl restart nginx


15	Автозапуск собранного проекта astro.js
Создание сервиса Systemd:
–	sudo nano /etc/systemd/system/portal.service
Добавить в файл myapp.service:

[Unit]
#краткое описание сервиса
Description=My Astro Application Portal
Documentation=http://172.22.1.106:4000
#указывает что сервис должен быть запущен После запуска сети
After=network.target

[Service]
#команда для запуска приложения
ExecStart=/bin/bash -c 'source /root/.nvm/nvm.sh && /root/.nvm/versions/node/v22.14.0/bin/npm run preview'
#рабочая директория приложения
WorkingDirectory=/var/www/portal
#сервис должен быть перезапущен в случае сбоя
Restart=always
#автоматический перезапуск приложения каждые 10 минут, если оно завершилось с ошибкой
RestartSec=600
#пользователь и группа под которыми будет выполняться сервис
User=root
Group=root
#установка переменных окружения
Environment=PATH=/usr/bin:/usr/local/bin:/root/.nvm/versions/node/v22.14.0/bin
Environment=NODE_ENV=production
#Логи будут записываться в журнал (journal), который можно просматривать с помощью команды journalctl
StandardOutput=journal
#Логирование ошибок
StandardError=journal
#Логирование стандартного вывода
SyslogIdentifier=portal

[Install]
#указывает что сервис должен быть запущен при достижении цели multi-user.target
WantedBy=multi-user.target

Перезагрузить Systemd для применения изменений:
–	sudo systemctl daemon-reload
Запуск сервиса и включение его для автоматического запуска при старте ОС:
–	sudo systemctl start portal
–	sudo systemctl enable portal
Проверка статуса сервиса:
–	sudo systemctl status portal
Логи будут записываться в журнал (journal), который можно просматривать с помощью команды
–	journalctl -u portal.service -b


## Запуск проекта:
- `node server.js` из директории myapp для запуска backend
- `npm run dev` из директории myapp/frontend-react для запуска frontend
- `npm run build` из директории myapp/frontend-react для сборки frontend