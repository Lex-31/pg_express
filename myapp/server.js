import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { DbService } from './services/dbService.js';

const app = express();
app.use(cors());
app.use(express.json()); // middleware для обработки JSON автоматически парсит входящие запросы с заголовком Content-Type: application/json и добавляет данные в req.body
app.use((req, res, next) => { // Отладочный middleware для логирования запрашиваемых путей
    console.log(`${new Date()} from ${req.header('x-forwarded-for') || req.ip} ${req.method} Request URL: ${req.originalUrl}`);
    next();
});
app.use('/data/folder1', express.static('/data/folder1')); // Укажите директорию, где находятся ваши PDF-файлы
app.use(productRoutes);  // подключение маршрутов для продуктов
app.use(categoryRoutes);  // подключение маршрутов для категорий
app.use(fileRoutes);  // подключение маршрутов для файлов и директорий

const PORT = 3000;

// выводит информацию о том, что произошло неперехваченное отклонение промиса, а также причину отклонения и сам промис
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });  // срабатывает при возникновении необработанного отклонения промиса

DbService.ensureTableExists().then(() => { //создание таблицы и заполнение БД
    app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
});