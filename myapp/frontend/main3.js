import { DataManager } from './dataManager.js';
import {
    openModal,
    closeModal,
    addCloseEventListeners
} from "./shared/modalUtils.js";
//Для записей ЖП

/** Парсит JWT токен из localStorage и возвращает массив прав пользователя.
 * @returns {string[]} Массив прав (permissions) или пустой массив, если токен не найден или некорректен */
function getUserPermissions() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return [];
    try {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        console.log(payload);

        return payload.permissions || [];
    } catch (error) {
        console.error('Ошибка при парсинге JWT токена:', error);
        return [];
    }
}

/** Функция для обновления UI в зависимости от статуса авторизации
 * @description функция будет отвечать исключительно за скрытие/отображение формы логина, информации о пользователе и кнопки "Добавить новое" на основе наличия JWT токена в localStorage */
function updateAuthUI() {
    const jwtToken = localStorage.getItem('jwtToken');
    const permissions = getUserPermissions(); // Получаем массив прав
    const loginFormContainer = document.getElementById('react-login-form-container');
    const userInfoContainer = document.getElementById('user-info-container');
    const loggedInUserInfo = document.getElementById('logged-in-user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const newBtn = document.getElementById('new-btn');

    if (jwtToken) {    // Пользователь авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'none'; //скрываем форму входа

        const username = localStorage.getItem('username'); // Берем из localStorage
        const userEmail = localStorage.getItem('userEmail'); // Берем из localStorage

        if (userInfoContainer && loggedInUserInfo && logoutBtn) { //если на старнице html есть нужные элементы, то показывать инфо о пользователе и кнопку выхода из профиля
            loggedInUserInfo.textContent = `Вошел как: ${username} (${userEmail})`; //подстановка данных о пользователе из localstorage
            userInfoContainer.style.display = 'block'; //отображать контейнер с инфо пользователя и кнопкой выхода
            if (!logoutBtn.dataset.listenerAttached) { // проверяем что нет обработчика на кнопке выхода
                logoutBtn.addEventListener('click', handleLogout);
                logoutBtn.dataset.listenerAttached = 'true'; // Помечаем, что обработчик навешен
            }
        }

        if (newBtn) {
            newBtn.style.display = permissions.includes('create_entries') ? 'block' : 'none'; // отображаем кнопку Добавить новое если есть права create_entries
        }
    } else {    // Пользователь не авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'block'; // оборажаем форму входа
        if (userInfoContainer) userInfoContainer.style.display = 'none'; // не отображать контейнер с инфо пользователя и кнопкой выхода
        if (newBtn) newBtn.style.display = 'none'; // не отображаем кнопку Добавить новое
        if (logoutBtn && logoutBtn.dataset.listenerAttached) {  // Удаляем обработчик выхода, если он был навешен
            logoutBtn.removeEventListener('click', handleLogout);
            logoutBtn.dataset.listenerAttached = '';
        }
        document.getElementById('table-body').innerHTML = ''; // Очищаем таблицу, если пользователь не авторизован
    }
}

/** Функция, которая будет вызвана после успешного входа
 * @param userData объект с данными о пользователе, взятыми из JWT токена */
function handleLoginSuccess(userData) {
    if (userData && userData.username && userData.email) {  // Сохраняем данные пользователя в localStorage, если они зашифрованы в JWT токене
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userEmail', userData.email);
    } else {
        console.warn('LoginForm.jsx не передал данные пользователя (username и/или email в объекте userData) в handleLoginSuccess'); //debag
    }
    updateAuthUI(); // Обновляем UI

    const zpId = getZpIdFromPath(); //получаем id текущего ЖП
    if (zpId) loadNotesData(zpId); //загружаем записи в текущем ЖП
}

/** Функция, которая будет вызвана при выходе пользователя
 * @description Очищает токен JWT, username и userEmail */
function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    updateAuthUI(); // Обновляем UI
}

/** Функция для получения ID текущего ЖП из URL
 * @return {string} ID текущего ЖП */
function getZpIdFromPath() {
    const path = window.location.pathname; // Получаем текущий путь URL
    const pathParts = path.split('/'); // Разделяем путь на части
    return pathParts[pathParts.length - 1]; // Ищем и возвращаем ID, который должен быть последней частью пути
}


/** Функция для сброса видимости полей формы */
function resetNewFormAndRestoreFields() {  //сброс видимости полей формы
    document.getElementById('new-form').reset();  //сброс полей формы
    document.getElementById('form-submit-btn').textContent = 'Создать';
    const fields = ['new-note_zp_id', 'new-response', 'new-response_note', 'new-response_date', 'new-name_note', 'new-note', 'new-owner_note', 'new-owner_date', 'new-ii_cd']; // список id полей формы
    fields.forEach(id => { document.getElementById(id).parentElement.style.display = 'flex'; }); //сбрасываем видимость полей формы
    document.getElementById('new-archive').parentElement.style.display = 'block'; //чек-бокс утверждения записи
    document.getElementById('form-delete-btn').style.display = 'block'; //кнопка удаления записи
}

/** Асинхронная функция для загрузки данных записей из ЖП
 * @param {number} id - ID ЖП */
async function loadNotesData(id) {  //загрузка всех записей из ЖП по id ЖП
    if (!localStorage.getItem('jwtToken')) { //если пользователь не авторизован
        document.getElementById('table-body').innerHTML = '';
        return;
    }
    try {
        const notes = await DataManager.fetchNotesZp(id); // GET запрос на получение всех записей из ЖП == id
        // console.log(`data notes: ${JSON.stringify(notes)}`);
        /*data notes: {"id":18,"zp_name":"ЗФ 220", "json_agg":[{"id":1,"note_zp_id":1,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки не соответсвует графике чертежа","owner_note":"Сердюк Л.В.","owner_date":"2015-08-20","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм. 1ю cdr\" КД будет откорректирована установленном порядке","response_note":"Сердюк Л.В.","response_date":"2015-08-26","archive":true}]}*/
        const permissions = getUserPermissions(); //получаем права пользователя

        document.title = `Журнал предложений № ${notes.id || 'Неизвестный ID'} - ${notes.zp_name || 'Неизвестное название'}`; //установка заголовка страницы

        document.getElementById('zp_id').textContent = notes.id || 'Неизвестный №'; //из БД вставляем в шапку номер-идентификатор ЖП из табилцы stalenergo_zp.id
        document.getElementById('zp_name').textContent = notes.zp_name || 'Неизвестное название'; //из БД вставляем в шапку название ЖП из табилцы stalenergo_zp.zp_name

        //Редактирование шапки ЖП
        if (permissions.includes('edit_zp') || permissions.includes('delete_zp')) {  //проверка прав перед редактированием шапки ЖП
            document.querySelector('.table thead tr:nth-child(1)').addEventListener('dblclick', () => openEditZpForm(notes)); // двойной клик левой кнопкой мыши по первой строке заголовка
            document.querySelector('.table thead tr:nth-child(2)').addEventListener('dblclick', () => openEditZpForm(notes)); // двойной клик левой кнопкой мыши по второй строке заголовка
        }

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; //очистка записей ЖП

        if (!notes || !notes.json_agg) {  //если нет записей в этом ЖП, нет смысла отображать записи
            console.error('Нет данных для отображения');
        } else { //если существуют записи в этом ЖП отображаем их и навешиваем события
            notes.json_agg.forEach(note => { //походимся по всем записям в ЖП
                const noteRow = document.createElement('tr'); //создаем новую строку
                noteRow.dataset.id = note.id; //устанвавливаем атрибут data-id как уникальный id записи из таблицы stalenergo_notes_zp
                //вставляем данные строки в таблицу
                noteRow.innerHTML = `
                    <td>${note.note_zp_id || ''}</td>
                    <td>${note.name_note || ''}</td>
                    <td>${note.note || ''}</td>
                    <td>${note.owner_note || ''}<br>${note.owner_date || ''}</td>
                    <td>${note.response || ''}</td>
                    <td>${note.response_note || ''}<br>${note.response_date || ''}</td>
                `;

                noteRow.classList.add(note.archive ? 'highlight-archive' : 'highlight-not-archive'); // добавляем класс highlight-archive (note.archive - true) или highlight-not-archive для подсветки строки

                if (note.ii_cd) noteRow.classList.add('highlight-ii-cd'); //подсветка строки записи в ЖП, если есть II_CD Изменение в КД (погашена)

                if (permissions.includes('edit_entries_full') || ((permissions.includes('edit_entries_initiator') || permissions.includes('edit_entries_responder')) && note.archive === false)) { //запись не архивная - может редактировать edit_entries_initiator или edit_entries_responder, архивные записи может редатировать только edit_entries_full

                    noteRow.addEventListener('dblclick', (e) => { // двойной клик левой кнопкой мыши по строке таблицы
                        const cellIndex = e.target.cellIndex; //индекс ячейки, на которой был клик, от 0 до 5
                        const group = (cellIndex < 4) ? 'group1' : 'group2'; //group1 - владелец - первые 4 ячейки, group2 - отвечающий - остальные 2 ячейки
                        openEditNoteZpForm(note, group);
                    });
                }
                tableBody.append(noteRow); //вставяем строку в таблицу
            });
        }

        //состояние фильтров
        const checkIiCd = document.getElementById('check_ii_cd'); // Получаем чекбоксы
        checkIiCd.checked = localStorage.getItem('check_ii_cd') === 'false' ? false : true; // Восстанавливаем состояние чекбоксов из localStorage. По умолчанию true

        const updateVisibility = () => { // Функция для обновления видимости строк таблицы
            document.querySelectorAll('.highlight-ii-cd').forEach(row => { //обновляем строки таблицы
                row.style.display = checkIiCd.checked ? 'table-row' : 'none'; //если есть галочка - отображаем, иначе none
            });
        };

        checkIiCd.addEventListener('change', () => { // Добавляем обработчики событий для сохранения состояния чекбоксов
            localStorage.setItem('check_ii_cd', checkIiCd.checked);
            updateVisibility();
        });

        updateVisibility(); // Вызываем функцию обновления видимости строк при загрузке страницы

    } catch (error) { console.error('Ошибка при загрузке данных:', error); }
}

/** Функция для открытия формы редактирования ЖП
 * @param {Object} notes - Объект с данными ЖП */
function openEditZpForm(notes) {
    const permissions = getUserPermissions();

    document.getElementById('new-id').value = notes.id; //заполняем поля формы данными текущего ЖП из БД
    document.getElementById('new-zp_name').value = notes.zp_name;

    const submitBtn = document.getElementById('zp-submit-btn'); //кнопка "Обновить" данные ЖП
    const deleteBtn = document.getElementById('zp-delete-btn'); //кнопка "Удалить" ЖП

    submitBtn.onclick = () => updateZp(notes.id); //навешиваем событие на кнопку "Обновить" - обновление данных ЖП
    submitBtn.style.display = permissions.includes('edit_zp') ? 'block' : 'none'; // показываем кнопку "Обновить" если у пользователя есть право на редактирование ЖП

    deleteBtn.onclick = () => deleteZp(notes.id);  //навешиваем событие на кнопку "Удалить" - удаление ЖП

    // console.log('notes.json_agg', notes.json_agg);
    // if (notes.json_agg != null) { //если есть записи в ЖП, то убираем кнопку "Удалить" сам ЖП
    //     document.getElementById('zp-delete-btn').style.display = 'none';
    // } else { //если ЖП пуст то показываем кнопку "Удалить" ЖП
    //     document.getElementById('zp-delete-btn').style.display = 'block';
    // }

    /** возможно ли notes.json_agg == null поменять на !notes.json_agg */
    deleteBtn.style.display = permissions.includes('delete_zp') && notes.json_agg == null ? 'block' : 'none'; //Кнопку удаления показываем только если есть право и в ЖП нет записей

    openModal('edit-zp-container');
}

/** Функция для открытия формы редактирования записи в ЖП с проверкой прав
 * @param {Object} note - Объект с данными записи в ЖП
 * @param {string} group - Группа записи в ЖП (group1 - владелец, group2 - отвечающий) */
function openEditNoteZpForm(note, group) { //открытие формы редактирования записи в ЖП
    const permissions = getUserPermissions();
    resetNewFormAndRestoreFields(); // Сначала сбрасываем и показываем все поля формы

    //заполняем поля формы данными текущей записи в ЖП
    document.getElementById('new-ii_cd').value = note.ii_cd;
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

    //кнопки
    const submitBtn = document.getElementById('form-submit-btn'); //кнопка "Обновить" запись в ЖП
    const deleteBtn = document.getElementById('form-delete-btn'); //кнопка "Удалить" запись в ЖП

    submitBtn.textContent = 'Обновить';
    submitBtn.onclick = () => updateNoteZp(note.id); //отправлет PUT запрос обновления записи в ЖП (по id записи)
    submitBtn.style.display = permissions.includes('edit_entries_responder') || permissions.includes('edit_entries_initiator') || permissions.includes('edit_entries_full') ? 'block' : 'none'; // показываем кнопку "Обновить" если у пользователя права инициатора или ответчика или полные права на редактирование записи в ЖП

    deleteBtn.onclick = () => deleteNoteZp(note.id); //отправлет DELETE запрос удаления записи в ЖП (по id записи)
    deleteBtn.style.display = permissions.includes('delete_entries') ? 'block' : 'none'; // показываем кнопку "Удалить" если у пользователя есть право на удаление записи в ЖП

    if (group === 'group1') { //если редактируем первые 4 столбца
        ['new-response', 'new-response_note', 'new-response_date', 'new-archive', 'new-ii_cd'].forEach(id => {
            document.getElementById(id).parentElement.style.display = 'none';
        }); //скрываем запрещенные поля
    } else if (group === 'group2') { //если редактируем последние 2 столбца
        ['new-note_zp_id', 'new-name_note', 'new-note', 'new-owner_note', 'new-owner_date'].forEach(id => {
            document.getElementById(id).parentElement.style.display = 'none';
        }); //скрываем запрещенные поля
        deleteBtn.style.display = 'none'; // Удалять можно только из группы 1
    }
    openModal('new-form-container');
}

/** Функция для обновления данных ЖП (id и zp_name) в таблице ЖП stalenergo_zp 
 * @param {number} id - id ЖП */
async function updateZp(id) { //обновление данных ЖП (id и zp_name) в таблице ЖП stalenergo_zp
    const data = { //данные из формы для обновления ЖП
        id: document.getElementById('new-id').value,  //забираем значение id из формы
        zp_name: document.getElementById('new-zp_name').value //забираем значение zp_name из формы
    };
    await DataManager.updateZp(id, data); // Отправляем PUT запрос на сервер для обновления записи (id -старый id, data - новые данные)
    closeModal('edit-zp-container'); // Закрываем модальное окно
    loadNotesData(data.id); // Загружаем данные обновленного ЖП с новым id (если менялся id ЖП)
}

/** Функция для обновления записи в ЖП (по id записи)
 * @param {number} id - id записи в ЖП */
async function updateNoteZp(id) {  //обновление записи в ЖП по id записи
    let statusArchive = document.getElementById('new-archive').checked; //проверка состояния галочки "архивировать"
    const docIiCd = document.getElementById('new-ii_cd').value; //номер извещения об изменении КД
    /** проверить можно ли вместо docIiCd != '' написать docIiCd */
    if (docIiCd != '') { //если номер извещения об изменении КД не пустой, то запись Утвержденная(архивная)
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

    await DataManager.updateNoteZp(id, data); // Отправляем PUT запрос на сервер для обновления записи (id - идентификатор записи в таблице stalenergo_notes_zp)
    closeModal('new-form-container'); // Закрываем модальное окно
    loadNotesData(getZpIdFromPath()); //загружаем данные обновленного ЖП
}


/** Функция для удаления ЖП по id
 * @param {number} id - id ЖП */
async function deleteZp(id) {
    if (!confirm(`Вы уверены, что хотите удалить ЖП №${id}?`)) return;
    try {
        await DataManager.deleteZp(id); //удаляем ЖП по id
        window.open('/app/zp', '_self');   // Перенаправляем пользователя на страницу со списком всех ЖП
    } catch (error) {
        console.error('Ошибка при удалении ЖП:', error);
        alert('Произошла ошибка при удалении ЖП. Пожалуйста, попробуйте снова.');
    }
}

/** Функция для удаления записи в ЖП по id записи
 * @param {number} noteId - id записи в ЖП */
async function deleteNoteZp(noteId) { //удаление позиции по id записи
    if (!confirm(`Вы уверены, что хотите удалить запись?`)) return;
    try {
        await DataManager.deleteNoteZp(noteId); //удаляем запись ЖП по id записи
        closeModal('new-form-container'); // Закрываем модальное окно
        loadNotesData(getZpIdFromPath()); //загружаем данные обновленного ЖП
    } catch (error) {
        console.error('Ошибка при удалении записи в ЖП:', error);
        alert('Произошла ошибка при удалении записи в ЖП. Пожалуйста, попробуйте снова.');
    }
}

/** Функция для создания новой записи в ЖП */
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
        // response: document.getElementById('new-response').value,
        // response_note: document.getElementById('new-response_note').value,
        // // response_date: new Date().toISOString().split('T')[0], //для автозаполнения
        // response_date: document.getElementById('new-response_date').value || null
    };
    await DataManager.createNoteZp(zpId, data);  //отправляем POST запрос на создание записи в ЖП
    closeModal('new-form-container');
    loadNotesData(zpId);
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    if (window.renderLoginForm) { // Проверяем, импортирована ли функция renderLoginForm через глобальный объект window
        window.renderLoginForm('react-login-form-container', handleLoginSuccess); // Вызов функции для рендеринга формы входа React. Вызываем импортированную глобально функцию из embed.js
    } else {
        console.error('Функция renderLoginForm не найдена. Убедитесь, что embed.js загружен.');
    }

    if (localStorage.getItem('jwtToken')) { // Пользователь авторизован
        const zpId = getZpIdFromPath();
        if (zpId) loadNotesData(zpId); // загружаем данные при загрузке страницы
    }


    addCloseEventListeners('new-form-container', '#form-close-btn', '.modal-backdrop', resetNewFormAndRestoreFields);  //закрытие формы записи ЖП по кнопке "Отмена"
    addCloseEventListeners('new-form-container', null, '.modal-backdrop', resetNewFormAndRestoreFields); //закрытие формы записи ЖП по фону

    addCloseEventListeners('edit-zp-container', '#zp-close-btn', '.modal-backdrop', () => document.getElementById('edit-zp').reset()); //закрытие формы редактирования ЖП по кнопке "Отмена"
    addCloseEventListeners('edit-zp-container', null, '.modal-backdrop', () => document.getElementById('edit-zp').reset()); //закрытие формы редактирования ЖП по фону

    // Подсветка ячеек табилцы при наведении курсором
    const tableBody = document.getElementById('table-body'); //берем контейнер строк таблицы
    if (tableBody) {
        tableBody.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'TD') {
                const row = e.target.parentElement;
                const highlightClass = 'highlight-group' + (Array.from(row.cells).indexOf(e.target) < 4 ? '1' : '2');

                // Удаляем старые классы выделения и добавляем новый
                row.classList.remove('highlight-group1', 'highlight-group2');
                row.classList.add(highlightClass);
            }
        });

        tableBody.addEventListener('mouseout', (e) => {
            if (e.target.tagName === 'TD') {
                const row = e.target.parentElement;
                if (!e.relatedTarget || !row.contains(e.relatedTarget)) {
                    // Удаляем только классы выделения, сохраняя остальные
                    row.classList.remove('highlight-group1', 'highlight-group2');
                }
            }
        });
    }

    //кнопка "Добавить новую запись" в ЖП
    document.getElementById('new-btn').addEventListener('click', async () => {
        resetNewFormAndRestoreFields(); //сброс видимости полей формы записи в ЖП
        const zpId = getZpIdFromPath(); //берем id текущего ЖП
        const notes = await DataManager.fetchNotesZp(zpId); // GET запрос на получение всех записей из ЖП == zpId
        let currentNote;  //номер текущей записи в ЖП
        if (notes.json_agg) { //если записи есть
            const lastNote = notes.json_agg[notes.json_agg.length - 1]; // Получаем последний элемент массива записей в рамках 1 ЖП
            currentNote = lastNote.note_zp_id + 1;  //увеличиваем номер п/п
        }
        document.getElementById('new-note_zp_id').value = currentNote || 1; //записываем в "№ п/п:" номер текущей записи +1, а если записей нет то будет 1

        ['new-response', 'new-response_note', 'new-response_date', 'new-archive', 'new-ii_cd'].forEach(id => {
            document.getElementById(id).parentElement.style.display = 'none';
        }); //скрываем поля группы 2
        document.getElementById('form-delete-btn').style.display = 'none';

        document.getElementById('form-submit-btn').onclick = createRow; //кнопка "Создать" отправлет POST запрос создания нового ЖП
        openModal('new-form-container');
    });

    //кнопка возврата назад в список ЖП
    document.getElementById('back-btn').addEventListener('click', () => {
        window.open('/app/zp', '_self');   // Перенаправляем пользователя на страницу со списком всех ЖП
    })
});