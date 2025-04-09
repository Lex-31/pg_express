import { ProductModel } from '../models/productModel.js';

/** Класс для обработки запросов, связанных с продуктами.
 * @method getAllProducts - Получение всех продуктов.
 * @method getProductById - Получение продукта по ID.
 * @method createProduct - Создание нового продукта.
 * @method updateProduct - Обновление существующего продукта.
 * @method deleteProduct - Удаление продукта. */
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

    static async createProduct(req, res) {  //добавление новой записи
        const productData = req.body;
        try {
            const result = await ProductModel.createProduct(productData);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async updateProduct(req, res) {  //изменение записи по id
        const { id } = req.params;
        const productData = req.body;
        try {
            const result = await ProductModel.updateProduct(id, productData);
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    static async deleteProduct(req, res) {  //удаление записи по id
        const { id } = req.params;
        try {
            const result = await ProductModel.deleteProduct(id);
            res.json(result);
        } catch (error) {
            console.error('Error executing query', error.stack);
            res.status(500).send('Internal Server Error');
        }
    }
}