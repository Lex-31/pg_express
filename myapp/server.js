import express from "express";
import cors from "cors";
import { pool, ensureTableExists, table_name } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json()); // middleware для обработки JSON автоматически парсит входящие запросы с заголовком Content-Type: application/json и добавляет данные в req.body

// Отладочный middleware для логирования запрашиваемых путей
app.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});



//маршрут прокси для скачки документов
/*app.get('//proxy', async (req, res) => {
    try {
        const url = req.query.url;
        const response = await fetch(url);
        res.set('Content-Type', response.headers.get('Content-Type'));
        response.body.pipe(res);
    } catch (error) {
        res.status(500).send(error.message);
    }
});*/




//маршрут по пути /app из index.html (fetch 172.22.1.100/api/test)
app.get('//test', async (req, res) => {
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
    } finally {
        client.release();
    }
});

//маршрут GET запроса для 1 строки таблицы БД по id
app.get('//test/:id', async (req, res) => {
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
        if (result.rowCount === 0) {
            return res.status(404).send('Record not found');
        }

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
    } finally {
        client.release();
    }
});

//маршрут запроса списка категорий
app.get('//categories', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM ${table_name}_category`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});

//маршрут запроса типов документов
/*app.get('//doc-types', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM ${table_name}_doc`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release();
    }
});*/

//маршрут изменение записи :id в таблице
app.put('//test/:id', async (req, res) => {

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

        /*
        console.log('ID записаного в базу изделия id: ', id); // [10]
        console.log('docs до маппинга: ', docs); // []

        const insertDocsQuery = `
            INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
            VALUES ${docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
        `;

        console.log('docs после маппинга: ', docs); // []
        console.log('SQL запрос записи в таблицу документов изделия insertDocsQuery: ', insertDocsQuery); // INSERT INTO stalenergo_doc (prod_id, doc_name, doc_link) VALUES

        const docValues = [id, ...docs.flat()];

        console.log('что из себя представляет docValues: ', docValues); // [ '10' ]

        await client.query(insertDocsQuery, docValues); //вставка данных в ${table_name}_doc
        */

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
    } finally {
        client.release();
    }
});

//маршрут добавления новой записи
app.post('//test', async (req, res) => {

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
        /*
        console.log('ID записаного в базу изделия prodId : ', prodId); //448
        console.log('docs до маппинга: ', docs); //[]


        const insertDocsQuery = `
        INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
        VALUES ${docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
        `;

        console.log('docs после маппинга: ', docs); //[]
        console.log('SQL запрос записи в таблицу документов изделия insertDocsQuery: ', insertDocsQuery); //INSERT INTO stalenergo_doc (prod_id, doc_name, doc_link) VALUES


        const docValues = [prodId, ...docs.flat()];

        console.log('что из себя представляет docValues: ', docValues); // [ 448 ]

        await client.query(insertDocsQuery, docValues);
        */

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
    } finally {
        client.release();
    }
});

//маршрут удаление записи по id
app.delete('//test/:id', async (req, res) => {
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
    } finally {
        client.release();
    }
});

const PORT = 3000;

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Опционально: завершить процесс с ошибкой
    // process.exit(1);
});

ensureTableExists().then(() => { //создание таблицы и заполнение БД
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});