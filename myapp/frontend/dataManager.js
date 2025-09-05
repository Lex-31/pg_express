import { serverUrl } from './config.js';

/**
 * можем использовать этот файл 'dataManager.js как централизованное место для всех API запросов, возможно, добавив туда функции из main*.js
 */

/** Создает и возвращает заголовки для авторизованных API-запросов.
 * @returns {Headers} Объект Headers с Content-Type и заголовком Authorization */
function getAuthHeaders() {
    const headers = new Headers();
    const jwtToken = localStorage.getItem('jwtToken');
    headers.append('Content-Type', 'application/json');
    if (jwtToken) headers.append('Authorization', `Bearer ${jwtToken}`);
    return headers;
}

/** Класс для запросов к серверу
 * @method fetchData - универсальный метод для GET запросов к серверу
 * @method fetchCategories - GET запрос на получение категорий
 * @method fetchProducts - GET запрос на получение изделий
 * @method fetchProductById - GET запрос на получение изделия по id
 * @method fetchItemsZp - GET запрос на получение всех ЖП
 * @method fetchNotesZp - GET запрос на получение всех записей из одного ЖП по id ЖП
 * @method updateProduct - PUT запрос на обновление изделия
 * @method updateZp - PUT запрос на обновление ЖП
 * @method updateNoteZp - PUT запрос на обновление записи в ЖП
 * @method createProduct - POST запрос на создание изделия
 * @method createZp - POST запрос на создание нового ЖП
 * @method createNoteZp - POST запрос на создание записи в ЖП
 * @method deleteProduct - DELETE запрос на удаление изделия
 * @method deleteZp - DELETE запрос на удаление ЖП
 * @method deleteNoteZp - DELETE запрос на удаление записи в ЖП */
export class DataManager {
    /** Универсальный метод для выполнения запросов к API. Автоматически добавляет заголовки авторизации
     * @param {string} url - URL-адрес для запроса
     * @param {object} options - необязательные Опции для fetch (method, body, и т.д.)
     * @returns {Promise<any>} JSON-ответ от сервера */
    static async request(url, options = {}) {
        const config = {
            ...options, //добавляем данные и методы если они есть
            headers: getAuthHeaders(), // Добавляем заголовки авторизации
        };

        // Для blob-ответов (архив)
        const isBlob = options.isBlob || false;
        // if (isBlob) delete config.isBlob;
        if ('isBlob' in config) delete config.isBlob; //???

        const response = await fetch(url, config);  // выполняем запрос на url с указанными опциями
        if (response.status === 204) return;  // Для запросов (например, DELETE), которые могут не возвращать тело ответа

        if (!response.ok) {
            // Использовать сообщение об ошибке от сервера, если оно доступно
            const responseData = await response.json();
            const error = new Error(responseData.message || `HTTP ошибка! Статус: ${response.status}`);
            error.data = responseData;
            throw error;
        }

        if (isBlob) { // если ожидается blob
            return response.blob();
        }

        return response.json();
    }

    // GET запросы
    /** Получение категорий */
    static async fetchCategories() {
        return this.request(`http://${serverUrl}/api/categories`);
    }

    /** Получение изделий */
    static async fetchProducts() {
        return this.request(`http://${serverUrl}/api/main`);
    }

    /** Получение изделия по id
     * @param {number} id - id изделия */
    static async fetchProductById(id) {
        return this.request(`http://${serverUrl}/api/main/${id}`);
    }

    /** Получение всех ЖП */
    static async fetchItemsZp() {
        return this.request(`http://${serverUrl}/api/zp`);
    }

    /** Получение всех записей из одного ЖП
     * @param {number} id - id ЖП */
    static async fetchNotesZp(id) {
        return this.request(`http://${serverUrl}/api/zp/${id}`);
    }

    /** Получение количества записей в ЖП */
    static async fetchCountNotesInZp() {
        return this.request(`http://${serverUrl}/api/zpCount`);
    }

    // PUT запросы
    /** Обновление изделия
     * @param {number} id - id изделия
     * @param {object} data - данные из формы */
    static async updateProduct(id, data) {
        return this.request(`http://${serverUrl}/api/main/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /** Обновление ЖП
     * @param {number} id - id ЖП
     * @param {object} data - данные из формы */
    static async updateZp(id, data) {
        return this.request(`http://${serverUrl}/api/zp/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /** Обновление записи в ЖП
     * @param {number} noteId - id записи в ЖП
     * @param {object} data - данные из формы */
    static async updateNoteZp(noteId, data) {
        return this.request(`http://${serverUrl}/api/noteZp/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // POST запросы
    /** Cоздание изделия
     * @param {object} data - данные из формы */
    static async createProduct(data) {
        return this.request(`http://${serverUrl}/api/main`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /** Cоздание нового ЖП
     * @param {object} data - данные из формы */
    static async createZp(data) {
        return this.request(`http://${serverUrl}/api/zp`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /** Создание записи в ЖП
     * @param {number} id - id ЖП
     * @param {object} data - данные из формы */
    static async createNoteZp(id, data) {
        return this.request(`http://${serverUrl}/api/zp/${id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // DELETE запросы
    /** Удаление изделия
     * @param {number} id - id изделия */
    static async deleteProduct(id) {
        return this.request(`http://${serverUrl}/api/main/${id}`, {
            method: 'DELETE',
        });
    }

    /** Удаление ЖП
     * @param {number} id - id ЖП */
    static async deleteZp(id) {
        return this.request(`http://${serverUrl}/api/zp/${id}`, {
            method: 'DELETE',
        });
    }

    /** Удаление записи в ЖП
     * @param {number} noteId - id записи в ЖП */
    static async deleteNoteZp(noteId) {
        return this.request(`http://${serverUrl}/api/noteZp/${noteId}`, {
            method: 'DELETE',
        });
    }


    // --- Files and Archiving ---
    /** Получение содержимого директории на сервере
     * @param {string} path - Путь к директории */
    static async fetchDirectory(path = '') {
        return this.request(`http://${serverUrl}/api/get-dir`, {
            method: 'POST',
            body: JSON.stringify({ path })
        });
    }

    /** Получение временной URL для доступа к файлу на сервере */
    static async fetchFileUrl(path) {
        return this.request(`http://${serverUrl}/api/get-file`, {
            method: 'POST',
            body: JSON.stringify({ path })
        });
    }

    /** Прокси-загрузка внешнего файла для архивации
     * @param {number} url - URL файла */
    static async downloadExternalFile(url) {
        return this.request(`http://${serverUrl}/api/download-external`, {
            method: 'POST',
            body: JSON.stringify({ url }),
            isBlob: true // Указываем, что ожидаем файл (blob)
        });
    }
}