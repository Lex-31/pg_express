import { DataManager } from './dataManager.js';
import { createRow } from './main.js';


/** Класс для управления событиями
 * @method addEventListeners - добавляет обработчики событий для элементов управления */
export class EventManager {
    static addEventListeners() {

        //открывает форму при создании новой записи
        // document.getElementById('new-btn').addEventListener('click', async () => {
        //     const categories = await DataManager.fetchCategories();  // Загрузка всех категорий
        //     const select = document.getElementById('new-category_id');
        //     select.innerHTML = '';
        //     categories.forEach(category => {
        //         const option = document.createElement('option');  //внутри выпадающего списка select создаем элементы списка option
        //         option.value = category.category_id;
        //         option.textContent = `${category.category_id.join('.')} ${category.category_name}`;
        //         select.append(option);  // в HTML элемент select вставляем весь список категорий option
        //     });
        //     document.getElementById('new-form-container').style.display = 'block';
        //     document.querySelector('.modal-backdrop').style.display = 'block';
        //     document.getElementById('form-submit-btn').textContent = 'Создать';
        //     document.getElementById('form-submit-btn').onclick = createRow;
        //     document.getElementById('form-delete-btn').style.display = 'none'; // Скрыть кнопку удаления при создании
        //     document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
        //     document.getElementById('doc-container').innerHTML = ''; //*** возможно ненужно, чтоб можно было копировать записи
        // });

        // Обработчик для кнопки "ОКПД, ОКВЭД / Документация"
        // document.getElementById('toggle-doc-btn').addEventListener('click', () => {
        //     const toggleBtn = document.getElementById('toggle-doc-btn');
        //     const okpdOkvedCols = document.querySelectorAll('.okpd-okved-col');
        //     const docCols = document.querySelectorAll('.doc-col');

        //     if (toggleBtn.textContent === 'Документация') {
        //         toggleBtn.textContent = 'ОКПД, ОКВЭД';
        //         okpdOkvedCols.forEach(col => col.style.display = 'none');
        //         docCols.forEach(col => col.style.display = '');
        //         localStorage.setItem('docToggleState', 'docs'); // Сохраняем состояние
        //     } else {
        //         toggleBtn.textContent = 'Документация';
        //         okpdOkvedCols.forEach(col => col.style.display = '');
        //         docCols.forEach(col => col.style.display = 'none');
        //         localStorage.setItem('docToggleState', 'codes'); // Сохраняем состояние
        //     }
        // });

        //закрытие формы
        // document.getElementById('form-close-btn').addEventListener('click', () => {
        //     document.getElementById('new-form-container').style.display = 'none';
        //     document.querySelector('.modal-backdrop').style.display = 'none';
        //     document.getElementById('new-form').reset();
        //     document.getElementById('form-submit-btn').textContent = 'Создать';
        //     document.getElementById('form-submit-btn').onclick = createRow;
        //     document.getElementById('form-delete-btn').onclick = null;
        //     document.getElementById('doc-container').innerHTML = '';
        // });

    }
}