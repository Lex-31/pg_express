import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'; // ИМПОРТИРУЕМ fileURLToPath

// ИСПРАВЛЕНИЕ: Правильное получение __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Директория, где хранятся логи
const logsDir = path.join(__dirname, '..', 'logs');

/**
 * Записывает действие в лог-файл, ротируемый по месяцам.
 *
 * @param {object} logData - Данные для логирования.
 * @param {object} logData.actor - Пользователь, совершивший действие (из req.user).
 * @param {string} logData.action - Тип действия ('CREATE', 'UPDATE', 'DELETE').
 * @param {string} logData.entity - Тип сущности ('user', 'user_permissions').
 * @param {number|string} logData.entityId - ID целевой сущности.
 * @param {object|null} [logData.details] - Дополнительные детали, например, что именно изменилось.
 */
export async function logAction({ actor, action, entity, entityId, details = {} }) {
    try {
        // Определяем имя файла ГГГГ-ММ.log
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const filename = `${year}-${month}.log`;
        const logFilePath = path.join(logsDir, filename);

        // Убедимся, что директория существует
        await fs.mkdir(logsDir, { recursive: true });

        // Формируем запись лога в виде объекта JSON
        const logEntry = {
            timestamp: now.toISOString(),
            actor: {
                id: actor ? actor.userId : null,
                username: actor ? actor.username : 'SYSTEM',
            },
            action,
            entity: {
                type: entity,
                id: entityId,
            },
            details
        };

        // Превращаем объект в строку и добавляем перенос строки
        const logLine = JSON.stringify(logEntry) + '\n';

        // Дописываем строку в конец файла
        await fs.appendFile(logFilePath, logLine);

    } catch (error) {
        // Выводим ошибку в консоль, но не прерываем выполнение основного запроса
        console.error('Ошибка записи в лог-файл:', error);
    }
}
