import { pool, table_name } from '../config/dbConfig.js';

/** Класс для SQL-запросов к таблицам категорий в базе данных 
 * @method getAllCategories - метод для получения всех категорий из базы данных */
export class CategoryModel {
    static async getAllCategories() {
        const client = await pool.connect();
        try {
            const result = await client.query(`SELECT * FROM ${table_name}_category`);
            return result.rows;

        } finally { client.release(); }
    }
}