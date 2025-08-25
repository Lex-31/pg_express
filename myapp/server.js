import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import logRoutes from './routes/logRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { DbService } from './services/dbService.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); //получаем текущую директорию

app.use(cors());
app.use(express.json()); // middleware для обработки JSON автоматически парсит входящие запросы с заголовком Content-Type: application/json и добавляет данные в req.body
app.use((req, res, next) => { // Отладочный middleware для логирования запрашиваемых путей
    console.log(`${new Date()} from ${req.header('x-forwarded-for') || req.ip} ${req.method} Request URL: ${req.originalUrl}`);
    next();
});
app.use('/data/folder1', express.static('/data/folder1')); // Укажите директорию, где находятся ваши PDF-файлы

// Маршрут для продукции
app.get('/app/prod', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index.html'));
});

// Маршрут для списка ЖП
app.get('/app/zp', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'index2.html'));
});

//Маршрут для конкретного ЖП
app.get('/app/zp/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index3.html'));
});

app.use(productRoutes);  // подключение маршрутов для продуктов
app.use(categoryRoutes);  // подключение маршрутов для категорий
app.use(fileRoutes);  // подключение маршрутов для файлов и директорий
app.use(logRoutes);  // подключение маршрутов для логирования
app.use(authRoutes); // подключение маршрутов для аутентификации ???возможно удалить надо первый аргумент '/api'

const PORT = 3000;

// выводит информацию о том, что произошло неперехваченное отклонение промиса, а также причину отклонения и сам промис
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});  // срабатывает при возникновении необработанного отклонения промиса


DbService.checkTablesStructure().then(isStructureValid => { //проверка структуры таблицы БД перед запуском сервера
    if (isStructureValid) {  // 
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } else {
        console.log('Проверьте существование и структуру таблиц и перезапустите сервер.');
        process.exit(1); // Завершаем выполнение скрипта с ошибкой
    }
});