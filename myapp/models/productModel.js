import { pool, table_name } from '../config/dbConfig.js';

/** Класс для SQL-запросов к таблицам продуктов в базе данных
 * @method getAllProducts - метод для получения всех продуктов из базы данных
 * @method getProductById - метод для получения продукта по id
 * @method createProduct - метод для создания нового продукта
 * @method updateProduct - метод для обновления продукта
 * @method deleteProduct - метод для удаления продукта */
export class ProductModel {
    static async getAllProducts() {  //метод для получения всех продуктов из базы данных
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    p.id,
                    c.category_id AS category_code,
                    c.category_name,
                    p.item_number,
                    p.prod_name,
                    p.prod_mark,
                    p.prod_number,
                    p.prod_okpd,
                    p.prod_okved,
                    p.prod_dir
                FROM
                    ${table_name} p
                JOIN  -- Если нужны все продукты (включая те, у которых нет категории) LEFT JOIN
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
            return items;

        } finally { client.release(); }
    }

    static async getProductById(id) {  // метод для получения продукта по id
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    p.*,
                    c.category_id AS category_code,
                    c.category_name
                FROM
                    ${table_name} p
                JOIN  -- Если нужны все продукты (включая те, у которых нет категории), используйте LEFT JOIN
                    ${table_name}_category c
                    ON p.category_id = c.category_id  -- соединяет таблицы по полю category_id
                WHERE
                    p.id = $1  -- выбирает запись только с определенным table_name.id
            `, [id]);
            if (result.rowCount === 0) {  // если запись не найдена, возвращает 404 ошибку
                return null;

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
            return data;

        } finally { client.release(); }
    }

    static async createProduct(productData) {  // метод для создания новой записи
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO
                    ${table_name} (category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd, prod_okved, prod_dir)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING  -- возвращает id новой записи из table_name
                    id
            `, [productData.category_id, productData.item_number, productData.prod_name, productData.prod_mark, productData.prod_number, productData.prod_okpd, productData.prod_okved, productData.prod_dir]);

            const prodId = result.rows[0].id;

            if (productData.docs && productData.docs.length > 0) {
                const insertDocsQuery = `
                    INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
                    VALUES ${productData.docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
                `;
                const docValues = [prodId, ...productData.docs.flat()];
                await client.query(insertDocsQuery, docValues); //вставить код SQL в функцию
            }
            return { msg: 'Row inserted successfully', id: prodId }; //успешное добавление, возвращается id новой записи

        } catch (err) {
            console.error('Error executing query', err.stack);
            res.status(500).send('Internal Server Error');
        } finally { client.release(); }
    }

    static async updateProduct(id, productData) { // Метод для обновления записи продукта в таблице
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
                    prod_okpd = $6,
                    prod_okved = $7,
                    prod_dir = $8
                WHERE  -- обновление применяется только к 1 записи параметров изделия
                    id = $9
            `, [productData.category_id, productData.item_number, productData.prod_name, productData.prod_mark, productData.prod_number, productData.prod_okpd, productData.prod_okved, productData.prod_dir, id]);

            await client.query(`DELETE FROM ${table_name}_doc WHERE prod_id = $1`, [id]);  //удаляет всю документацию одного изделия. ***нужно сделать чтобы избирательно удалял

            if (productData.docs && productData.docs.length > 0) {
                const insertDocsQuery = `
                    INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link)
                    VALUES ${productData.docs.map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`).join(', ')}
                `;
                const docValues = [id, ...productData.docs.flat()];
                await client.query(insertDocsQuery, docValues);
            }
            return { msg: 'Row updated successfully', id: id };

        } finally { client.release(); }
    }

    static async deleteProduct(id) { // Метод для удаления записи продукта из таблицы
        const client = await pool.connect();
        try {
            // Удаляем все документы, связанные с изделием
            await client.query(`DELETE FROM ${table_name}_doc WHERE prod_id = $1`, [id]);
            // Удаляем само изделие
            await client.query(`DELETE FROM ${table_name} WHERE id = $1`, [id]);
            return { msg: 'Row and associated documents deleted successfully', id: id };

        } finally { client.release(); }
    }
}