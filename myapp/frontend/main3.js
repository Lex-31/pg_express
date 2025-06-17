import { DataManager } from './dataManager.js';
//Для ЖП

function getZpIdFromPath() {
    // Получаем текущий путь URL
    const path = window.location.pathname;

    // Разделяем путь на части
    const pathParts = path.split('/');

    // Ищем и возвращаем ID, который должен быть последней частью пути
    const id = pathParts[pathParts.length - 1];

    console.log(`ID ЖП из URL: ${id}`);

    return id;
}

// Функция для обработки авторизации
async function handleAuth(event) {
    event.preventDefault();
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    // Здесь можно добавить логику проверки логина и пароля
    // Например, отправить запрос на сервер для проверки учетных данных
    const isAuthenticated = await checkCredentials(username, password);

    if (isAuthenticated) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username); // Сохраняем имя пользователя
        document.getElementById('auth-btn').textContent = 'Выход';
        document.getElementById('new-btn').style.display = 'block';
        document.getElementById('auth-form-container').style.display = 'none';
        loadNotesData(getZpIdFromPath());
    } else {
        alert('Неверные учетные данные');
    }
}

// Функция для обработки выхода
function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    document.getElementById('auth-btn').textContent = 'Авторизация';
    document.getElementById('new-btn').style.display = 'none';
    document.getElementById('auth-form-container').style.display = 'none';
    location.reload(); // Перезагружаем страницу для сброса состояния
}

// Функция для проверки учетных данных (заглушка)
async function checkCredentials(username, password) {
    // Здесь можно добавить реальную проверку учетных данных
    // Например, отправить запрос на сервер
    if (username === 'admin' && password === '123') {
        return true;
    } else {
        return false;
    }
}



document.getElementById('auth-btn').addEventListener('click', () => {
    const authButton = document.getElementById('auth-btn');
    if (authButton.textContent === 'Авторизация') {
        document.getElementById('auth-form-container').style.display = 'block';
    } else {
        handleLogout();
    }
});

document.getElementById('auth-form').addEventListener('submit', handleAuth);

async function loadNotesData(id) {  //загрузка всех записей из ЖП по id ЖП
    try {
        const notes = await DataManager.fetchNotesZp(id); // GET запрос на получение всех записей из ЖП == id
        console.log(`data notes: ${JSON.stringify(notes)}`);
        /*
data notes: {"id":18,"zp_name":"test","json_agg":[{"id":2,"note_zp_id":2,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки отсутвует","owner_note":"Иванов И.В.","owner_date":"2025-02-17","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм. 1ю cdr\" КД будет откорректирована установленном порядке","response_note":"Клементьев В.А.","response_date":"2025-02-20"}]}
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
                // tr.addEventListener('dblclick', () => openEditForm(item.id)); // двойной клик левой кнопкой мыши по второй строке заголовка таблицы tr - открытие формы редактирования ЖП
                console.log('Двойной клик на заголовке таблицы', notes.id, notes.zp_name);
                openEditZpForm(notes.id, notes.zp_name); //открытие формы редактирования ЖП
            }
            firstRow.addEventListener('dblclick', handleDoubleClick); // двойной клик левой кнопкой мыши по первой строке заголовка
            secondRow.addEventListener('dblclick', handleDoubleClick); // двойной клик левой кнопкой мыши по второй строке заголовка
        }

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; //очистка записей ЖП

        if (!notes || notes.length === 0) {  //если нет записей в этом ЖП, нет смысла отображать записи
            console.error('Нет данных для отображения');
            return;
        }
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

            //навешивание события двойного клика для редактирования строки записи в ЖП
            if (localStorage.getItem('username') === 'admin') { //security если пользователь - admin
                noteRow.addEventListener('dblclick', () => { // двойной клик левой кнопкой мыши
                    console.log('Клик по строке записи в ЖП', note.id); //note.id - id уникальный для записи в ЖП
                    openEditNoteZpForm(note); //открытие формы редактирования записи в ЖП
                });
            }
            tableBody.append(noteRow);
        });
    } catch (error) { console.error('Ошибка при загрузке данных:', error); }
}

function openEditZpForm(id, zp_name) { //открытие формы редактирования ЖП
    document.getElementById('new-id').value = id; //заполняем поля формы данными текущего ЖП
    document.getElementById('new-zp_name').value = zp_name;

    document.getElementById('zp-submit-btn').onclick = () => { updateZp(id); }; //навешиваем событие на кнопку "Обновить" - обновление данных ЖП
    document.getElementById('zp-delete-btn').onclick = () => { deleteZp(id); }; //навешиваем событие на кнопку "Удалить" - удаление ЖП
    document.getElementById('edit-zp-container').style.display = 'block';
    document.querySelector('.modal-backdrop').style.display = 'block';

    //Кнопка закрытие формы редактирования ЖП
    document.getElementById('zp-close-btn').addEventListener('click', () => {
        document.getElementById('edit-zp-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('edit-zp').reset();  //сброс полей формы
        // document.getElementById('zp-submit-btn').onclick = updateZp;
        // document.getElementById('zp-delete-btn').onclick = deleteZp;
    });
}

function openEditNoteZpForm(note) { //открытие формы редактирования записи в ЖП
    console.log(note);

    //заполняем поля формы данными текущей записи в ЖП
    document.getElementById('new-note_zp_id').value = note.note_zp_id; //№ п/п
    document.getElementById('new-name_note').value = note.name_note; //Наименование узла (детали), обозначение
    document.getElementById('new-note').value = note.note; //Содержание замечания (предложения)
    document.getElementById('new-owner_note').value = note.owner_note; //Фамилия, подпись автора (инициатора) изменения, дата
    document.getElementById('new-owner_date').value = note.owner_date; //дата автора
    document.getElementById('new-response').value = note.response; //Ответ на замечание (предложение)
    document.getElementById('new-response_note').value = note.response_note; //Фамилия, подпись автора(ов) принятого решения
    document.getElementById('new-response_date').value = note.response_date; //дата принятого решения

    document.getElementById('form-submit-btn').onclick = () => { updateNoteZp(note.id) }; //отправлет PUT запрос обновления записи в ЖП (по id записи)
    document.getElementById('form-delete-btn').onclick = () => { deleteNoteZp(note.id) }; //отправлет DELETE запрос удаления записи в ЖП (по id записи)
    document.getElementById('new-form-container').style.display = 'block';
    document.querySelector('.modal-backdrop').style.display = 'block';
    document.getElementById('form-submit-btn').textContent = 'Обновить';

    //закрытие формы обновления записи в ЖП
    document.getElementById('form-close-btn').addEventListener('click', () => { // вешаем событие на кнопку "Отмена"
        document.getElementById('new-form-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('new-form').reset();  //сброс полей формы
        document.getElementById('form-submit-btn').textContent = 'Создать';
    });
}

async function updateZp(id) { //обновление данных ЖП (id и zp_name) в таблице ЖП stalenergo_zp
    const username = localStorage.getItem('username') || 'anonymous'; // Извлечение имени пользователя
    const data = { //данные из формы для обновления ЖП
        id: document.getElementById('new-id').value,  //получаем новое значение id из формы
        zp_name: document.getElementById('new-zp_name').value //получаем новое значение zp_name из формы
    };
    const response = await DataManager.updateZp(id, data, username); // Отправляем PUT запрос на сервер для обновления записи (id -старый id, data - новые данные)
    console.log('response', response);
    document.getElementById('zp-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    loadNotesData(data.id); // Загружаем данные обновленного ЖП с новым id (если менялся id ЖП)
}

async function updateNoteZp(id) {  //обновление записи в ЖП по id записи
    const username = localStorage.getItem('username') || 'anonymous'; // Извлечение имени пользователя

    const data = { //забираем данные из формы для обновления записи в ЖП
        note_zp_id: document.getElementById('new-note_zp_id').value, //№ п/п
        name_note: document.getElementById('new-name_note').value, //Наименование узла (детали), обозначение
        note: document.getElementById('new-note').value, //Содержание замечания (предложения)
        owner_note: document.getElementById('new-owner_note').value, //Фамилия, подпись автора (инициатора) изменения, дата
        owner_date: document.getElementById('new-owner_date').value || null, //дата автора
        response: document.getElementById('new-response').value, //Ответ на замечание (предложение)
        response_note: document.getElementById('new-response_note').value, //Фамилия, подпись автора(ов) принятого решения
        response_date: document.getElementById('new-response_date').value || null //дата принятого решения
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

export async function createRow() { //Отправляет POST запрос на сервер для создания новой записи в ЖП
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
    // Проверка состояния авторизации при загрузке страницы
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        document.getElementById('auth-btn').textContent = 'Выход';
        document.getElementById('new-btn').style.display = 'block';
    }

    const zpId = getZpIdFromPath(); //получаем id текущего ЖП из URL
    if (zpId) {
        loadNotesData(zpId);  //загрузка всех записей из ЖП по id ЖП
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
    document.getElementById('new-btn').addEventListener('click', () => {
        document.getElementById('new-form-container').style.display = 'block';
        document.querySelector('.modal-backdrop').style.display = 'block';
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow; //отправлет POST запрос создания нового ЖП
    });

    //закрытие формы создания новой записи в ЖП
    document.getElementById('form-close-btn').addEventListener('click', () => {
        document.getElementById('new-form-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('new-form').reset();  //сброс полей формы
        document.getElementById('form-submit-btn').textContent = 'Создать';
    });

});