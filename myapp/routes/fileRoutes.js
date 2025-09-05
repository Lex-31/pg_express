import express from 'express';
import { FileController } from '../controllers/fileController.js';
import { authenticateToken } from './authMiddleware.js'; // Импорт мидлвэра

const router = express.Router();

// Все роуты в этом файле теперь требуют аутентификации
router.post('/api/get-file', authenticateToken, FileController.getFile);
router.post('/api/get-dir', authenticateToken, FileController.getDirectoryContent);
router.post('/api/download-external', authenticateToken, FileController.downloadExternalFile);

export default router;