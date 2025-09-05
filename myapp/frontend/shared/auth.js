/** Сохраняет JWT-токен в localStorage.
 * @param {string} token - JWT-токен */
export function saveToken(token) {
    localStorage.setItem('authToken', token);
}

/** Получает JWT-токен из localStorage.
 * @returns {string|null} - JWT-токен или null, если он не найден */
export function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Удаляет JWT-токен из localStorage (для выхода из системы).
 */
export function logout() {
    localStorage.removeItem('authToken');
    // Перенаправляем на страницу входа после выхода
    window.location.href = 'login.html';
}

/**
 * Проверяет, аутентифицирован ли пользователь.
 * Если нет, перенаправляет на страницу входа.
 */
export function ensureAuthenticated() {
    if (!getToken()) {
        console.log('Пользователь не аутентифицирован. Перенаправление на страницу входа...');
        window.location.href = 'login.html';
    }
}

/**
 * Декодирует JWT-токен, чтобы получить данные пользователя (без проверки подписи).
 * @returns {object|null} - Объект с данными пользователя или null.
 */
export function getUserDataFromToken() {
    const token = getToken();
    if (!token) return null;
    try {
        // Получаем полезную нагрузку (payload) из токена
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        return null;
    }
}

/**
 * Возвращает объект с заголовком Authorization для fetch-запросов.
 * @returns {object} - Объект с заголовком.
 */
export function getAuthHeaders() {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
