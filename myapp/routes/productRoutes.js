import express from 'express';
import { ProductController } from '../controllers/productController.js';
const router = express.Router();

router.get('/api/main', ProductController.getAllProducts);  // маршрут для получения всех продуктов
router.get('/api/main/:id', ProductController.getProductById);  // маршрут для получения продукта по ID
router.get('/api/zp', ProductController.getAllZp);  // маршрут для получения всех ЖП
router.get('/api/zp/:id', ProductController.getNotesZp);  // маршрут для полученияd всех записей из одного ЖП по ID ЖП
router.get('/api/zpCount', ProductController.getCountNotesInZp);  // маршрут для получения кол-ва записей в ЖП
router.post('/api/main', ProductController.createProduct);  // маршрут для создания нового продукта
router.post('/api/zp', ProductController.createZp);  // маршрут для создания нового ЖП
router.post('/api/zp/:id', ProductController.createNoteZp);  // маршрут для создания новой записи в ЖП
router.put('/api/main/:id', ProductController.updateProduct);  // маршрут для обновления продукта по ID
router.put('/api/zp/:id', ProductController.updateZp);  // маршрут для обновления ЖП по ID ЖП
router.put('/api/noteZp/:noteId', ProductController.updateNoteZp);  // маршрут для обновления записи в ЖП по ID записи
router.delete('/api/main/:id', ProductController.deleteProduct);  // маршрут для удаления продукта по ID
router.delete('/api/zp/:id', ProductController.deleteZp);  // маршрут для удаления ЖП по ID ЖП
router.delete('/api/noteZp/:noteId', ProductController.deleteNoteZp);  // маршрут для удаления записи в ЖП по ID записи

export default router;