import { DataManager } from './dataManager.js';
import { EventManager } from './eventManager3.js';
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

// Проверка состояния авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        document.getElementById('auth-btn').textContent = 'Выход';
        document.getElementById('new-btn').style.display = 'block';
    }

    const zpId = getZpIdFromPath();
    if (zpId) {
        loadNotesData(zpId);
    } else {
        console.error('ID журнала предложений не найден в URL');
    }
});

document.getElementById('auth-btn').addEventListener('click', () => {
    const authButton = document.getElementById('auth-btn');
    if (authButton.textContent === 'Авторизация') {
        document.getElementById('auth-form-container').style.display = 'block';
    } else {
        handleLogout();
    }
});

document.getElementById('auth-form').addEventListener('submit', handleAuth);

async function loadNotesData(id) {
    try {
        const notes = await DataManager.fetchNotesZp(id);
        console.log(`data notes: ${JSON.stringify(notes)}`);
        /*
data notes: {"id":18,"zp_name":"ЗФ 220","json_agg":[{"note_zp_id":1,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки не соответсвует графике чертежа","owner_note":"Сердюк Л.В.","owner_date":"2015-08-20","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм. 1ю cdr\" КД будет откорректирована установленном порядке","response_note":"Сердюк Л.В.","response_date":"2015-08-26"},{"note_zp_id":2,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки отсутвует","owner_note":"Иванов И.В.","owner_date":"2025-02-17","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм. 1ю cdr\" КД будет откорректирована установленном порядке","response_note":"Клементьев В.А.","response_date":"2025-02-20"},{"note_zp_id":3,"name_note":"ЕИУС.436600.040.015 Наклейка","note":"Файл наклейки изменен","owner_note":"Клементьев В.А.","owner_date":"2025-03-15","response":"Наклейку заказывать по файлу \"ЕИУС.436600.040.015 изм.2\" КД будет откорректирована установленном порядке","response_note":"Клементьев В.А.","response_date":"2025-03-15"}]}
        */
        if (!notes || notes.length === 0) {
            console.error('Нет данных для отображения');
            return;
        }

        document.title = `Журнал предложений № ${notes.id || 'Неизвестный ID'} - ${notes.zp_name || 'Неизвестное название'}`; //установка заголовка страницы

        const zpNameElement = document.getElementById('zp_name');
        const zpIdElement = document.getElementById('zp_id');

        zpNameElement.textContent = notes.zp_name || 'Неизвестное название';
        zpIdElement.textContent = notes.id || 'Неизвестный ID';

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';

        notes.json_agg.forEach(note => {
            const noteRow = document.createElement('tr');
            noteRow.setAttribute('data-id', note.note_zp_id || '');
            noteRow.innerHTML = `
            <td>${note.note_zp_id || ''}</td>
            <td>${note.name_note || ''}</td>
            <td>${note.note || ''}</td>
            <td>${note.owner_note || ''}<br>${note.owner_date || ''}</td>
            <td>${note.response || ''}</td>
            <td>${note.response_note || ''}<br>${note.response_date || ''}</td>
        `;
            tableBody.append(noteRow);
        });
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

async function updateNote(id) {
    const data = {
        id: document.getElementById('new-id').value,
        name_note: document.getElementById('new-part-name').value,
        note: document.getElementById('new-comment').value,
        owner_note: document.getElementById('new-author').value,
        owner_date: new Date().toISOString().split('T')[0],
        response: document.getElementById('new-response').value,
        response_note: document.getElementById('new-decision-author').value,
        response_date: new Date().toISOString().split('T')[0]
    };

    const username = localStorage.getItem('username') || 'anonymous';
    await DataManager.updateNoteZp(id, data, username);
    document.getElementById('form-close-btn').click();
    loadNotesData(getZpIdFromPath());
}

//удаление позиции по id
async function deleteNote(id) {
    const username = localStorage.getItem('username') || 'anonymous';
    await DataManager.deleteNoteZp(id, username);
    document.getElementById('form-close-btn').click();
    loadNotesData(getZpIdFromPath());
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

// Навешивание событий на элементы управления (конпку создания новой записи)
EventManager.addEventListeners();