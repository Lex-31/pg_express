import express from 'express';
import { CategoryController } from '../controllers/categoryController.js';
const router = express.Router();

router.get('/api/categories', CategoryController.getAllCategories);  // маршрут для получения всех категорий

export default router;