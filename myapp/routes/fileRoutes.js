import express from 'express';
import { FileController } from '../controllers/fileController.js';
const router = express.Router();

router.post('/api/get-file', FileController.getFile);
router.post('/api/get-dir', FileController.getDirectoryContent);
router.post('/api/download-external', FileController.downloadExternalFile);

export default router;