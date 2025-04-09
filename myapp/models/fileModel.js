import fs from 'fs';
import https from 'https';
import path from 'path';

/**
 * Класс для работы с файлами и директориями
 * @method getFile - метод для получения файла
 * @method getDirectoryContent - метод для получения содержимого директории
 * @method downloadExternalFile - метод для скачивания внешнего файла
 */
export class FileModel {
    static async getFile(filePath, host) {  // метод для получения файла
        const newPath = filePath.replace(/\\\\fs3\\Технический архив\\/, '/data/folder1/').replace(/\\/g, '/'); // Замена пути
        if (fs.existsSync(newPath)) { // Проверка существования файла - вариант статического файла
            const fileUrl = `http://${host}${newPath}`; // создание пути к статическому файлу
            return fileUrl; // Возвращаем URL для доступа к статическому файлу

        } else {
            throw new Error('File not found');
        }
    }

    static async getDirectoryContent(dirPath) {  // метод для получения содержимого директории
        const newPath = dirPath.replace(/\\\\fs3\\Технический архив\\/, '/data/folder1/').replace(/\\/g, '/');
        if (fs.existsSync(newPath) && fs.lstatSync(newPath).isDirectory()) { //проверяет что по адресу существует чтото и что это директория
            const files = fs.readdirSync(newPath); //содержимое директории названия файлов/директорий возвращает в массив
            const filesData = files.map(file => ({
                name: file,                 //название файла/директории
                isDirectory: fs.lstatSync(path.join(newPath, file)).isDirectory()  //файл - false, директория - true
            }));
            return filesData;

        } else {
            throw new Error('Directory not found');
        }
    }

    static async downloadExternalFile(url, res) {  // метод для загрузки файлов по внешним ссылкам
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileName = url.split('/').pop();
                res.header('Content-Disposition', `attachment; filename=${fileName}`);  // устанавливаем заголовок для скачивания файла
                response.pipe(res);  // передаем поток данных (файл) в ответ на текущий запрос
            } else {
                res.status(response.statusCode).send('Failed to download file');
            }
        }).on('error', (error) => {
            console.error('Error downloading external file:', error);
            res.status(500).send('Internal Server Error');
        });
    }
}