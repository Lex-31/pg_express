import fs from "fs";
import path from "path";

const testPath = path.join('\\\\fs3\\Архив НТЦ\\Изделия(несерийные) \\00 Временные\\!Аннулированные\\ЕИУС.656211.001 Панель УЭТС\\КД\\ЕИУС.656211.001 ВЭ Панель УЭТС.pdf');

// Проверка существования директории
fs.access(testPath, fs.constants.R_OK, (err) => {
    if (err) {
        console.error('❌ Ошибка доступа:', err.message);
        return;
    }
    console.log('✅ Доступ есть!');

    // Попытка чтения содержимого
    fs.readdir(testPath, (err, files) => {
        if (err) {
            console.error('❌ Ошибка чтения директории:', err.message);
            return;
        }
        console.log('📂 Содержимое папки:', files.slice(0, 5));
    });
});