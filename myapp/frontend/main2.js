import { DataManager } from './dataManager.js';
// import {
//     handleAuth,
//     handleLogout,
//     initAuthStatus,
//     addAuthEventListeners
// } from './shared/auth.js';
import {
    openModal,
    closeModal,
    addCloseEventListeners
} from './shared/modalUtils.js';
//Для ЖП

/** Новая функция для обновления UI в зависимости от статуса авторизации
 * @description функция будет отвечать исключительно за скрытие/отображение формы логина, информации о пользователе и кнопки "Добавить новое" на основе наличия JWT токена в localStorage */
function updateAuthUI() {
    const jwtToken = localStorage.getItem('jwtToken');
    const loginFormContainer = document.getElementById('react-login-form-container');
    const userInfoContainer = document.getElementById('user-info-container');
    const loggedInUserInfo = document.getElementById('logged-in-user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const newBtn = document.getElementById('new-btn');

    if (jwtToken) {    // Пользователь авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'none'; //скрываем форму входа

        const username = localStorage.getItem('username'); // Берем из localStorage
        const userEmail = localStorage.getItem('userEmail'); // Берем из localStorage

        if (userInfoContainer && loggedInUserInfo && logoutBtn) { //показывать инфо о пользователе и кнопку выхода из профиля
            loggedInUserInfo.textContent = `Вошел как: ${username} (${userEmail})`; //подстановка данных о пользователе из localstorage
            userInfoContainer.style.display = 'block'; //отображать контейнер с инфо пользователя и кнопкой выхода
            if (!logoutBtn.dataset.listenerAttached) { // проверяем что нет обработчика на кнопке выхода
                logoutBtn.addEventListener('click', handleLogout);
                logoutBtn.dataset.listenerAttached = 'true'; // Помечаем, что обработчик навешен
            }
        }

        if (newBtn) newBtn.style.display = 'block'; //отображаем кнопку Добавить новое
    } else {    // Пользователь не авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'block'; // оборажаем форму входа
        if (userInfoContainer) userInfoContainer.style.display = 'none'; // не отображать контейнер с инфо пользователя и кнопкой выхода
        if (newBtn) newBtn.style.display = 'none'; // не отображаем кнопку Добавить новое
        if (logoutBtn && logoutBtn.dataset.listenerAttached) {  // Удаляем обработчик выхода, если он был навешен
            logoutBtn.removeEventListener('click', handleLogout);
            logoutBtn.dataset.listenerAttached = '';
        }
    }
}

async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу
    const countArr = await DataManager.fetchCountNotesInZp(); // GET запрос на получение количества записей в ЖП
    /* [ {zp_id: 82, count: '2', with_ii_cd: '0', unsigned: '1'}, {zp_id: 18, count: '4', with_ii_cd: '2', unsigned: '1'} ] */
    // console.log(countArr);

    const countNotesInZp = countArr.reduce((acc, item) => {  // Преобразуем массив в нужный объект
        acc[item.zp_id] = parseInt(item.count, 10); // Преобразуем строку в число для count
        return acc;
    }, {});
    /* {18: 4, 82: 2} */
    // console.log(countNotesInZp);

    const whith_ii_NotesInZp = countArr.reduce((acc, item) => {  // Преобразуем массив в нужный объект
        acc[item.zp_id] = parseInt(item.with_ii_cd, 10); // Преобразуем строку в число для with_ii_cd
        return acc;
    }, {});
    /* {18: 2, 82: 0} */
    // console.log(whith_ii_NotesInZp);

    const unsigned_NotesInZp = countArr.reduce((acc, item) => {  // Преобразуем массив в нужный объект
        acc[item.zp_id] = parseInt(item.unsigned, 10); // Преобразуем строку в число для unsigned
        return acc;
    }, {});
    /* {18: 1, 82: 1} */
    // console.log(unsigned_NotesInZp);


    const itemsZp = await DataManager.fetchItemsZp();  // Загрузка всех ЖП
    /* itemsZp:
    [{"id":18,"zp_name":"ЗФ 220"},{"id":82,"zp_name":"УТ 200 УТ 600"}] */
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Очистка таблицы перед загрузкой данных
    itemsZp.forEach(itemZp => {  //проходимся по всем ЖП
        const itemZpRow = document.createElement('tr'); //создаем строку таблицы
        itemZpRow.setAttribute('data-id', itemZp.id);  //устанавливаем атрибут строке таблицы с id ЖП
        //вставляем html в строку таблицы
        itemZpRow.innerHTML = `
            <td>${itemZp.id}</td>
            <td>${itemZp.zp_name}</td>
            <td>${countNotesInZp[itemZp.id] || 0}</td>
            <td>${whith_ii_NotesInZp[itemZp.id] || 0}</td>
            <td>${unsigned_NotesInZp[itemZp.id] || 0}</td>
        `;

        itemZpRow.addEventListener('dblclick', () => { //вешаем собтие dblclick на строку таблицы
            window.open(`/app/zp/${itemZp.id}`, '_self');   // Используем window.open для открытия ссылки на ЖП в этой же вкладке
        });

        tableBody.append(itemZpRow); //вставляем в строку таблицы ячейки
    });

    sortZp(); //сортировка по счетчикам записей после заполнения таблицы строками
}

async function createRow() { //Отправляет POST запрос на сервер для создания нового ЖП
    const data = {
        id: document.getElementById('new-id').value,
        zp_name: document.getElementById('new-zp_name').value
    };
    // Извлечение имени пользователя
    const username = localStorage.getItem('username') || 'anonymous';

    const response = await DataManager.createZp(data, username); // POST запрос на создание изделия
    if (!response.id) { //если не вернулось id созданного ЖП
        alert(`Запись не создана! ${response}`); //из модели получаем сообщение об ошибке (return err.detail)
        return; //выходим из функции
    }

    document.getElementById('form-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    document.getElementById('new-form').reset();
    loadData();
}

function sortZp() { //сортировка ЖП по 3 столбцам
    const headers = {
        'notes-total': { element: document.getElementById('notes-total'), order: null },
        'notes-closed': { element: document.getElementById('notes-closed'), order: null },
        'notes-unsigned': { element: document.getElementById('notes-unsigned'), order: null }
    };

    Object.keys(headers).forEach(key => { // Восстанавливаем состояние сортировки из localStorage
        const savedOrder = localStorage.getItem(key);
        if (savedOrder) {
            headers[key].order = savedOrder;
            updateHeaderUI(headers[key]);
        }
    });

    Object.keys(headers).forEach(key => {  // Добавляем обработчики событий для заголовков
        headers[key].element.addEventListener('click', () => {
            toggleSortOrder(key);
            window.location.reload();  // Обновляем страницу после изменения состояния сортировки
        });
    });

    function toggleSortOrder(headerId) {  //переключает порядок сортировки для выбранного заголовка и сбрасывает порядок сортировки для других заголовков
        Object.keys(headers).forEach(key => {  // Сбрасываем порядок сортировки для всех заголовков
            if (key !== headerId) {
                headers[key].order = null;
                localStorage.removeItem(key);
                updateHeaderUI(headers[key]);
            }
        });

        // Переключаем порядок сортировки для выбранного заголовка
        const header = headers[headerId];
        if (header.order === null) { //если не было сортировки
            header.order = 'desc';  // устанавливаем порядок сортировки по убыванию
        } else if (header.order === 'desc') {
            header.order = 'asc';
        } else {
            header.order = null;
        }

        localStorage.setItem(headerId, header.order || ''); // Сохраняем состояние сортировки в localStorage
    }

    function updateHeaderUI(header) { // обновляет UI заголовка, добавляя/удаляя иконку сортировки в зависимости от текущего порядка
        const arrowSpan = header.element.querySelector('.sort-arrow');

        // Удаляем существующую стрелочку, если она есть
        if (arrowSpan) {
            arrowSpan.remove();
        }

        // Добавляем новую стрелочку, если есть порядок сортировки
        if (header.order === 'asc' || header.order === 'desc') {
            const newArrowSpan = document.createElement('span');
            newArrowSpan.classList.add('sort-arrow');
            if (header.order === 'asc') {
                newArrowSpan.textContent = ' ↑';
            } else {
                newArrowSpan.textContent = ' ↓';
            }
            // Добавляем стрелочку после текста заголовка
            header.element.append(newArrowSpan);
        }
    }

    function sortTable() {
        const tableBody = document.getElementById('table-body');
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        // Определяем, по какому столбцу сортировать
        let headerId, order;
        Object.keys(headers).forEach(key => {
            if (headers[key].order) {
                headerId = key;
                order = headers[key].order;
            }
        });

        if (!headerId) return; // Если сортировка не выбрана, выходим

        // Определяем индекс колонки для сортировки
        let columnIndex;
        switch (headerId) {
            case 'notes-total':
                columnIndex = 2;
                break;
            case 'notes-closed':
                columnIndex = 3;
                break;
            case 'notes-unsigned':
                columnIndex = 4;
                break;
            default:
                return;
        }

        // Сортируем строки
        rows.sort((a, b) => {
            const aValue = parseInt(a.cells[columnIndex].textContent, 10);
            const bValue = parseInt(b.cells[columnIndex].textContent, 10);

            if (order === 'asc') {
                return aValue - bValue;
            } else if (order === 'desc') {
                return bValue - aValue;
            } else {
                return 0;
            }
        });

        // Перерисовываем таблицу
        tableBody.innerHTML = '';
        rows.forEach(row => tableBody.appendChild(row));
    }
    sortTable();  // Вызываем функцию сортировки при загрузке страницы
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthStatus();
    addAuthEventListeners(); // Добавляем обработчики событий из shared/auth.js

    // const isAuthenticated = localStorage.getItem('isAuthenticated');
    // const newBtn = document.getElementById('new-btn');
    // if (isAuthenticated) { newBtn.style.display = 'block'; }


    // Навешивание событий на элементы управления (конпку создания новой записи и закрытие формы новой записи)
    //открывает форму при создании нового ЖП
    document.getElementById('new-btn').addEventListener('click', async () => {
        openModal('new-form-container');
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow; //отправлет POST запрос создания нового ЖП
        document.getElementById('form-delete-btn').style.display = 'none';
        document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
    });

    //закрытие формы
    document.getElementById('form-close-btn').addEventListener('click', () => {
        closeModal('new-form-container');
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow;
        document.getElementById('form-delete-btn').style.display = 'block';
    });

    loadData(); // Загрузка данных при загрузке страницы

    addCloseEventListeners('new-form-container', '#form-close-btn', '.modal-backdrop');    // Навешиваем обработчики закрытия модального окна
});