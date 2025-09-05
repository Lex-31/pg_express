import { DataManager } from './dataManager.js';
import {
    openModal,
    closeModal,
    addCloseEventListeners
} from './shared/modalUtils.js';

/** Парсит JWT токен из localStorage и возвращает массив прав пользователя.
 * @returns {string[]} Массив прав (permissions) или пустой массив, если токен не найден или некорректен */
function getUserPermissions() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return [];
    try {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        console.log(payload);

        return payload.permissions || [];
    } catch (error) {
        console.error('Ошибка при парсинге JWT токена:', error);
        return [];
    }
}

/** Функция для обновления UI в зависимости от статуса авторизации
 * @description функция будет отвечать исключительно за скрытие/отображение формы логина, информации о пользователе и кнопки "Добавить новое" на основе наличия JWT токена в localStorage */
function updateAuthUI() {
    const jwtToken = localStorage.getItem('jwtToken');
    const permissions = getUserPermissions(); // Получаем массив прав
    const loginFormContainer = document.getElementById('react-login-form-container');
    const userInfoContainer = document.getElementById('user-info-container');
    const loggedInUserInfo = document.getElementById('logged-in-user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const newBtn = document.getElementById('new-btn');

    if (jwtToken) {    // Пользователь авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'none'; //скрываем форму входа

        const username = localStorage.getItem('username'); // Берем из localStorage
        const userEmail = localStorage.getItem('userEmail'); // Берем из localStorage

        if (userInfoContainer && loggedInUserInfo && logoutBtn) { //если на старнице html есть нужные элементы, то показывать инфо о пользователе и кнопку выхода из профиля
            loggedInUserInfo.textContent = `Вошел как: ${username} (${userEmail})`; //подстановка данных о пользователе из localstorage
            userInfoContainer.style.display = 'block'; //отображать контейнер с инфо пользователя и кнопкой выхода
            if (!logoutBtn.dataset.listenerAttached) { // проверяем что нет обработчика на кнопке выхода
                logoutBtn.addEventListener('click', handleLogout);
                logoutBtn.dataset.listenerAttached = 'true'; // Помечаем, что обработчик навешен
            }
        }

        if (newBtn) {
            // newBtn.style.display = 'block';
            newBtn.style.display = permissions.includes('create_entries') ? 'block' : 'none'; // отображаем кнопку Добавить новое если есть права create_entries
        }
    } else {    // Пользователь не авторизован
        if (loginFormContainer) loginFormContainer.style.display = 'block'; // оборажаем форму входа
        if (userInfoContainer) userInfoContainer.style.display = 'none'; // не отображать контейнер с инфо пользователя и кнопкой выхода
        if (newBtn) newBtn.style.display = 'none'; // не отображаем кнопку Добавить новое
        if (logoutBtn && logoutBtn.dataset.listenerAttached) {  // Удаляем обработчик выхода, если он был навешен
            logoutBtn.removeEventListener('click', handleLogout);
            logoutBtn.dataset.listenerAttached = '';
        }
        document.getElementById('table-body').innerHTML = ''; // Очищаем таблицу, если пользователь не авторизован
    }
}

/** Функция, которая будет вызвана после успешного входа
 * @param userData объект с данными о пользователе, взятыми из JWT токена */
function handleLoginSuccess(userData) {
    if (userData && userData.username && userData.email) {  // Сохраняем данные пользователя в localStorage, если они зашифрованы в JWT токене
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userEmail', userData.email);
    } else {
        console.warn('LoginForm.jsx не передал данные пользователя (username и/или email в объекте userData) в handleLoginSuccess'); //debag
    }
    updateAuthUI(); // Обновляем UI
    loadData();     // Загружаем данные (если нужно обновить после входа)
}

/** Функция, которая будет вызвана при выходе пользователя
 * @description Очищает токен JWT, username и userEmail */
function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    updateAuthUI(); // Обновляем UI
}

/** Восстановление состояния кнопки из LocalStorage */
function restoreToggleState() {
    const toggleBtn = document.getElementById('toggle-doc-btn');
    const savedState = localStorage.getItem('docToggleState');
    if (savedState === 'docs') { //отображаем документацию
        toggleBtn.textContent = 'ОКПД, ОКВЭД'; //установка текста кнопки
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = 'none'); //скрываем ОКПД, ОКВЭД
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = ''); //отображаем документацию
    } else { //если savedState === 'codes', отображаем ОКПД, ОКВЭД
        toggleBtn.textContent = 'Документация'; //установка текста кнопки
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = ''); //отображаем ОКПД, ОКВЭД
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = 'none'); //скрываем документацию
    }
}

/** Функция создает ссылку и раскрашивает документы, есть ссылка - зеленый, нет ссылки - красный
 * @param {*} docs массив документов для конкретной записи
 * @returns возвращает HTML код раскрашенных ссылок на прикрепленные документы */
function formatDocs(docs) {
    return docs.map(doc => {
        // const encodedLink = doc.doc_link // ссылка формата как она хранится  в БД \\fs3\Производственный архив центрального офиса\ЕИУС.468622.001_ППСЦ\ЭД\ЕИУС.468622.001 ПС  ППСЦ  изм.2.pdf
        const link = doc.doc_link
            ? `<a href="${doc.doc_link}" data-link="${doc.doc_link}" class="link-to-doc" style="color: green;" target="_blank">${doc.doc_name}</a>`
            : `<span style="color: red;">${doc.doc_name}</span>`; //ссылка существует - зеленый цвет выбираем, отсутвует - красный
        return link; //возвращает в новый массив(map) готовых HTML ссылок
    }).join(' '); //массив готовых HTML ссылок преобразовывает в строку где ссылки разделены пробелом
}

/** добавление нового поля для документа. ***можно поле docName заполнять по умолчанию например NONE
 * @param docName название документа сокращенно
 * @param docLink ссылка на документ */
function addDocField(docName = '', docLink = '') {
    const docContainer = document.getElementById('doc-container');
    const docDiv = document.createElement('div');
    docDiv.classList.add('doc-field');
    docDiv.innerHTML = `
        <input type="text" class="doc-name" value="${docName}" placeholder="Название документа" required>
        <input type="text" class="doc-link" value="${docLink}" placeholder="Ссылка на документ">
        <button type="button" class="remove-doc-btn">Удалить</button>
    `;
    docContainer.append(docDiv);
    docDiv.querySelector('.remove-doc-btn').addEventListener('click', () => { //на кнопку "Удалить" документ - вешаем событие удаление строчки документа
        docContainer.removeChild(docDiv); //removeChild верно работает, remove некорректно работает
    });
}

/** Асинхронная функция делает GET запрос к БД, загружает данные конкретной записи по id в форму для редактирования
 * @param {*} id идентификатор записи */
async function openEditForm(id) {
    try {
        const permissions = getUserPermissions(); // Получаем массив прав
        const data = await DataManager.fetchProductById(id);  // заполнение формы параметра изделия из БД
        const categories = await DataManager.fetchCategories(); // заполнение выпадающего списка категорий

        document.getElementById('new-id').textContent = data.id;
        document.getElementById('new-item_number').value = data.item_number.slice(-1)[0];
        document.getElementById('new-prod_name').value = data.prod_name;
        document.getElementById('new-prod_mark').value = data.prod_mark;
        document.getElementById('new-prod_number').value = data.prod_number;
        document.getElementById('new-prod_okpd').value = data.prod_okpd;
        document.getElementById('new-prod_okved').value = data.prod_okved;
        document.getElementById('new-prod_dir').value = data.prod_dir || '';

        // Заполнение выпадающего списка категорий
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
        if (data.docs) {
            data.docs.forEach(doc => addDocField(doc.doc_name, doc.doc_link));
        }

        // Настройка кнопок в зависимости от прав
        const submitBtn = document.getElementById('form-submit-btn'); //кнопка изменения записи "Обновить"
        const deleteBtn = document.getElementById('form-delete-btn'); //кнопка удаления записи "Удалить"

        if (permissions.includes('edit_entries_full')) { // есть права на редактирование
            submitBtn.style.display = 'block';
            submitBtn.textContent = 'Обновить';
            submitBtn.onclick = () => updateRow(id);
        } else { //нет прав на редактирование
            submitBtn.style.display = 'none'; //скрываем кнопку
        }

        if (permissions.includes('edit_entries_full')) { // есть права на удаление
            deleteBtn.style.display = 'block';
            deleteBtn.onclick = () => deleteRow(id);
        } else { //нет прав на удаление
            deleteBtn.style.display = 'none'; //скрываем кнопку
        }

        openModal('new-form-container');

    } catch (error) {
        console.error('Ошибка при открытии формы редактирования:', error);
        alert(error.message || 'Не удалось получить данные для редактирования.');
    }
}

/** Асинхронная функция делает GET запрос к БД, загружает данные с сервера и обновляет таблицу */
async function loadData() {
    if (!localStorage.getItem('jwtToken')) return; // Если пользователь не авторизован, то ничего не делаем

    try {
        const [categories, products] = await Promise.all([  //ускоренная асинхронная обработка
            DataManager.fetchCategories(),  // Загрузка всех категорий
            DataManager.fetchProducts()  // Загрузка изделий
        ]);

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Очистка таблицы перед загрузкой данных

        const jwtToken = localStorage.getItem('jwtToken'); // Получаем токен один раз перед циклом для эффективности

        categories.forEach(category => {  //проходимся по всем категориям
            const categoryCode = category.category_id.join('.');
            const categoryRow = document.createElement('tr');
            categoryRow.innerHTML = `
            <td colspan="6" class="category_item">${categoryCode} ${category.category_name}</td>
        `;
            tableBody.append(categoryRow);

            const categoryItems = products.filter(item => JSON.stringify(item.category_code) === JSON.stringify(category.category_id));  //сравниваем изделия и категории по колонке массива чисел

            categoryItems.forEach(item => { //заполнение строк таблицы изделий
                const tr = document.createElement('tr');
                // tr.setAttribute('data-id', item.id);
                tr.dataset.id = item.id; //соверменный вариант добавления data аттрибута
                tr.innerHTML = `
                <td>${item.item_number.join('.')}</td>
                <td>${item.prod_name}</td>
                <td>${item.prod_mark}</td>
                <td>${item.prod_number}</td>
                <td class="okpd-okved-col">${item.prod_okpd}</td>
                <td class="okpd-okved-col">${item.prod_okved}</td>
                <td class="doc-col ${item.prod_dir === '' ? 'fail-dir' : ''}" style="display: none;">${item.docs ? formatDocs(item.docs) : ''}</td >
            `;

                if (jwtToken) {   // Навешиваем обработчики для редактирования и контекстного меню только если пользователь авторизован
                    tr.addEventListener('dblclick', () => openEditForm(item.id)); // двойной клик левой кнопкой мыши для редактирования позиции
                    tr.addEventListener('contextmenu', (event) => { //клик правой кнопкой мыши для кастомного контекстного меню
                        if (!event.target.closest('a')) { // на ссылках оставляем дефолное выпадающее меню
                            event.preventDefault(); //на остальном контенте...
                            showContextMenu(event, item); //...открываем кастомное выпадающее меню, event - для позиционирования меню рядом с кликом, item - объект с данными о кликнутом изделии
                        }
                    });
                }
                tableBody.append(tr);
            });
        });

        restoreToggleState();
        addLinkHandlers();
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        alert(error.message || 'Не удалось загрузить данные. Проверьте консоль для получения дополнительной информации.');
    }
}

/** Функция возвращает данные из формы
 * @return {Object} объект с данными из формы */
function getFormData() {
    const category_id = document.getElementById('new-category_id').value.split(',').map(Number);  //"1,1" -> [1, 2]. Выбираем HTML элемент <select>(выпадающ. список катег.), value - берем значение "1,1" выбранного option, split - разделяем строку на массив подстрок ("1,2,3" -> ["1", "2", "3"]) используя разделитель ",", map - каждое значение массива строк ["1", "2", "3"] преобразуется в массив чисел [1, 2, 3]
    const item_number = document.getElementById('new-item_number').value; //порядковый номер изделия из формы
    const docFields = document.querySelectorAll('.doc-field');
    const docs = Array.from(docFields).map(field => {
        const docName = field.querySelector('.doc-name').value;
        const docLink = field.querySelector('.doc-link').value;
        return [docName, docLink]; // Отправляем как массив строк
    });

    return {
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
}

/** Асинхронная функция, отправляет POST запрос на сервер для создания новой записи */
async function createRow() {
    const data = getFormData(); // Данные из формы
    if (!data) return;

    try {
        await DataManager.createProduct(data); // POST запрос на создание изделия
        closeModal('new-form-container'); // Закрываем модальное окно
        document.getElementById('new-form').reset(); // Сброс формы
        loadData();
    } catch (error) {
        console.error('Ошибка при создании записи:', error);
        alert(error.message || 'Не удалось создать запись.');
    }
}

/** Асинхронная функция отправляет PUT запрос на сервер с обновленными данными записи
 * @param {*} id идентификатор записи */
async function updateRow(id) {
    const data = getFormData(); // Данные из формы
    if (!data) return;

    try {
        await DataManager.updateProduct(id, data); // Отправляем PUT запрос на сервер для обновления записи
        closeModal('new-form-container'); // Закрываем модальное окно
        document.getElementById('new-form').reset(); // Сброс формы
        loadData();  // обновление списка записей
    } catch (error) {
        console.error('Ошибка при обновлении записи:', error);
        alert(error.message || 'Не удалось обновить запись.');
    }
}

/** Асинхронная функция, удаляет запись из БД
 * @param {*} id идентификатор записи */
async function deleteRow(id) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

    try {
        await DataManager.deleteProduct(id); // Отправляем DELETE запрос на сервер для удаления записи
        closeModal('new-form-container'); // Закрываем модальное окно
        loadData();
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        alert(error.message || 'Не удалось удалить запись.');
    }
}

// Проверка состояния авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI(); // Обновляем UI

    if (window.renderLoginForm) { // Проверяем, импортирована ли функция renderLoginForm через глобальный объект window
        window.renderLoginForm('react-login-form-container', handleLoginSuccess); // Вызов функции для рендеринга формы входа React. Вызываем импортированную глобально функцию из embed.js
    } else {
        console.error('Функция renderLoginForm не найдена. Убедитесь, что embed.js загружен.');
    }

    if (localStorage.getItem('jwtToken')) { // Пользователь авторизован
        loadData(); // загружаем данные при загрузке страницы
    }

    document.getElementById('toggle-doc-btn').addEventListener('click', () => {  // Обработчик для кнопки "ОКПД, ОКВЭД / Документация"
        const toggleBtn = document.getElementById('toggle-doc-btn'); //берем кнопку переключения
        const isDocsVisible = toggleBtn.textContent === 'ОКПД, ОКВЭД';
        localStorage.setItem('docToggleState', isDocsVisible ? 'codes' : 'docs');
        restoreToggleState(); // Восстанавливаем состояние кнопки
    });

    document.getElementById('new-btn').addEventListener('click', async () => { // Обработчик для кнопки "Добавить новое"
        document.getElementById('new-form').reset(); //сбрасываем все input в форме
        document.getElementById('doc-container').innerHTML = ''; //сбрасываем список документации
        document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow;
        document.getElementById('form-delete-btn').style.display = 'none'; // Скрыть кнопку удаления при создании

        try {
            const categories = await DataManager.fetchCategories();  // Загрузка всех категорий
            const select = document.getElementById('new-category_id');
            select.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option'); //внутри выпадающего списка select создаем элементы списка option
                option.value = category.category_id;
                option.textContent = `${category.category_id.join('.')} ${category.category_name}`;
                select.append(option);  // в HTML элемент select вставляем весь список категорий option
            });
            openModal('new-form-container'); // Используем функцию из modalUtils.js для открытия модального окна
        } catch (error) {
            console.error('Ошибка при загрузке категорий для формы:', error);
            alert(error.message || 'Не удалось загрузить категории.');
        }
    });

    document.getElementById('add-doc-btn').addEventListener('click', () => { //когда нажимем по кнопке "Добавить документ"
        addDocField();
    });
    addCloseEventListeners('new-form-container', '#form-close-btn', '.modal-backdrop'); // Добавление обработчика клика по фону модального окна и кнопке закрытия
});


/** Функция навешивания ссылок документации */
function addLinkHandlers() {
    document.querySelectorAll('.link-to-doc').forEach(link => { // обработчик событий для ссылок документации
        const filePath = link.getAttribute('data-link'); // ссылка на документ вида \\fs3\...
        if (filePath && filePath.startsWith('\\')) { //если ссылка существует и это ссылка на локальный ресурс \\fs3...
            //пример файла из БД "\\fs3\Производственный архив центрального офиса\ЕИУС.468622.001_ППСЦ\ЭД\ЕИУС.468351.101 ТУ.pdf"
            //пример файла на сервере "/data/folder1/ЕИУС.468622.001_ППСЦ/ЭД/ЕИУС.468351.101 ТУ.pdf"

            // Удаляем старый обработчик, чтобы избежать дублирования
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);

            newLink.addEventListener('click', async (event) => {
                event.preventDefault(); //не будем пытаться открыть этот ресурс в новой вкладке
                try {
                    const data = await DataManager.fetchFileUrl(filePath); //получаем ссылку для доступа к файлу
                    window.open(data.url, '_blank'); //получаем ссылку на локльный ресурс, открываем файл в новой вкладке
                } catch (error) {
                    // }).catch(error => console.error('Error fetching the PDF:', error));
                    console.error('Error fetching the PDF URL:', error);
                    alert('Не удалось открыть файл: ' + error.message);
                }
            });
        }
    });
}

/** Функция для отображения контекстного меню
 * @param event событие клика правой кнопкой мыши, координаты клика
 * @param item данные об изделии из БД */
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

/** Асинхронная функция для архивирования документов
 * @param {*} item данные об изделии из БД */
async function archiveDocs(item) {
    const docs = item.docs; //массив объектов на каждый из документов(doc_name + doc_link)
    if (!docs || docs.length === 0) { //проверка на существования документов
        alert('Для этого элемента нет документов.');
        return;
    }

    console.log('Начало архивации, документы: ', docs);
    const zip = new JSZip(); // Создаем экземпляр ZIP-архива

    const filesPromises = docs.map(async (doc) => { //Загружаем все файлы асинхронно
        if (!doc.doc_link) return null;

        try {
            let blob;
            const originalLink = doc.doc_link;

            // Проверяем, является ли ссылка локальной
            if (originalLink.startsWith('\\')) { //если это локальная ссылка
                const { url } = await DataManager.fetchFileUrl(originalLink); // Получаем временную ссылку на локальный файл с пробелами 'http://${serverUrl}/data/folder1/ЕИУС.468622.001_ППСЦ/ЭД/ЕИУС.468622.001 ПС  ППСЦ  изм.2.pdf'
                const response = await fetch(url); // Загружаем файл по полученному URL (URL временный и не требует auth)

                if (!response.ok) throw new Error(`Ошибка загрузки ${url}: ${response.status}`); //если файл не загрузился показываем ошибку

                blob = await response.blob(); //Получаем бинарные данные как Blob 
            } else { //если это внешняя ссылка
                blob = await DataManager.downloadExternalFile(originalLink); //Получаем бинарные данные как Blob. Для внешних ссылок используем прокси-метод
            }

            const filename = `${doc.doc_name || 'document'}.${blob.type.split('/')[1] || 'bin'}`; //формируем имя файла
            console.log('filename: ', filename);

            zip.file(filename, blob, { binary: true }); //Добавляем в архив (БЕЗ вложенных папок)
            console.log(`Добавлен файл: ${filename} (${blob.size} байт)`);

        } catch (error) {
            console.error(`Ошибка обработки файла: ${doc.doc_name}:`, error);
            // Не прерываем весь процесс, просто пропускаем ошибочный файл
        }
    });

    await Promise.all(filesPromises);     // Ждем завершения всех загрузок

    if (Object.keys(zip.files).length === 0) {     //Проверяем есть ли файлы в архиве
        alert('Нет файлов для архивации');
        return;
    }

    const blob = await zip.generateAsync({     // Генерируем архив
        type: 'blob',
        compression: 'DEFLATE', // Сжатие для уменьшения размера
        compressionOptions: { level: 9 } // Максимальное сжатие
    });

    const url = URL.createObjectURL(blob);     // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${item.prod_number}_${item.prod_mark}_${item.prod_name}.zip`; // Уникальное имя
    document.body.appendChild(a);
    a.click();

    a.remove();   // Уборка
    URL.revokeObjectURL(url);

    console.log('Архив успешно создан');
    console.log(`'${item.prod_number}'_'${item.prod_mark}'_'${item.prod_name}'`);
}

/** Асинхронная функция показа содержимого директории изделия
 * @param {*} directoryUrl путь директории на сервере, например: \\fs3\Технический архив\ЕИУС.468622.001_ППСЦ\ЭД */
async function openDirectoryModal(directoryUrl) { // directoryUrl === \\fs3\Технический архив\ЕИУС.468622.001_ППСЦ\ЭД
    const modal = document.getElementById('directory-modal');
    const modalContent = document.getElementById('directory-content');
    const backdrop = document.querySelector('.modal-backdrop');

    // Функция для рекурсивного отображения содержимого директории
    const displayDirectoryContent = async (path, parentElement) => {
        try {
            const files = await DataManager.fetchDirectory(path); //возвращает названия файлов/директори в json [{name: '1.pdf', isDirectory: false}, {name: 'directory', isDirectory: true}, ...]
            files.forEach(file => {
                if (file.name === 'Thumbs.db') return; //файлы которые ненадо показывать

                const fileElement = document.createElement('div'); //заготавливаем обертку для файла или директории
                const fileElementName = document.createElement('p'); //заготавливаем параграф для название файла или директории
                fileElementName.textContent = file.name;
                fileElement.append(fileElementName); //вставляем параграф в обертку

                if (file.isDirectory) { //если это директория
                    fileElement.classList.add('directory');
                    fileElementName.addEventListener('click', async () => { //добавляем обработчик клика
                        const subDirectoryPath = `${path}\\${file.name}`; //путь к этой директории
                        if (fileElement.classList.contains('expanded')) {
                            // Удаляем содержимое, если директория уже раскрыта
                            const allDivs = fileElement.querySelectorAll('div'); //выбираем все дочерние div элементы
                            if (allDivs) { allDivs.forEach(div => div.remove()); } //удаляем их
                            fileElement.classList.remove('expanded');
                        } else {
                            await displayDirectoryContent(subDirectoryPath, fileElement);
                            fileElement.classList.toggle('expanded');
                        }
                    });
                } else { //если это файл
                    fileElement.classList.add('file');
                    fileElement.setAttribute('data-link', path + '/' + file.name);
                    fileElementName.addEventListener('click', async () => { //добавляем обработчик клика
                        try {
                            const { url } = await DataManager.fetchFileUrl(`${path}\\${file.name}`); //получаем временный URL для доступа к файлу
                            window.open(url, '_blank'); //открываем файл в новом окне
                        } catch (error) {
                            console.error('Ошибка при открытии файла:', error);
                            alert('Не удалось открыть файл: ' + error.message);
                        }
                    });
                }
                parentElement.appendChild(fileElement);
            });
        } catch (error) {
            console.error(error);
            parentElement.textContent = 'Ошибка загрузки содержимого директории';
            alert(error.message);
        }
    };

    modal.style.display = 'block';
    backdrop.style.display = 'block';

    modalContent.innerHTML = ''; //очищаем модальное окно
    await displayDirectoryContent(directoryUrl, modalContent); //рекурсовно вызываем эту же функцию для отображения содержимого директории

    document.querySelector('#directory-modal .close-button').onclick = () => {   // Закрытие модального окна по клику на крестик .close-button
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    };
}