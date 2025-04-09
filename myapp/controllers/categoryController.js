import { CategoryModel } from '../models/categoryModel.js';

/** Класс для обработки запросов, связанных с категориями.
 * @method getAllCategories - Получение всех категорий. */
export class CategoryController {
    static async getAllCategories(req, res) {
        try {
            const categories = await CategoryModel.getAllCategories();
            res.json(categories);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }
}