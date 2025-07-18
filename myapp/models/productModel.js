import { pool, table_name } from '../config/dbConfig.js';

/** Класс для SQL-запросов к таблицам продуктов в базе данных
 * @method getAllProducts - метод для получения всех продуктов из базы данных
 * @method getProductById - метод для получения продукта по id
 * @method getAllZp - метод для получения всех ЖП
 * @method getNotesZp - метод для получения всех записей в ЖП по id
 * @method getCountNotesInZp - метод для получения кол-ва записей в ЖП
 * @method createProduct - метод для создания нового продукта
 * @method createZp - метод для создания нового ЖП
 * @method createNoteZp - метод для создания новой записи в ЖП
 * @method updateProduct - метод для обновления продукта
 * @method updateZp - метод для обновления ЖП
 * @method updateNoteZp - метод для обновления записи в ЖП
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

    static async getAllZp() {  //метод для получения всех ЖП
        const client = await pool.connect();
        try {
            const zp = await client.query(`
                SELECT
                    zp.id,
                    zp.zp_name
                FROM
                    ${table_name}_zp zp
                ORDER BY
                    zp.id ASC;  -- сортировка по номеру ЖП
            `);
            return zp.rows;
        } finally { client.release(); }
    }

    static async getNotesZp(id) {  // метод для получения всех записей в ЖП по id
        const client = await pool.connect();
        try {
            const notes = await client.query(`
                SELECT
                    stalenergo_zp.id,
                    stalenergo_zp.zp_name,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', stalenergo_notes_zp.id,
                                'note_zp_id', stalenergo_notes_zp.note_zp_id,
                                'name_note', stalenergo_notes_zp.name_note,
                                'note', stalenergo_notes_zp.note,
                                'owner_note', stalenergo_notes_zp.owner_note,
                                'owner_date', stalenergo_notes_zp.owner_date,
                                'response', stalenergo_notes_zp.response,
                                'response_note', stalenergo_notes_zp.response_note,
                                'response_date', stalenergo_notes_zp.response_date,
                                'archive', stalenergo_notes_zp.archive,
                                'ii_cd', stalenergo_notes_zp.ii_cd
                            )
                        )
                        FROM (
                            SELECT * FROM stalenergo_notes_zp
                            WHERE stalenergo_notes_zp.zp_id = stalenergo_zp.id
                            ORDER BY stalenergo_notes_zp.note_zp_id ASC -- сортировка записей по номеру п/п
                        ) AS stalenergo_notes_zp
                    )
                FROM stalenergo_zp
                WHERE stalenergo_zp.id = $1; -- выбирает запись только с определенным table_name.id
            `, [id]);
            if (notes.rowCount === 0) {  // если ЖП с таким id не найден, возвращает 404 ошибку
                return null;
            }
            return notes.rows[0];
        } finally { client.release(); }
    }

    static async getCountNotesInZp() {  //метод для получения кол-ва записей в ЖП
        const client = await pool.connect();
        try {
            const count = await client.query(`
                SELECT
                    zp_id,
                    COUNT(*) AS count,
                    SUM(CASE WHEN ii_cd != '' THEN 1 ELSE 0 END) AS with_ii_cd,
                    SUM(CASE WHEN response_note = '' THEN 1 ELSE 0 END) AS unsigned
                FROM
                    ${table_name}_notes_zp
                GROUP BY
                    zp_id;
            `);
            console.log(count.rows);

            return count.rows;
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
            console.error('Error executing query', err.stack); // err.stack - трассировка стека вызовов чтобы отследить где происходит ошибка
            res.status(500).send('Internal Server Error');
        } finally { client.release(); }
    }

    static async createZp(zpData) {  // метод для создания нового ЖП
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO
                    ${table_name}_zp (id, zp_name)
                VALUES
                    ($1, $2)
                RETURNING  -- возвращает id новой записи из table_name_zp
                    id
            `, [zpData.id, zpData.zp_name]);

            const zpId = result.rows[0].id;
            return { msg: 'Row inserted successfully', id: zpId }; //успешное добавление, возвращается id новой записи
        } catch (err) {
            console.error('Error executing query', err.stack); // err.stack - трассировка стека вызовов чтобы отследить где происходит ошибка
            return err.detail; //возвращает сообщение c описанием об ошибке
        } finally { client.release(); }
    }

    static async createNoteZp(noteData) {  // метод для создания новой записи в ЖП
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO
                    ${table_name}_notes_zp (note_zp_id, zp_id, name_note, note, owner_note, owner_date, response, response_note, response_date)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING  -- возвращает id новой записи из table_name_notes_zp
                    id
            `, [noteData.note_zp_id, noteData.zp_id, noteData.name_note, noteData.note, noteData.owner_note, noteData.owner_date, noteData.response, noteData.response_note, noteData.response_date]);

            const noteId = result.rows[0].id;
            return { msg: 'Row inserted successfully', id: noteId }; //успешное добавление, возвращается id новой записи
        } catch (err) {
            console.error('Error executing query', err.stack); // err.stack - трассировка стека вызовов чтобы отследить где происходит ошибка
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

    static async updateZp(id, zpData) { // Метод для обновления ЖП в таблице
        const client = await pool.connect();
        try {
            //надо добавить обновление полей zp_id в таблице ${table_name}_notes_zp
            await client.query(`
                UPDATE
                    ${table_name}_zp
                SET  -- набор данных подлежащих обновлению
                    id = $1, -- новый id
                    zp_name = $2
                WHERE  -- обновление применяется только к 1 ЖП
                    id = $3 -- старый id
            `, [zpData.id, zpData.zp_name, id]);
            return { msg: 'Row updated successfully', id: id };
        } finally { client.release(); }
    }

    static async updateNoteZp(noteId, noteData) { //  Метод обновления существующей записи в ЖП
        const client = await pool.connect();
        try {
            await client.query(`
                UPDATE
                    ${table_name}_notes_zp
                SET  -- набор данных подлежащих обновлению
                    note_zp_id = $1,
                    name_note = $2,
                    note = $3,
                    owner_note = $4,
                    owner_date = $5,
                    response = $6,
                    response_note = $7,
                    response_date = $8,
                    archive = $9,
                    ii_cd = $10
                WHERE  -- обновление применяется только к 1 записи в ЖП
                    id = $11
            `, [noteData.note_zp_id, noteData.name_note, noteData.note, noteData.owner_note, noteData.owner_date, noteData.response, noteData.response_note, noteData.response_date, noteData.archive, noteData.ii_cd, noteId]);
            return { msg: 'Row updated successfully', id: noteId };
        } finally { client.release(); }
    }

    static async deleteProduct(id) { // Метод для удаления записи продукта из таблицы
        const client = await pool.connect();
        try {
            // Получаем данные записи перед удалением
            const selectQuery = `
                SELECT 
                    category_id,
                    item_number,
                    prod_name,
                    prod_mark,
                    prod_number,
                    prod_okpd,
                    prod_okved,
                    prod_dir
                FROM ${table_name}
                WHERE id = $1
            `;
            const selectResult = await client.query(selectQuery, [id]);
            const deletedRow = selectResult.rows[0];
            if (!deletedRow) {
                throw new Error('Row not found');
            }
            await client.query(`DELETE FROM ${table_name}_doc WHERE prod_id = $1`, [id]); // Удаляем все документы, связанные с изделием
            await client.query(`DELETE FROM ${table_name} WHERE id = $1`, [id]); // Удаляем само изделие
            return { msg: 'Row and associated documents deleted successfully', id: id, deletedRow: deletedRow };
        } finally { client.release(); }
    }

    static async deleteZp(id) { // Метод для удаления ЖП
        const client = await pool.connect();
        try {
            // Получаем данные ЖП перед удалением
            const selectQuery = `
                SELECT 
                    id,
                    zp_name
                FROM ${table_name}_zp
                WHERE id = $1
            `;
            const selectResult = await client.query(selectQuery, [id]);  //делаем запрос к БД
            const deletedRow = selectResult.rows[0]; //ответ от БД {"id":18,"zp_name":"ЗФ 220"}
            if (!deletedRow) { //если в ответе от БД нет данных
                throw new Error('Row not found');
            }
            await client.query(`DELETE FROM ${table_name}_zp WHERE id = $1`, [id]);  // Удаляем ЖП
            return { msg: 'Row and associated documents deleted successfully', id: id, deletedRow: deletedRow };
        } finally { client.release(); }
    }

    static async deleteNoteZp(noteId) { // Метод для удаления записи в ЖП
        const client = await pool.connect();
        try {
            // Получаем данные записи перед удалением
            const selectQuery = `
                SELECT 
                    *
                FROM ${table_name}_notes_zp
                WHERE id = $1
            `;
            const selectResult = await client.query(selectQuery, [noteId]);  //делаем запрос к БД
            const deletedRow = selectResult.rows[0]; //ответ от БД 
            if (!deletedRow) { //если в ответе от БД нет данных
                throw new Error('Row not found');
            }
            await client.query(`DELETE FROM ${table_name}_notes_zp WHERE id = $1`, [noteId]);  // Удаляем запись в ЖП
            return { msg: 'Row and associated documents deleted successfully', noteId: noteId, deletedRow: deletedRow };
        } finally { client.release(); }
    }
}