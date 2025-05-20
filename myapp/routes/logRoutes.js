import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const logFilePath = path.join(process.cwd(), 'log_cud');

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
});

export default router;