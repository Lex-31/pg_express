#!/bin/bash

# Останавливаем сервис
sudo systemctl stop myapp.service

# Задержка в 1 сек
sleep 3

# Отключаем сервис от автозагрузки
sudo systemctl disable myapp.service

# Задержка в 1 сек
sleep 3

# Удаляем файл сервиса
sudo rm /etc/systemd/system/myapp.service

# Задержка в 1 сек
sleep 3

# Перезагружаем демон systemd
sudo systemctl daemon-reload

echo "Сервис myapp.service успешно удален."