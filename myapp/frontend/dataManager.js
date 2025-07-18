import { serverUrl } from './config.js';

/**
 * можем использовать этот файл 'dataManager.js как централизованное место для всех API запросов, возможно, добавив туда функции из main*.js
 */

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

    static async fetchNotesZp(id) {  // GET запрос на получение всех записей из одного журнала предложений по id журнала
        return this.fetchData(`http://${serverUrl}/api/zp/${id}`);
    }

    static async fetchCountNotesInZp() {  // GET запрос на получение количества записей в ЖП
        return this.fetchData(`http://${serverUrl}/api/zpCount`);
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


    static async updateZp(id, data, username) {  // PUT запрос на обновление ЖП
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

    static async updateNoteZp(noteId, data, username) {  // PUT запрос на обновление записи в ЖП
        const response = await fetch(`http://${serverUrl}/api/noteZp/${noteId}`, {
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

    static async createZp(data, username) {  // POST запрос на создание нового ЖП
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

    static async createNoteZp(id, data, username) {  // POST запрос на создание записи в ЖП
        // id - ЖП; data - данные из формы; username - имя пользователя авторизированного
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

    static async deleteZp(id, username) {  // DELETE запрос на удаление ЖП
        const response = await fetch(`http://${serverUrl}/api/zp/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Username': username // Передача имени пользователя в заголовке
            },
        });
        return response.json();
    }

    static async deleteNoteZp(noteId, username) {  // DELETE запрос на удаление записи в ЖП
        const response = await fetch(`http://${serverUrl}/api/noteZp/${noteId}`, {
            method: 'DELETE',
            headers: {
                'X-Username': username // Передача имени пользователя в заголовке
            },
        });
        return response.json();
    }
}