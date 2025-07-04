import { DataManager } from './dataManager.js';
import {
    handleAuth,
    initAuthStatus,
    addAuthEventListeners
} from './shared/auth.js';
//Для записей ЖП

//получаем id текущего ЖП из URL
function getZpIdFromPath() {
    // Получаем текущий путь URL
    const path = window.location.pathname;
    // Разделяем путь на части
    const pathParts = path.split('/');
    // Ищем и возвращаем ID, который должен быть последней частью пути
    const id = pathParts[pathParts.length - 1];
    return id;
}

async function loadNotesData(id) {  //загрузка всех записей из ЖП по id ЖП
    try {
        const notes = await DataManager.fetchNotesZp(id); // GET запрос на получение всех записей из ЖП == id
        console.log(`data notes: ${JSON.stringify(notes)}`);
        /*
data notes: {"id":18,"zp_name":"ЗФ 220", "json_agg":[{"id":1,"note_zp_id":1,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки не соответсвует графике чертежа","owner_note":"Сердюк Л.В.","owner_date":"2015-08-20","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм. 1ю cdr\" КД будет откорректирована установленном порядке","response_note":"Сердюк Л.В.","response_date":"2015-08-26","archive":true}]}
        */
        document.title = `Журнал предложений № ${notes.id || 'Неизвестный ID'} - ${notes.zp_name || 'Неизвестное название'}`; //установка заголовка страницы

        const zpIdHeader = notes.id || 'Неизвестный №'; //установка данных о ЖП из БД
        const zpNameHeader = notes.zp_name || 'Неизвестное название';

        document.getElementById('zp_id').textContent = zpIdHeader; //вывод данных о ЖП на страницу ЖП с записями
        document.getElementById('zp_name').textContent = zpNameHeader;

        //Навешивание события двойного клика для редактирования ЖП
        if (localStorage.getItem('username') === 'admin') {  //security если пользователь - admin
            const firstRow = document.querySelector('.table thead tr:first-child'); //получаем первую строку заголовка
            const secondRow = document.querySelector('.table thead tr:nth-child(2)'); //получаем вторую строку заголовка

            function handleDoubleClick() { // Функция, которая будет выполняться при двойном клике
                console.log('Двойной клик на заголовке таблицы', notes.id, notes.zp_name);
                openEditZpForm(notes); //открытие формы редактирования ЖП
            }
            firstRow.addEventListener('dblclick', handleDoubleClick); // двойной клик левой кнопкой мыши по первой строке заголовка
            secondRow.addEventListener('dblclick', handleDoubleClick); // двойной клик левой кнопкой мыши по второй строке заголовка
        }

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; //очистка записей ЖП

        if (!notes || !notes.json_agg) {  //если нет записей в этом ЖП, нет смысла отображать записи
            console.error('Нет данных для отображения');
            // return;
        } else {
            //если существуют записи в этом ЖП отображаем их и навешиваем события
            notes.json_agg.forEach(note => { //походимся по всем записям в ЖП
                const noteRow = document.createElement('tr');
                noteRow.setAttribute('data-id', note.id || ''); // (непонятно для чего это нужно в этос случае) устанвавливаем атрибут data-id как уникальный id записи из таблицы stalenergo_notes_zp
                noteRow.innerHTML = `
                <td>${note.note_zp_id || ''}</td>
                <td>${note.name_note || ''}</td>
                <td>${note.note || ''}</td>
                <td>${note.owner_note || ''}<br>${note.owner_date || ''}</td>
                <td>${note.response || ''}</td>
                <td>${note.response_note || ''}<br>${note.response_date || ''}</td>
            `;

                // если note.archive - true(запись архивирована), то добавляем класс highlight-archive для подсветки строки
                if (note.archive) {
                    noteRow.classList.add('highlight-archive');
                } else {
                    noteRow.classList.add('highlight-not-archive');
                }

                //подсветка строки записи в ЖП, если есть II_CD Изменение в КД (погашена)
                if (note.ii_cd != '') {
                    noteRow.classList.add('highlight-ii-cd');
                }

                //навешивание события двойного клика для редактирования строки записи в ЖП
                if (localStorage.getItem('username') === 'admin' && note.archive === false) { //security если пользователь - admin и запись не архивная
                    noteRow.addEventListener('dblclick', (e) => { // двойной клик левой кнопкой мыши
                        console.log('Клик по строке записи в ЖП', note.id); //note.id - id уникальный для записи в ЖП
                        const target = e.target; //получаем элемент, на котором был клик
                        if (target.tagName === 'TD') { // если клик был по ячейке
                            const row = target.parentElement; //получаем родителя ячейки - строку
                            const cells = Array.from(row.cells); //получаем все ячейки строки в массиве
                            const cellIndex = cells.indexOf(target); //получаем индекс ячейки, на которой был клик

                            // Определяем группу и открываем форму с нужными полями
                            if (cellIndex < 4) {
                                openEditNoteZpForm(note, 'group1'); //открытие формы редактирования записи в ЖП для владельца
                            } else {
                                openEditNoteZpForm(note, 'group2'); //открытие формы редактирования записи в ЖП для отвечающего
                            }
                        }
                    });
                }
                tableBody.append(noteRow);
            });
        }

        //состояние фильтров
        // const checkArchive = document.getElementById('check_archive');  // Получаем чекбоксы
        const checkIiCd = document.getElementById('check_ii_cd');

        // checkArchive.checked = localStorage.getItem('check_archive') === 'false' ? false : true;  // Восстанавливаем состояние чекбоксов из localStorage. По умолчанию true
        checkIiCd.checked = localStorage.getItem('check_ii_cd') === 'false' ? false : true;

        function updateVisibility() { // Функция для обновления видимости строк таблицы
            // const archiveRows = document.querySelectorAll('.highlight-archive');
            const iiCdRows = document.querySelectorAll('.highlight-ii-cd');
            // archiveRows.forEach(row => {
            //     row.style.display = checkArchive.checked ? 'table-row' : 'none'; //если есть галочка - отображаем, иначе none
            // });
            iiCdRows.forEach(row => { //обновляем строки таблицы
                row.style.display = checkIiCd.checked ? 'table-row' : 'none'; //если есть галочка - отображаем, иначе none
            });
        }

        // checkArchive.addEventListener('change', function () { // Добавляем обработчики событий для сохранения состояния чекбоксов
        //     localStorage.setItem('check_archive', this.checked);
        //     updateVisibility();
        // });
        checkIiCd.addEventListener('change', function () {
            localStorage.setItem('check_ii_cd', this.checked);
            updateVisibility();
        });

        updateVisibility(); // Вызываем функцию обновления видимости строк при загрузке страницы

    } catch (error) { console.error('Ошибка при загрузке данных:', error); }
}

function openEditZpForm(notes) { //открытие формы редактирования ЖП
    document.getElementById('new-id').value = notes.id; //заполняем поля формы данными текущего ЖП
    document.getElementById('new-zp_name').value = notes.zp_name;
    // document.getElementById('zp-archive').checked = notes.archive;

    document.getElementById('zp-submit-btn').onclick = () => { updateZp(notes.id); }; //навешиваем событие на кнопку "Обновить" - обновление данных ЖП

    console.log('notes.json_agg', notes.json_agg);

    if (notes.json_agg != null) { //если есть записи в ЖП, то убираем кнопку "Удалить" сам ЖП
        document.getElementById('zp-delete-btn').style.display = 'none';
    } else { //если ЖП пуст то показываем кнопку "Удалить" ЖП
        document.getElementById('zp-delete-btn').style.display = 'block';
    }

    document.getElementById('zp-delete-btn').onclick = () => { deleteZp(notes.id); }; //навешиваем событие на кнопку "Удалить" - удаление ЖП
    document.getElementById('edit-zp-container').style.display = 'block';
    document.querySelector('.modal-backdrop').style.display = 'block';

    //Кнопка закрытие формы редактирования ЖП
    document.getElementById('zp-close-btn').addEventListener('click', () => {
        document.getElementById('edit-zp-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('edit-zp').reset();  //сброс полей формы
    });
}

function openEditNoteZpForm(note, group) { //открытие формы редактирования записи в ЖП
    //открываем форму
    document.getElementById('new-form-container').style.display = 'block';
    document.querySelector('.modal-backdrop').style.display = 'block';
    document.getElementById('form-submit-btn').textContent = 'Обновить';
    document.getElementById('form-submit-btn').onclick = () => { updateNoteZp(note.id) }; //отправлет PUT запрос обновления записи в ЖП (по id записи)
    document.getElementById('form-delete-btn').onclick = () => { deleteNoteZp(note.id) }; //отправлет DELETE запрос удаления записи в ЖП (по id записи)

    //заполняем поля формы данными текущей записи в ЖП
    //группа 1
    document.getElementById('new-note_zp_id').value = note.note_zp_id; //№ п/п
    document.getElementById('new-name_note').value = note.name_note; //Наименование узла (детали), обозначение
    document.getElementById('new-note').value = note.note; //Содержание замечания (предложения)
    document.getElementById('new-owner_note').value = note.owner_note; //Фамилия, подпись автора (инициатора) изменения, дата
    document.getElementById('new-owner_date').value = note.owner_date; //дата автора
    //группа 2
    document.getElementById('new-response').value = note.response; //Ответ на замечание (предложение)
    document.getElementById('new-response_note').value = note.response_note; //Фамилия, подпись автора(ов) принятого решения
    document.getElementById('new-response_date').value = note.response_date; //дата принятого решения

    document.getElementById('new-ii_cd').value = note.ii_cd;

    if (group === 'group1') { //если редактируем первые 4 столбца
        document.getElementById('new-response').parentElement.style.display = 'none';
        document.getElementById('new-response_note').parentElement.style.display = 'none';
        document.getElementById('new-response_date').parentElement.style.display = 'none';
        document.getElementById('new-archive').parentElement.style.display = 'none';
    } else if (group === 'group2') { //если редактируем последние 2 столбца
        document.getElementById('new-note_zp_id').parentElement.style.display = 'none';
        document.getElementById('new-name_note').parentElement.style.display = 'none';
        document.getElementById('new-note').parentElement.style.display = 'none';
        document.getElementById('new-owner_note').parentElement.style.display = 'none';
        document.getElementById('new-owner_date').parentElement.style.display = 'none';
        document.getElementById('form-delete-btn').style.display = 'none';
    }

    //закрытие формы обновления записи в ЖП
    document.getElementById('form-close-btn').addEventListener('click', () => { // вешаем событие на кнопку "Отмена"
        document.getElementById('new-form-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('new-form').reset();  //сброс полей формы
        document.getElementById('form-submit-btn').textContent = 'Создать';
        //сбрасываем видимость полей формы
        document.getElementById('new-note_zp_id').parentElement.style.display = 'flex';
        document.getElementById('new-response').parentElement.style.display = 'flex';
        document.getElementById('new-response_note').parentElement.style.display = 'flex';
        document.getElementById('new-response_date').parentElement.style.display = 'flex';
        document.getElementById('new-name_note').parentElement.style.display = 'flex';
        document.getElementById('new-note').parentElement.style.display = 'flex';
        document.getElementById('new-owner_note').parentElement.style.display = 'flex';
        document.getElementById('new-owner_date').parentElement.style.display = 'flex';
        document.getElementById('new-archive').parentElement.style.display = 'block';
        document.getElementById('form-delete-btn').style.display = 'block';
    });
}

async function updateZp(id) { //обновление данных ЖП (id и zp_name) в таблице ЖП stalenergo_zp
    const username = localStorage.getItem('username') || 'anonymous'; // Извлечение имени пользователя

    // const statusArchive = document.getElementById('zp-archive').checked //проверка состояния галочки "архивировать"

    const data = { //данные из формы для обновления ЖП
        id: document.getElementById('new-id').value,  //получаем новое значение id из формы
        zp_name: document.getElementById('new-zp_name').value //получаем новое значение zp_name из формы
        // archive: statusArchive //архивация ЖП
    };
    const response = await DataManager.updateZp(id, data, username); // Отправляем PUT запрос на сервер для обновления записи (id -старый id, data - новые данные)
    document.getElementById('zp-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    loadNotesData(data.id); // Загружаем данные обновленного ЖП с новым id (если менялся id ЖП)
}

async function updateNoteZp(id) {  //обновление записи в ЖП по id записи
    const username = localStorage.getItem('username') || 'anonymous'; // Извлечение имени пользователя

    let statusArchive = document.getElementById('new-archive').checked; //проверка состояния галочки "архивировать"
    const docIiCd = document.getElementById('new-ii_cd').value; //номер извещения об изменении КД
    if (docIiCd != '') { //если номер извещения об изменении КД не пустой, то запись Утвержденная
        statusArchive = true;
    }

    const data = { //забираем данные из формы для обновления записи в ЖП
        note_zp_id: document.getElementById('new-note_zp_id').value, //№ п/п
        name_note: document.getElementById('new-name_note').value, //Наименование узла (детали), обозначение
        note: document.getElementById('new-note').value, //Содержание замечания (предложения)
        owner_note: document.getElementById('new-owner_note').value, //Фамилия, подпись автора (инициатора) изменения, дата
        owner_date: document.getElementById('new-owner_date').value || null, //дата автора
        response: document.getElementById('new-response').value, //Ответ на замечание (предложение)
        response_note: document.getElementById('new-response_note').value, //Фамилия, подпись автора(ов) принятого решения
        response_date: document.getElementById('new-response_date').value || null, //дата принятого решения
        archive: statusArchive, //архивация записи
        ii_cd: docIiCd //номер извещения об изменении КД
    };

    const response = await DataManager.updateNoteZp(id, data, username); // Отправляем PUT запрос на сервер для обновления записи (id - идентификатор записи в таблице stalenergo_notes_zp)
    console.log('response', response);
    document.getElementById('form-close-btn').click();
    loadNotesData(getZpIdFromPath());
}

async function deleteZp(id) { //удаление ЖП по id
    const username = localStorage.getItem('username') || 'anonymous';
    try {
        await DataManager.deleteZp(id, username); //пердаем id удаляемого ЖП
        window.open('/app/zp', '_self');   // Перенаправляем пользователя на страницу со списком всех ЖП
    } catch (error) {
        console.error('Ошибка при удалении ЖП:', error);
        alert('Произошла ошибка при удалении ЖП. Пожалуйста, попробуйте снова.');
    }
}

async function deleteNoteZp(noteId) { //удаление позиции по id записи
    const username = localStorage.getItem('username') || 'anonymous';
    try {
        await DataManager.deleteNoteZp(noteId, username); //передаем id удаляемой записи
    } catch (error) {
        console.error('Ошибка при удалении записи в ЖП:', error);
        alert('Произошла ошибка при удалении записи в ЖП. Пожалуйста, попробуйте снова.');
    }
    document.getElementById('form-close-btn').click(); //програмно закрываем форму
    loadNotesData(getZpIdFromPath()); //загружаем данные обновленного ЖП
}

async function createRow() { //Отправляет POST запрос на сервер для создания новой записи в ЖП
    const zpId = getZpIdFromPath(); //получаем id текущего ЖП

    const data = { //данные из формы для создания записи в ЖП
        note_zp_id: document.getElementById('new-note_zp_id').value,
        zp_id: zpId,
        name_note: document.getElementById('new-name_note').value,
        note: document.getElementById('new-note').value,
        owner_note: document.getElementById('new-owner_note').value,
        // owner_date: new Date().toISOString().split('T')[0], //для автозаполнения
        owner_date: document.getElementById('new-owner_date').value || null,
        response: document.getElementById('new-response').value,
        response_note: document.getElementById('new-response_note').value,
        // response_date: new Date().toISOString().split('T')[0], //для автозаполнения
        response_date: document.getElementById('new-response_date').value || null
    };

    const username = localStorage.getItem('username') || 'anonymous';
    await DataManager.createNoteZp(zpId, data, username);  //отправляем POST запрос на создание записи в ЖП
    document.getElementById('form-close-btn').click();  //имитируем нажатие кнопки закрытия формы
    loadNotesData(zpId);
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthStatus();
    addAuthEventListeners(); // Добавляем обработчики событий из shared/auth.js

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) { document.getElementById('new-btn').style.display = 'block'; }

    document.getElementById('auth-form').addEventListener('submit', handleAuth);

    const zpId = getZpIdFromPath(); //получаем id текущего ЖП из URL
    if (zpId) {
        loadNotesData(zpId);  //загрузка всех записей из ЖП по id ЖП при загрузке страницы
    } else {
        console.error('ID журнала предложений не найден в URL');
    }

    // Навешивание событий на ячейки таблицы при наведении
    const tableBody = document.getElementById('table-body'); //берем контейнер строк таблицы
    if (tableBody) {
        tableBody.addEventListener('mouseover', (e) => { // Обработчик для наведения на ячейку
            const target = e.target; // Получаем элемент, на котором произошло наведение
            if (target.tagName === 'TD') { //если элемент - ячейка таблицы <td>
                const row = target.parentElement; //берем родительский элемент - строка таблицы <tr>
                const cells = Array.from(row.cells); //получаем массив из ячеек текущей строки 6шт
                const cellIndex = cells.indexOf(target); //определяем индекс ячейки из массива

                // Сбрасываем предыдущие выделения ячеек на текущей строке
                cells.forEach(cell => {
                    cell.classList.remove('highlight-group1', 'highlight-group2');
                });

                // Определяем группу и выделяем
                if (cellIndex < 4) { //если индекс ячейки на которую навели от 0 до 3 - 1группа для автора записи в ЖП
                    for (let i = 0; i < 4; i++) { // Первым 4 колонкам устанавливаем класс выделения
                        cells[i].classList.add('highlight-group1');
                    }
                } else { // иначе нужно выделить последние 2 колонки
                    for (let i = 4; i < 6; i++) {
                        cells[i].classList.add('highlight-group2');
                    }
                }
            }
        });

        tableBody.addEventListener('mouseout', (e) => { // Обработчик для снятия выделения при покидании ячейки
            const target = e.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement; //строка таблицы на которой навели <tr>
                const cells = Array.from(row.cells); //массив ячеек этой строки

                // Проверяем, не перешёл ли курсор на другую ячейку в той же строке
                const related = e.relatedTarget; //ячейка на которую перешел курсор после покидания ячейки target
                if (!related || !row.contains(related)) { //если related несуществует или это не ячейка в той же строке 
                    // Снимаем выделение только если курсор вышел за пределы строки
                    cells.forEach(cell => {
                        cell.classList.remove('highlight-group1', 'highlight-group2');
                    });
                }
            }
        });
    }

    // Навешивание событий на элементы управления (конпку создания новой записи и закрытия формы создания) 
    //открывает форму при создании новой записи в ЖП
    document.getElementById('new-btn').addEventListener('click', async () => {
        const zpId = document.getElementById('zp_id').textContent; //получаем id текущего ЖП
        const notes = await DataManager.fetchNotesZp(zpId); // GET запрос на получение всех записей из ЖП == zpId
        let currentNote;  //номер текущей записи в ЖП
        if (notes.json_agg) { //если записи есть
            const lastNote = notes.json_agg[notes.json_agg.length - 1]; // Получаем последний элемент массива записей в рамках 1 ЖП
            currentNote = lastNote.note_zp_id + 1;  //увеличиваем номер п/п
        }

        document.getElementById('new-note_zp_id').value = currentNote || 1; //номер текущей записи, а если записей нет то будет первая

        document.getElementById('new-form-container').style.display = 'block';
        document.querySelector('.modal-backdrop').style.display = 'block';
        document.getElementById('form-submit-btn').textContent = 'Создать';

        //скрываем некоторые поля
        document.getElementById('new-response').parentElement.style.display = 'none';
        document.getElementById('new-response_note').parentElement.style.display = 'none';
        document.getElementById('new-response_date').parentElement.style.display = 'none';
        document.getElementById('new-archive').parentElement.style.display = 'none';
        document.getElementById('form-delete-btn').style.display = 'none';

        document.getElementById('form-submit-btn').onclick = createRow; //отправлет POST запрос создания нового ЖП
    });




    //закрытие формы создания новой записи в ЖП
    document.getElementById('form-close-btn').addEventListener('click', () => {
        document.getElementById('new-form-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('new-form').reset();  //сброс полей формы
        document.getElementById('form-submit-btn').textContent = 'Создать';
        //восстанавливаем скрытые поля
        document.getElementById('new-response').parentElement.style.display = 'flex';
        document.getElementById('new-response_note').parentElement.style.display = 'flex';
        document.getElementById('new-response_date').parentElement.style.display = 'flex';
        document.getElementById('new-archive').parentElement.style.display = 'block';
        document.getElementById('form-delete-btn').style.display = 'block';
    });

    //кнопка возврата назад в список ЖП
    document.getElementById('back-btn').addEventListener('click', () => {
        window.open('/app/zp', '_self');   // Перенаправляем пользователя на страницу со списком всех ЖП
    })
});