import { serverUrl } from './config.js';

/** Класс для запросов к серверу
 * @method fetchData - универсальный метод для GET запросов к серверу
 * @method fetchCategories - GET запрос на получение категорий
 * @method fetchProducts - GET запрос на получение изделий
 * @method fetchProductById - GET запрос на получение изделия по id
 * @method fetchItemsZp - GET запрос на получение всех журналов предложений
 * @method fetchNotesZp - GET запрос на получение записей из одного журнала предложений по id журнала
 * @method updateProduct - PUT запрос на обновление изделия
 * @method updateNoteZp - PUT запрос на обновление записи в ЖП
 * @method createProduct - POST запрос на создание изделия
 * @method createItemZp - POST запрос на создание нового ЖП
 * @method createNoteZp - POST запрос на создание записи в ЖП
 * @method deleteProduct - DELETE запрос на удаление изделия
 * @method deleteNoteZp - DELETE запрос на удаление записи в ЖП */
export class DataManager {
    static async fetchData(url) {  // универсальный метод для GET запросов к серверу
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    static async fetchCategories() {  // GET запрос на получение категорий
        return this.fetchData(`http://${serverUrl}/api/categories`);
    }

    static async fetchProducts() {  // GET запрос на получение изделий
        return this.fetchData(`http://${serverUrl}/api/main`);
    }

    static async fetchProductById(id) {  // GET запрос на получение изделия по id
        return this.fetchData(`http://${serverUrl}/api/main/${id}`);
    }

    static async fetchItemsZp() {  // GET запрос на получение всех журналов предложений
        return this.fetchData(`http://${serverUrl}/api/zp`);
    }

    static async fetchNotesZp(id) {  // GET запрос на получение записей из одного журнала предложений по id журнала
        return this.fetchData(`http://${serverUrl}/api/zp/${id}`);
    }

    static async updateProduct(id, data, username) {  // PUT запрос на обновление изделия
        const response = await fetch(`http://${serverUrl}/api/main/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username // Передача имени пользователя в заголовке
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async updateNoteZp(id, data, username) {  // PUT запрос на обновление записи в журнале предложений
        const response = await fetch(`http://${serverUrl}/api/zp/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username // Передача имени пользователя в заголовке
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async createProduct(data, username) {  // POST запрос на создание изделия
        const response = await fetch(`http://${serverUrl}/api/main`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username // Передача имени пользователя в заголовке
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async createItemZp(data, username) {  // POST запрос на создание нового журнале предложений
        const response = await fetch(`http://${serverUrl}/api/zp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username // Передача имени пользователя в заголовке
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async createNoteZp(id, data, username) {  // POST запрос на создание записи в журнале предложений
        const response = await fetch(`http://${serverUrl}/api/zp/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Username': username // Передача имени пользователя в заголовке
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async deleteProduct(id, username) {  // DELETE запрос на удаление изделия
        const response = await fetch(`http://${serverUrl}/api/main/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Username': username // Передача имени пользователя в заголовке
            },
        });
        return response.json();
    }

    static async deleteNoteZp(id, username) {  // DELETE запрос на удаление записи в журнале предложений
        const response = await fetch(`http://${serverUrl}/api/zp/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Username': username // Передача имени пользователя в заголовке
            },
        });
        return response.json();
    }
}