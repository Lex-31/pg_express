import { CategoryModel } from '../categoryModel.js';
import { pool } from '../../config/dbConfig.js';

afterAll(async () => {
    await pool.end();  // Закрываем пул соединений после выполнения всех тестов
});

describe('getAllCategories', () => {
    it('Проверка возвращаемых из БД категорий на соответсвие', async () => {
        const categories = await CategoryModel.getAllCategories();

        // Ожидаемые данные, которые должны быть в базе данных
        // Убедитесь, что эти данные действительно существуют в вашей базе данных
        const expectedCategories = [
            { "category_id": [1], "category_name": "Оборудование оперативно-технологической связи", "id": 1 },
            { "category_id": [1, 1], "category_name": "Аппаратура для избирательной связи", "id": 2 }
            // Добавьте другие ожидаемые категории, если они есть в базе данных, но не обязательно
        ];

        // Проверяем, что все ожидаемые категории присутствуют в результате
        expectedCategories.forEach(expectedCategory => {
            expect(categories).toContainEqual(expectedCategory);
        });
    });
});
