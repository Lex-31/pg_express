import { FileModel } from '../models/fileModel.js';

/**
 * Класс для обработки запросов, связанных с файлами.
 * @method getFile - Получение файла по локальному пути.
 * @method getDirectoryContent - Получение содержимого директории.
 * @method downloadExternalFile - Загрузка файла по внешней ссылке.
 */
export class FileController {
    static async getFile(req, res) {  // получение файла по пути path === \\fs3\Технический архив\ЕИУС.468622.001_ППСЦ\ЭД\1.00.00_ППСЦ_ЭД_001.pdf
        const { path } = req.body;
        const host = req.headers.host; // Получаем host из запроса
        try {
            const fileUrl = await FileModel.getFile(path, host);  // замена пути \\fs3... на путь /data/folder1/...
            res.json({ url: fileUrl });
        } catch (error) {
            console.error('Error processing the request:', error);
            res.status(404).send('File not found');
        }
    }

    static async getDirectoryContent(req, res) {
        const { path } = req.body; // directoryUrl === \\fs3\Технический архив\ЕИУС.468622.001_ППСЦ\ЭД
        try {
            const filesData = await FileModel.getDirectoryContent(path);
            res.json(filesData);
        } catch (error) {
            console.error('Error processing the request:', error);
            res.status(404).send('Directory not found');
        }
    }

    static async downloadExternalFile(req, res) {
        const { url } = req.body;
        try {
            await FileModel.downloadExternalFile(url, res);  // устанавливает заголовок для скачивания файла и передает ответ в качестве потока данных
        } catch (error) {
            console.error('Error processing the request:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}