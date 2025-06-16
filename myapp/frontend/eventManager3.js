import { DataManager } from './dataManager.js';
import { createRow } from './main3.js';
//Для ЖП

/** Класс для управления событиями
 * @method addEventListeners - добавляет обработчики событий для элементов управления */
export class EventManager {
    static addEventListeners() {

        //открывает форму при создании новой записи в ЖП
        document.getElementById('new-btn').addEventListener('click', () => {
            document.getElementById('new-form-container').style.display = 'block';
            document.querySelector('.modal-backdrop').style.display = 'block';
            document.getElementById('form-submit-btn').textContent = 'Создать';
            document.getElementById('form-submit-btn').onclick = createRow; //отправлет POST запрос создания нового ЖП
            // document.getElementById('form-delete-btn').onclick = null;
            // document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
        });

        //закрытие формы создания новой записи в ЖП
        document.getElementById('form-close-btn').addEventListener('click', () => {
            document.getElementById('new-form-container').style.display = 'none';
            document.querySelector('.modal-backdrop').style.display = 'none';
            document.getElementById('new-form').reset();  //сброс полей формы
            document.getElementById('form-submit-btn').textContent = 'Создать';
            // document.getElementById('form-submit-btn').onclick = createRow;
            // document.getElementById('form-delete-btn').onclick = null;
        });
    }
}