import { DataManager } from './dataManager.js';
import { EventManager } from './eventManager2.js';
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

// Проверка состояния авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        document.getElementById('auth-btn').textContent = 'Выход';
        document.getElementById('new-btn').style.display = 'block';
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

async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу
    // const categories = await DataManager.fetchCategories();  // Загрузка всех категорий
    // const products = await DataManager.fetchProducts();  // Загрузка изделий
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
        `;

        if (document.getElementById('auth-btn').textContent === 'Выход') {
            itemZpRow.addEventListener('dblclick', () => openEditForm(itemZp.id)); // двойной клик левой кнопкой мыши должны открывать станицу конкретного ЖП
        }

        itemZpRow.addEventListener('contextmenu', (event) => { //клик правой кнопкой мыши
            event.preventDefault();
            showContextMenu(event, itemZp); //...открываем кастомное выпадающее меню, event - для позиционирования меню рядом с кликом, itemZp - объект с данными о кликнутом изделии

        });

        tableBody.append(itemZpRow); //вставляем в строку таблицы ячейки
    });
}

async function openEditForm(id) { //GET запрос загружает данные конкретной записи по id 
    const data = await DataManager.fetchProductById(id);

    document.getElementById('new-id').textContent = data.id;
    document.getElementById('new-item_number').value = data.item_number.slice(-1)[0];
    document.getElementById('new-prod_name').value = data.prod_name;
    document.getElementById('new-prod_mark').value = data.prod_mark;
    document.getElementById('new-prod_number').value = data.prod_number;
    document.getElementById('new-prod_okpd').value = data.prod_okpd;
    document.getElementById('new-prod_okved').value = data.prod_okved;
    document.getElementById('new-prod_dir').value = data.prod_dir || '';
    // Заполнение выпадающего списка категорий
    const categories = await DataManager.fetchCategories();
    const select = document.getElementById('new-category_id'); //поле <select> формы "Категория:"
    select.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;  //значение опции = массив [1,1] конктреной категории из табл. категорий
        option.textContent = `${category.category_id.join('.')} ${category.category_name}`;  //текст внутри опции = "1.1 Название этой категории"
        if (JSON.stringify(category.category_id) === JSON.stringify(data.category_id)) {  //если значение категории в категории и у изделия одинаковы [1,1] === [1,1]
            option.selected = true;  //делаем эту опцию(категорию) выбранной при открытии формы
        }
        select.append(option);
    });

    // Заполнение полей документации
    const docContainer = document.getElementById('doc-container'); //контейнер для полей документации в форме
    docContainer.innerHTML = '';
    data.docs.forEach(doc => {
        addDocField(doc.doc_name, doc.doc_link);
    });

    document.getElementById('form-submit-btn').textContent = 'Обновить';
    document.getElementById('form-submit-btn').onclick = () => updateRow(id);
    document.getElementById('form-delete-btn').onclick = () => deleteRow(id);
    document.getElementById('new-form-container').style.display = 'block';
    document.querySelector('.modal-backdrop').style.display = 'block';
}

/**добавление нового поля для документа. ***можно поле docName заполнять по умолчанию например NONE
 * @param docName название документа сокращенно
 * @param docLink ссылка на документ*/
function addDocField(docName = '', docLink = '') {
    const docContainer = document.getElementById('doc-container');
    const docDiv = document.createElement('div');
    docDiv.classList.add('doc-field');
    docDiv.innerHTML = `
        <input type="text" class="doc-name" value="${docName}" required>
        <input type="text" class="doc-link" value="${docLink}">
        <button type="button" class="remove-doc-btn">Удалить</button>
    `;
    docContainer.append(docDiv);
    const removeBtn = docDiv.querySelector('.remove-doc-btn');
    removeBtn.addEventListener('click', () => { //на кнопку "Удалить" документ - вешаем событие удаление строчки документа
        docContainer.removeChild(docDiv); //removeChild верно работает, remove некорректно работает
    });
}

async function updateRow(id) { //Отправляет PUT запрос на сервер с обновленными данными
    const category_id = document.getElementById('new-category_id').value.split(',').map(Number);   //"1,1" -> [1, 2]. Выбираем HTML элемент <select>(выпадающ. список катег.), value - берем  значение "1,1" выбранного option, split - разделяем строку на массив подстрок ("1,2,3" -> ["1", "2", "3"]) используя разделитель ",", map - каждое значение массива строк ["1", "2", "3"] преобразуется в массив чисел [1, 2, 3]
    const item_number = document.getElementById('new-item_number').value; //порядковый номер изделия из формы
    const docFields = document.querySelectorAll('.doc-field'); //выбрать все строки с документами в форме изделия
    const docs = Array.from(docFields).map(field => {
        const docName = field.querySelector('.doc-name').value;
        const docLink = field.querySelector('.doc-link').value;
        return [docName, docLink];
    });
    const data = {
        category_id,
        item_number: [...category_id, Number(item_number)],
        prod_name: document.getElementById('new-prod_name').value,
        prod_mark: document.getElementById('new-prod_mark').value,
        prod_number: document.getElementById('new-prod_number').value,
        prod_okpd: document.getElementById('new-prod_okpd').value,
        prod_okved: document.getElementById('new-prod_okved').value,
        docs,
        prod_dir: document.getElementById('new-prod_dir').value
    };

    // Извлечение имени пользователя
    const username = localStorage.getItem('username') || 'anonymous';

    await DataManager.updateProduct(id, data, username); // Отправляем PUT запрос на сервер для обновления записи
    document.getElementById('form-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    loadData();
}

//удаление позиции по id
async function deleteRow(id) {

    // Извлечение имени пользователя
    const username = localStorage.getItem('username') || 'anonymous';

    await DataManager.deleteProduct(id, username); // Отправляем DELETE запрос на сервер для удаления записи
    document.getElementById('form-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    loadData();
}

export async function createRow() { //Отправляет POST запрос на сервер для создания нового ЖП
    const data = {
        id: document.getElementById('new-id').value,
        zp_name: document.getElementById('new-zp_name').value
    };

    // Извлечение имени пользователя
    const username = localStorage.getItem('username') || 'anonymous';

    await DataManager.createItemZp(data, username); // POST запрос на создание изделия
    document.getElementById('form-close-btn').click(); // Программно вызываем событие нажатия на кнопку закрытия формы "Отмена"
    loadData();
}

// Загрузка данных при загрузке страницы
loadData();
// Навешивание событий на элементы управления (конпку создания новой записи)
EventManager.addEventListeners();


/** Функция для отображения контекстного меню
 * @param event событие клика правой кнопкой мыши, координаты клика
 * @param item данные об изделии из БД*/
function showContextMenu(event, item) {

    // удаление предыдущего контекстного меню
    const context_menu = document.querySelector('.context-menu')
    if (context_menu) { context_menu.remove(); }

    //создание текущего контекстного меню
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.innerHTML = `
        <ul>
            <li class="context-menu-item" id="archive-docs" data-action="archive">Архивировать документацию</li>
            <li class="context-menu-item" id="dir-docs" data-action="archive">Папка с документацией</li>
        </ul>
    `;
    document.body.appendChild(contextMenu); //добавляем построенное всплывающее меню
    contextMenu.style.left = `${event.pageX}px`; //позиционируем рядом с кликом
    contextMenu.style.top = `${event.pageY}px`;

    // Обработка выбора пункта меню "Архивировать документацию"
    contextMenu.querySelector('#archive-docs').addEventListener('click', () => { //событите на кнопку из всплывающего меню "Архивировать документацию"
        archiveDocs(item); //архивирования документов на кликнутое правой кнопкой изделие
        contextMenu.remove(); //удаление вспл меню
    });
    // Обработка выбора пункта меню "Папка с документацией"
    contextMenu.querySelector('#dir-docs').addEventListener('click', async () => { //событите на кнопку из всплывающего меню "Архивировать документацию"
        console.log('Папка с документацией'); //здесь надо открывать директорию, которая сохранена в БД, и доступна в этом файле через объект item.dir-doc

        if (item.prod_dir) { //если есть ссылка на директорию
            openDirectoryModal(item.prod_dir); //открываем директорию, выводим модальное окно
        } else {
            alert('Нет адреса директории для изделия')
            console.error('Нет адреса директории для изделия');
        }

        contextMenu.remove(); //удаление вспл меню
    });
    // Удаление контекстного меню при клике вне его
    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) { contextMenu.remove(); }
    }, { once: true });
}