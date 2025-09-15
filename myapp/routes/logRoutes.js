import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'; // ИМПОРТИРУЕМ fileURLToPath
import { authenticateToken } from './authMiddleware.js'; // Подключаем middleware для проверки токена

// ИСПРАВЛЕНИЕ: Правильное получение __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Директория, где хранятся логи
const logsDir = path.join(__dirname, '..', 'logs');

// GET /api/logs - новый маршрут для получения логов
// Добавляем authenticateToken, чтобы только авторизованные пользователи могли смотреть логи
router.get('/api/logs', authenticateToken, async (req, res) => {

    // Опциональная проверка прав: можно добавить право 'view_logs'
    if (!req.user || !req.user.permissions.includes('view_logs')) {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }

    try {
        // Определяем имя файла лога для ТЕКУЩЕГО месяца
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const filename = `${year}-${month}.log`;
        const logFilePath = path.join(logsDir, filename);

        // Проверяем, существует ли файл
        try {
            await fs.access(logFilePath);
        } catch {
            // Если файл за текущий месяц еще не создан, возвращаем пустой массив
            return res.status(200).json([]);
        }

        // Читаем содержимое файла
        const data = await fs.readFile(logFilePath, 'utf8');

        // Разделяем файл на строки, отбрасываем пустые строки, если они есть
        const logLines = data.split('\n').filter(line => line.trim() !== '');

        // Парсим каждую JSON-строку в объект
        const logs = logLines.map(line => JSON.parse(line));

        // Отправляем массив объектов на фронтенд
        res.status(200).json(logs);

    } catch (error) {
        console.error('Ошибка при чтении лог-файла:', error);
        res.status(500).json({ message: 'Ошибка на сервере при чтении логов.' });
    }
});

/*const logFilePath = path.join(process.cwd(), 'log_cud');

router.get('/api/log', (req, res) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading log file');
        }

        const logs = data.split('\n').filter(log => log.trim() !== '');

        let html = `
            <html>
                <head>
                    <title>Logs</title>
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Logs</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Имя пользователя</th>
                                <th>Операция</th>
                                <th>ID записи</th>
                                <th>Содержимое записи</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        logs.forEach(log => {
            const [timestamp, username, operation, id, ...rest] = log.split('"').filter(item => item.trim() !== '');
            // const record = rest.join('').split('<br>').join(', ');
            html += `
                <tr>
                    <td>${timestamp}</td>
                    <td>${username}</td>
                    <td>${operation}</td>
                    <td>${id}</td>
                    <td>${rest}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        res.send(html);
    });
});*/

export default router;