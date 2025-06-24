import { DataManager } from './dataManager.js';
//Для ЖП

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
        loadData();
    } else {
        alert('Неверные учетные данные');
    }
}

// Функция для обработки выхода
function handleLogout() {
    localStorage.removeItem('isAuthenticated');
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

async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу
    const countArr = await DataManager.fetchCountNotesInZp(); // GET запрос на получение количества записей в ЖП
    /* [ { zp_id: 82, count: '2' }, { zp_id: 18, count: '4' } ] */
    const countNotesInZp = countArr.reduce((acc, item) => {  // Преобразуем массив в нужный объект
        acc[item.zp_id] = parseInt(item.count, 10); // Преобразуем строку в число для count
        return acc;
    }, {});
    /* {18: 4, 82: 2} */

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
            <td class="${itemZp.archive ? 'highlight-archive' : ''}">${itemZp.zp_name}</td>
            <td>${countNotesInZp[itemZp.id] || 0}</td>
        `;

        itemZpRow.addEventListener('dblclick', () => { //вешаем собтие dblclick на строку таблицы
            window.open(`/app/zp/${itemZp.id}`, '_self');   // Используем window.open для открытия ссылки на ЖП в этой же вкладке
        });

        tableBody.append(itemZpRow); //вставляем в строку таблицы ячейки
    });
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
    loadData();
}

document.addEventListener('DOMContentLoaded', () => {
    // Проверка состояния авторизации при загрузке страницы
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        document.getElementById('auth-btn').textContent = 'Выход';
        document.getElementById('new-btn').style.display = 'block';
    }

    document.getElementById('auth-btn').addEventListener('click', () => { //событие открытия формы авторизации при нажатии на кнопку "Авторизация"
        const authButton = document.getElementById('auth-btn');
        if (authButton.textContent === 'Авторизация') {
            document.getElementById('auth-form-container').style.display = 'block';
        } else {
            handleLogout();
        }
    });

    document.getElementById('auth-form').addEventListener('submit', handleAuth);

    loadData(); // Загрузка данных при загрузке страницы

    // Навешивание событий на элементы управления (конпку создания новой записи и закрытие формы новой записи)
    //открывает форму при создании нового ЖП
    document.getElementById('new-btn').addEventListener('click', async () => {
        document.getElementById('new-form-container').style.display = 'block';
        document.querySelector('.modal-backdrop').style.display = 'block';
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow; //отправлет POST запрос создания нового ЖП
        document.getElementById('form-delete-btn').style.display = 'none';
        document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
    });

    //закрытие формы
    document.getElementById('form-close-btn').addEventListener('click', () => {
        document.getElementById('new-form-container').style.display = 'none';
        document.querySelector('.modal-backdrop').style.display = 'none';
        document.getElementById('new-form').reset();
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow;
        document.getElementById('form-delete-btn').style.display = 'block';
    });
});