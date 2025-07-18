import { ProductModel } from '../models/productModel.js';
import { Logger } from '../services/logger.js';

const logger = new Logger();

/** Класс для обработки запросов, связанных с продуктами.
 * @method getAllProducts - Получение всех продуктов.
 * @method getProductById - Получение продукта по ID.
 * @method getAllZp - Получение всех ЖП.
 * @method getNotesZp - Получение записей в ЖП по ID.
 * @method getCountNotesInZp - Получение количества записей в ЖП.
 * @method createProduct - Создание нового продукта.
 * @method createZp - Создание нового ЖП.
 * @method createNoteZp - Создание новой записи в ЖП.
 * @method updateProduct - Обновление существующего продукта.
 * @method updateZp - Обновление существующего ЖП.
 * @method updateNoteZp - Обновление существующей записи в ЖП.
 * @method deleteProduct - Удаление продукта.
 * @method deleteZp - Удаление ЖП.
 * @method deleteNoteZp - Удаление записи в ЖП. */
export class ProductController {
    static async getAllProducts(req, res) {  //получение всех записей из таблицы
        try {
            const products = await ProductModel.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getProductById(req, res) {  //получение записи по id
        const { id } = req.params;
        try {
            const product = await ProductModel.getProductById(id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.json(product);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getAllZp(req, res) {  //получение всех записей из таблицы ЖП
        try {
            const zp = await ProductModel.getAllZp();
            res.json(zp);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getNotesZp(req, res) {  //получение всех записей в ЖП по id ЖП
        const { id } = req.params; //ID ЖП
        try {
            const zpNotes = await ProductModel.getNotesZp(id);
            if (!zpNotes) {
                return res.status(404).send('Product not found');
            }
            res.json(zpNotes);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async getCountNotesInZp(req, res) {  //получение кол-ва записей в ЖП
        try {
            const count = await ProductModel.getCountNotesInZp();
            res.json(count);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async createProduct(req, res) {  //добавление новой записи
        const productData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.createProduct(productData);
            logger.logAction(username, 'CREATE', result.id, productData); // Логирование созданной записи
            res.status(201).json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async createZp(req, res) {  //добавление нового ЖП
        const zpData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.createZp(zpData);
            logger.logAction(username, 'CREATE', result.id, zpData); // Логирование созданной записи
            res.status(201).json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async createNoteZp(req, res) {  //добавление новой записи в ЖП
        const noteData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.createNoteZp(noteData); //возвращает { msg: 'Row inserted successfully', id: noteId } где id - id новой записи в ЖП
            logger.logAction(username, 'CREATE', result.id, noteData); // Логирование созданной записи
            res.status(201).json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async updateProduct(req, res) {  //изменение записи по id
        const { id } = req.params;
        const productData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.updateProduct(id, productData);
            logger.logAction(username, 'UPDATE', id, productData);   // Логирование обновленной записи
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }
    static async updateZp(req, res) {  //изменение ЖП по id
        const { id } = req.params;
        const zpData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.updateZp(id, zpData);
            logger.logAction(username, 'UPDATE', id, zpData);  // Логирование обновленной записи
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async updateNoteZp(req, res) {  //Обновление существующей записи в ЖП
        const { noteId } = req.params; //id записи
        const noteData = req.body;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.updateNoteZp(noteId, noteData); //возвращает { msg: 'Row inserted successfully', id: noteId } где id - id обновленной записи в ЖП
            logger.logAction(username, 'UPDATE', noteId, noteData); // Логирование обновленной записи
            res.status(201).json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async deleteProduct(req, res) {  //удаление записи по id
        const { id } = req.params;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.deleteProduct(id);
            logger.logAction(username, 'DELETE', id, result.deletedRow); // Логирование удаленной записи
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async deleteZp(req, res) {  //удаление ЖП по id
        const { id } = req.params;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.deleteZp(id);
            logger.logAction(username, 'DELETE', id, result.deletedRow); // Логирование удаленной записи
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async deleteNoteZp(req, res) {  //удаление записи в ЖП по id
        const { noteId } = req.params;
        const username = req.headers['x-username']; //Извлечение имени пользователя из заголовка
        try {
            const result = await ProductModel.deleteNoteZp(noteId);
            logger.logAction(username, 'DELETE', noteId, result.deletedRow); // Логирование удаленной записи
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }
}