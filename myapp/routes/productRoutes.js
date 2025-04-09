import express from 'express';
import { ProductController } from '../controllers/productController.js';
const router = express.Router();

router.get('/api/main', ProductController.getAllProducts);  // маршрут для получения всех продуктов
router.get('/api/main/:id', ProductController.getProductById);  // маршрут для получения продукта по ID
router.post('/api/main', ProductController.createProduct);  // маршрут для создания нового продукта
router.put('/api/main/:id', ProductController.updateProduct);  // маршрут для обновления продукта по ID
router.delete('/api/main/:id', ProductController.deleteProduct);  // маршрут для удаления продукта по ID

export default router;