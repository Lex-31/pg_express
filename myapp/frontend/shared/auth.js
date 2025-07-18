import { serverUrl } from "../config.js";
// Логика авторизации/аутентификации
/**
 * Логика авторизации: 
 * Функции handleAuth, handleLogout, checkCredentials и связанная с ними логика работы с LocalStorage и DOM (auth-btn, auth-form-container)
 */

/** Функция для обработки авторизации
 * @param event - событие, которое вызывает функцию */
export async function handleAuth(event) {
    event.preventDefault();
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    const isAuthenticated = await checkCredentials(username, password);

    if (isAuthenticated) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        document.getElementById('auth-btn').textContent = 'Выход';
        // Логика показа/скрытия кнопок, специфичная для каждой страницы, останется в main*.js
        // document.getElementById('new-btn').style.display = 'block';
        document.getElementById('auth-form-container').style.display = 'none';

        // Добавляем логику отображения #new-btn после успешной авторизации
        const newBtn = document.getElementById('new-btn');
        if (newBtn) { // Проверяем, существует ли кнопка на текущей странице
            newBtn.style.display = 'block';
        }

        // Логика загрузки данных специфичная для каждой страницы, останется в main*.js
        // loadData();
    } else {
        alert('Неверные учетные данные');
    }
}

/** Функция для обработки выхода */
export function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    document.getElementById('auth-btn').textContent = 'Авторизация';
    // Логика показа/скрытия кнопок, специфичная для каждой страницы, останется в main*.js
    // document.getElementById('new-btn').style.display = 'none';
    document.getElementById('auth-form-container').style.display = 'none';

    // Добавляем логику скрытия #new-btn после выхода
    const newBtn = document.getElementById('new-btn');
    if (newBtn) { // Проверяем, существует ли кнопка на текущей странице
        newBtn.style.display = 'none';
    }

    location.reload(); // Перезагружаем страницу для сброса состояния
}

/** Функция для проверки учетных данных (заглушка - ТРЕБУЕТ РЕАЛИЗАЦИИ НА БЭКЕНДЕ)
 * Предполагается, что на бэкенде будет API эндпоинт для аутентификации
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>} - Возвращает true, если учетные данные верны, иначе false */
async function checkCredentials(username, password) {
    // TODO: Реализовать реальную проверку учетных данных через API запрос к бэкенду
    console.warn('Используя фиктивную функцию checkCredentials. Реализуйте реальную аутентификацию!');
    if (username === 'admin' && password === '123') {
        return true;
    } else {
        return false;
    }
}

/** Инициализация состояния авторизации при загрузке страницы */
export function initAuthStatus() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const newBtn = document.getElementById('new-btn'); // Получаем ссылку на кнопку здесь
    if (isAuthenticated) {
        document.getElementById('auth-btn').textContent = 'Выход';
        if (newBtn) { // Отображаем кнопку при загрузке, если авторизован
            newBtn.style.display = 'block';
        }
    } else {
        if (newBtn) { // Скрываем кнопку при загрузке, если не авторизован
            newBtn.style.display = 'none';
        }
    }
}

/** Навешивание событий для формы авторизации */
export function addAuthEventListeners() {
    document.getElementById('auth-btn').addEventListener('click', () => {
        const authButton = document.getElementById('auth-btn');
        if (authButton.textContent === 'Авторизация') {
            document.getElementById('auth-form-container').style.display = 'block';
        } else {
            handleLogout();
        }
    });

    // Закрытие формы авторизации по кнопке "Отмена" (если она есть)
    const authCloseBtn = document.getElementById('auth-close-btn');
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', () => {
            document.getElementById('auth-form-container').style.display = 'none';
        });
    }

    const authForm = document.getElementById('auth-form');
    if (authForm) { // Проверка на существование формы
        authForm.addEventListener('submit', handleAuth);
    }
}