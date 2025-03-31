import express from "express";
import cors from "cors";
import { pool, ensureTableExists, table_name } from "./db.js";
import fs from "fs";
import https from "https";

const app = express();
app.use(cors());
app.use(express.json()); // middleware для обработки JSON автоматически парсит входящие запросы с заголовком Content-Type: application/json и добавляет данные в req.body
app.use((req, res, next) => { // Отладочный middleware для логирования запрашиваемых путей
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});
app.use('/data/folder1', express.static('/data/folder1')); // Укажите директорию, где находятся ваши PDF-файлы

//маршрут по пути / из index.html (fetch 172.22.1.106/api/main)
app.get('/api/main', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT
                p.id,
                c.category_id AS category_code,  -- переименовываем table_name_category.category_id в category_code
                c.category_name,
                p.item_number,
                p.prod_name,
                p.prod_mark,
                p.prod_number,
                p.prod_okpd2,
                p.prod_okved2
            FROM
                ${table_name} p
            JOIN  -- Если нужны все продукты (включая те, у которых нет категории), используйте LEFT JOIN
                ${table_name}_category c
                ON p.category_id = c.category_id  -- соединяет таблицы по полю category_id
            ORDER BY
                c.category_id,  -- сортировка по категориям
                p.item_number  -- сортировка изделий внутри каждой категории по номеру изделия
        `);
        const items = result.rows;
        for (const item of items) {
            const docsResult = await client.query(`
                SELECT doc_name, doc_link
                FROM ${table_name}_doc
                WHERE prod_id = $1
            `, [item.id]);
            item.docs = docsResult.rows;
        }
        res.json(items);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

//маршрут GET запроса для 1 строки таблицы БД по id
app.get('/api/main/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT
                p.*,  -- выбрать все поля таблицы table_name
                c.category_id AS category_code,  -- переименовываем table_name_category.category_id в category_code
                c.category_name
            FROM
                ${table_name} p
            JOIN  -- Если нужны все продукты (включая те, у которых нет категории), используйте LEFT JOIN
                ${table_name}_category c
                ON p.category_id = c.category_id  -- соединяет таблицы по полю category_id
            WHERE
                p.id = $1  -- выбирает запись только с определенным table_name.id
        `, [id]);
        if (result.rowCount === 0) { return res.status(404).send('Record not found'); }
        const docsResult = await client.query(`
            SELECT
                doc_name,
                doc_link
            FROM
                ${table_name}_doc
            WHERE
                prod_id = $1
        `, [id]);
        const data = result.rows[0];
        data.docs = docsResult.rows;
        res.json(data);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

//маршрут запроса списка категорий
app.get('/api/categories', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM ${table_name}_category`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

//маршрут получения доступа к статическому файлу PDF...
app.post('/api/get-pdf', (req, res) => {
    const originalPath = req.body.path;
    try {
        const newPath = originalPath.replace(/\\\\fs3\\Производственный архив центрального офиса\\/, '/data/folder1/').replace(/\\/g, '/'); // Замена пути
        if (fs.existsSync(newPath)) { // Проверка существования файла - вариант статического файла
            const fileUrl = `http://${req.headers.host}${newPath}`; //создание пути к статическому файлу
            res.json({ url: fileUrl }); // Возвращаем в ответе URL для доступа к статическому файлу
        } else { res.status(404).send('File not found'); }
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).send('Internal Server Error');
    }
});

//маршрут для загрузки файлов по внешним ссылкам
app.post('/api/download-external', (req, res) => {
    const { url } = req.body;
    try {
        const request = https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileName = url.split('/').pop();
                res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                response.pipe(res);
            } else { res.status(response.statusCode).send('Failed to download file'); }
        });

        request.on('error', (error) => {
            console.error('Error downloading external file:', error);
            res.status(500).send('Internal Server Error');
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).send('Internal Server Error');
    }
});

//маршрут изменение записи :id в таблице
app.put('/api/test/:id', async (req, res) => {
    const { id } = req.params;
    const { category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd2, prod_okved2, docs } = req.body;
    const client = await pool.connect();
    try {
        await client.query(`
            UPDATE
                ${table_name}
            SET  -- набор данных подлежащих обновлению
                category_id = $1,
                item_number = $2,
                prod_name = $3,
                prod_mark = $4,
                prod_number = $5,
                prod_okpd2 = $6,
                prod_okved2 = $7
            WHERE  -- обновление применяется только к 1 записи параметров изделия
                id = $8
        `, [category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd2, prod_okved2, id]);
        await client.query(`DELETE FROM ${table_name}_doc WHERE prod_id = $1`, [id]);  //удаляет всю документацию одного изделия. ***нужно сделать чтобы избирательно удалял
        if (docs && docs.length > 0) {
            const insertDocsQuery = `
                INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
                VALUES ${docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
            `;
            const docValues = [id, ...docs.flat()];
            await client.query(insertDocsQuery, docValues);
        }
        res.json({ msg: 'Row updated successfully', id: id });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

//маршрут добавления новой записи
app.post('/api/test', async (req, res) => {
    const { category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd2, prod_okved2, docs } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query(`
            INSERT INTO
                ${table_name} (category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd2, prod_okved2)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING  -- возвращает id новой записи из table_name
                id
        `, [category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd2, prod_okved2]);

        const prodId = result.rows[0].id;

        if (docs && docs.length > 0) {
            const insertDocsQuery = `
                INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
                VALUES ${docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
            `;
            const docValues = [prodId, ...docs.flat()];
            await client.query(insertDocsQuery, docValues);
        }
        res.status(201).json({ msg: 'Row inserted successfully', id: prodId }); //успешное добавление, возвращается статус 201 Created и id новой записи
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

//маршрут удаление записи по id
app.delete('/api/test/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        // Удаляем все документы, связанные с изделием
        await client.query(`DELETE FROM ${table_name}_doc WHERE prod_id = $1`, [id]);
        // Удаляем само изделие
        await client.query(`DELETE FROM ${table_name} WHERE id = $1`, [id]);

        res.json({ msg: 'Row and associated documents deleted successfully', id: id });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally { client.release(); }
});

const PORT = 3000;

process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });

ensureTableExists().then(() => { //создание таблицы и заполнение БД
    app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
});