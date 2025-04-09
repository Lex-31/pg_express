import { serverUrl } from './config.js';

/** Класс для запросов к серверу
 * @method fetchData - универсальный метод для GET запросов к серверу
 * @method fetchCategories - GET запрос на получение категорий
 * @method fetchProducts - GET запрос на получение изделий
 * @method fetchProductById - GET запрос на получение изделия по id
 * @method updateProduct - PUT запрос на обновление изделия
 * @method createProduct - POST запрос на создание изделия
 * @method deleteProduct - DELETE запрос на удаление изделия */
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

    static async updateProduct(id, data) {  // PUT запрос на обновление изделия
        const response = await fetch(`http://${serverUrl}/api/main/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async createProduct(data) {  // POST запрос на создание изделия
        const response = await fetch(`http://${serverUrl}/api/main`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async deleteProduct(id) {  // DELETE запрос на удаление изделия
        const response = await fetch(`http://${serverUrl}/api/main/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}