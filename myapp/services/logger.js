import fs from 'fs';
import path from 'path';

export class Logger {
    constructor(logFilePath = 'log_cud') {
        this.logFilePath = path.join(process.cwd(), logFilePath);
    }

    logAction(username, operation, id, record) {
        // const timestamp = new Date().toISOString();
        const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        const logEntry = `"${timestamp}" "${username}" "${operation}" "${id}" "${Object.values(record).join('<br>')}"\n`;
        fs.appendFileSync(this.logFilePath, logEntry);
    }
}
