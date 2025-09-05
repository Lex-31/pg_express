import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken } from './authMiddleware.js'; // Import the middleware
const router = express.Router();

// GET routes (can remain public)
router.get('/api/main', ProductController.getAllProducts);  // маршрут для получения всех продуктов
router.get('/api/main/:id', ProductController.getProductById);  // маршрут для получения продукта по ID
router.get('/api/zp', ProductController.getAllZp);  // маршрут для получения всех ЖП
router.get('/api/zp/:id', ProductController.getNotesZp);  // маршрут для полученияd всех записей из одного ЖП по ID ЖП
router.get('/api/zpCount', ProductController.getCountNotesInZp);  // маршрут для получения кол-ва записей в ЖП

// POST routes (protected)
router.post('/api/main', authenticateToken, ProductController.createProduct);  // маршрут для создания нового продукта
router.post('/api/zp', authenticateToken, ProductController.createZp);  // маршрут для создания нового ЖП
router.post('/api/zp/:id', authenticateToken, ProductController.createNoteZp);  // маршрут для создания новой записи в ЖП

// PUT routes (protected)
router.put('/api/main/:id', authenticateToken, ProductController.updateProduct);  // маршрут для обновления продукта по ID
router.put('/api/zp/:id', authenticateToken, ProductController.updateZp);  // маршрут для обновления ЖП по ID ЖП
router.put('/api/noteZp/:noteId', authenticateToken, ProductController.updateNoteZp);  // маршрут для обновления записи в ЖП по ID записи

// DELETE routes (protected)
router.delete('/api/main/:id', authenticateToken, ProductController.deleteProduct);  // маршрут для удаления продукта по ID
router.delete('/api/zp/:id', authenticateToken, ProductController.deleteZp);  // маршрут для удаления ЖП по ID ЖП
router.delete('/api/noteZp/:noteId', authenticateToken, ProductController.deleteNoteZp);  // маршрут для удаления записи в ЖП по ID записи

export default router;