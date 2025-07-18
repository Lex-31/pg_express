import { FileModel } from '../fileModel.js';
import fs from 'fs';
import path from 'path';
import http from 'http';


describe('getFile', () => {
    it('Проверка преобразования пути к файлу из "fs3/Технический архив/test_file.txt" в "http://localhost:3000/data/folder1/test_file.txt"', async () => {
        const filePath = '\\\\fs3\\Технический архив\\test_file.txt';
        const host = '172.22.1.106';  //IP сервера
        const expectedUrl = `http://${host}/data/folder1/test_file.txt`;

        const newPath = '/data/folder1/test_file.txt';  //тестовый файл
        if (!fs.existsSync(newPath)) { //если файл не существует, то создаем его
            fs.writeFileSync(newPath, 'Test file content');
        }

        const fileUrl = await FileModel.getFile(filePath, host);  //преобразование пути
        expect(fileUrl).toBe(expectedUrl);

        fs.unlinkSync(newPath);  // Удаляем файл после теста
    });

    it('Проверка преобразования пути к несуществующему файлу из "fs3/Технический архив/non_existent_file.txt', async () => {
        const filePath = '\\\\fs3\\Технический архив\\non_existent_file.txt';
        const host = '172.22.1.106';  //IP сервера

        await expect(FileModel.getFile(filePath, host)).rejects.toThrow(`Файл не найден на ${host}`);  // заставляем FileModel.getFile выбросить ошибку и сравниваем текст ошибки
    });
});

describe('getDirectoryContent', () => {
    it('Проверка возврата правильного содержимого (тестовый файл и тестовая директория) директории fs3/Технический архив/test_dir/... (/data/folder1/test_dir/...)', async () => {
        const dirPath = '\\\\fs3\\Технический архив\\test_dir';
        const newPath = dirPath.replace(/\\\\fs3\\Технический архив\\/, '/data/folder1/').replace(/\\/g, '/');

        // Убедитесь, что директория существует
        if (!fs.existsSync(newPath)) {  //если директория не существует, то создаем ее
            fs.mkdirSync(newPath);  // создаем директорию /data/folder1/test_dir/
            fs.writeFileSync(path.join(newPath, 'test_file1.txt'), '');  // создаем в этой директории файл
            fs.mkdirSync(path.join(newPath, 'test_dir2'));  // создаем в этой директории директорию test_dir2
        }

        const directoryContent = await FileModel.getDirectoryContent(dirPath);  //получаем содержимое директории /data/folder1/test_dir/
        const expectedContent = [  // ожидаемое содержимое директории /data/folder1/test_dir/
            { name: 'test_file1.txt', isDirectory: false },
            { name: 'test_dir2', isDirectory: true }
        ];

        expect(directoryContent).toEqual(expect.arrayContaining(expectedContent)); //проверяем, что массив directoryContent содержит все элементы из expectedContent.
        //expect.arrayContaining(expectedContent) позволяет элементам массивов находится в разном порядке, позволяет массиву directoryContent содержать дополнительные элементы, которые не указаны в expectedContent

        // Удаляем директорию /data/folder1/test_dir/ с вложениями после теста
        fs.rmSync(newPath, { recursive: true, force: true });
    });

    it('Проверка выдачи ошибки (Directory not found), если директория не существует', async () => {
        const dirPath = '\\\\fs3\\Технический архив\\non_existent_dir';  //несуществуюбщая директория

        await expect(FileModel.getDirectoryContent(dirPath)).rejects.toThrow('Directory not found'); // заставляем FileModel.getDirectoryContent выбросить ошибку с текстом 'Directory not found'
    });
});
/*
describe('downloadExternalFile', () => {
    it('should download the file successfully', (done) => {
        const url = 'https://example.com/sample.pdf';
        const server = http.createServer((req, res) => {
            if (req.url === '/test-download') {
                FileModel.downloadExternalFile(url, res);
            }
        });

        server.listen(0, () => {
            const port = server.address().port;
            http.get(`http://localhost:${port}/test-download`, (response) => {
                expect(response.statusCode).toBe(200);
                server.close();
                done();
            });
        });
    });

    it('should handle download errors', (done) => {
        const url = 'https://example.com/non_existent_file.pdf';
        const server = http.createServer((req, res) => {
            if (req.url === '/test-download') {
                FileModel.downloadExternalFile(url, res);
            }
        });

        server.listen(0, () => {
            const port = server.address().port;
            http.get(`http://localhost:${port}/test-download`, (response) => {
                let data = '';
                response.on('data', chunk => {
                    data += chunk;
                });
                response.on('end', () => {
                    expect(data).toBe('Failed to download file');
                    server.close();
                    done();
                });
            });
        });
    });
});

*/