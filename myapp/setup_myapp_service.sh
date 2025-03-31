#!/bin/bash

# Проверяем, существует ли сервис и активен ли он
if sudo systemctl is-active --quiet myapp.service; then
    # Останавливаем сервис, если он активен
    sudo systemctl stop myapp.service
    echo "Сервис myapp.service остановлен."
else
    echo "Сервис myapp.service не активен или не существует."
fi

# Задержка в 3 секунды
sleep 3

# Создаем файл сервиса
SERVICE_FILE="/etc/systemd/system/myapp.service"

# Записываем конфигурацию сервиса в файл
cat <<EOL | sudo tee $SERVICE_FILE
[Unit]
#краткое описание сервиса
Description=My Node.js Application
Documentation=http://172.22.1.106
#указывает что сервис должен быть запущен После запуска сети
After=network.target

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
EOL

# Задержка в 3 секунды
sleep 3

# Перезагружаем демона systemd для применения изменений
sudo systemctl daemon-reload

# Задержка в 3 секунды
sleep 3

# Запускаем сервис
sudo systemctl start myapp.service

# Задержка в 3 секунды
sleep 3

# Включаем сервис для автозагрузки
sudo systemctl enable myapp.service

# Задержка в 3 секунды
sleep 3

# Выводим статус сервиса
sudo systemctl status myapp.service  --no-pager

# Задержка в 3 секунды
sleep 3

echo "Сервис myapp.service успешно установлен и запущен."

# Явное завершение скрипта
exit 0