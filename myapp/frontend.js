async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу
    // Загрузка всех категорий
    const categories = await fetchCategories(); // [ {id: 1, category_id: [1, 1], category_name: 'Аппаратура для связи'}, {...}, ... ]
    // Загрузка изделий
    const response = await fetch('http://172.22.1.106/api/main');
    const data = await response.json(); // [ {id: 1, category_code: [1, 1], category_name: 'Аппаратура для связи', item_number: [1, 1, 1], prod_name: 'Пункт связи', prod_mark: "ППСЦ", prod_number: "ЕИУС,468622,001", prod_okpd: "26,30,23,170", prod_okved: "26,30,29", }, {...}, ... ]

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Очистка таблицы перед загрузкой данных

    categories.forEach(category => {  //проходимся по всем категориям
        const categoryCode = category.category_id.join('.');
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `
            <td colspan="6" class="category_item">${categoryCode} ${category.category_name}</td>
        `;
        tableBody.append(categoryRow);

        // Фильтрация изделий по текущей категории
        // JSON.stringify(item.category_id) === JSON.stringify(category.category_id)
        const categoryItems = data.filter(item => JSON.stringify(item.category_code) === JSON.stringify(category.category_id));  //сравниваем изделия и категории по колонке массива чисел

        categoryItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            tr.innerHTML = `
                <td>${item.item_number.join('.')}</td>
                <td>${item.prod_name}</td>
                <td>${item.prod_mark}</td>
                <td>${item.prod_number}</td>
                <td class="okpd-okved-col">${item.prod_okpd}</td>
                <td class="okpd-okved-col">${item.prod_okved}</td>
                <td class="doc-col" style="display: none;">${item.docs ? formatDocs(item.docs) : ''}</td >
        `;
            tr.addEventListener('dblclick', () => openEditForm(item.id)); // двойной клик левой кнопкой мыши
            tr.addEventListener('contextmenu', (event) => { //клик правой кнопкой мыши
                if (!event.target.closest('a')) { // на ссылках оставляем дефолное выпадающее меню
                    event.preventDefault(); //на остальном контенте...
                    showContextMenu(event, item); //...открываем кастомное выпадающее меню, event - для позиционирования меню рядом с кликом, item - объект с данными о кликнутом изделии
                }
            });
            tableBody.append(tr);
        });
    });

    // Восстановление состояния кнопки из LocalStorage
    const toggleBtn = document.getElementById('toggle-doc-btn');
    const savedState = localStorage.getItem('docToggleState');
    if (savedState === 'docs') {
        toggleBtn.textContent = 'ОКПД, ОКВЭД';
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = 'none');
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = '');
    } else { //если savedState === 'codes'
        toggleBtn.textContent = 'Документация';
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = '');
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = 'none');
    }

    document.querySelectorAll('.link-to-doc').forEach(link => { // обработчик событий для ссылок документации
        if (link.getAttribute('data-link').startsWith('\\')) { //если это ссылка на локальный ресурс \\fs3...
            //пример файла из БД "\\fs3\Производственный архив центрального офиса\ЕИУС.468622.001_ППСЦ\ЭД\ЕИУС.468351.101 ТУ.pdf"
            //пример файла на сервере "/data/folder1/ЕИУС.468622.001_ППСЦ/ЭД/ЕИУС.468351.101 ТУ.pdf"
            link.addEventListener('click', (event) => {
                event.preventDefault(); //не будем пытаться открыть этот ресурс в новой вкладке
                const filePath = link.getAttribute('data-link'); // ссылка на документ с локальной машины вида \\fs3\...
                console.log('filePath', filePath);

                fetch('http://172.22.1.106/api/get-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: filePath })
                }).then(response => {
                    if (response.ok) { return response.json(); } //ответ преобразовываем в JSON
                    throw new Error('Network response was not ok.');
                }).then(data => {
                    console.log('Ссылка на статический файл, который открывается в новой вкладке', data.url);
                    window.open(data.url, '_blank'); //получаем ссылку на локльный ресурс, открываем файл в новой вкладке
                }).catch(error => console.error('Error fetching the PDF:', error));
            });
        }
    });
}

function formatDocs(docs) { //создает ссылку и раскрашивает документы, есть ссылка - зеленый, нет ссылки - красный
    const stringLinks = docs.map(doc => {
        // const encodedLink = doc.doc_link ? doc.doc_link.replace(/ /g, '%20') : '';  //замена пробелов в ссылке на %20
        const encodedLink = doc.doc_link // ссылка формата как она хранится  в БД \\fs3\Производственный архив центрального офиса\ЕИУС.468622.001_ППСЦ\ЭД\ЕИУС.468622.001 ПС  ППСЦ  изм.2.pdf
        const link = encodedLink ? `<a href="${encodedLink}" data-link="${encodedLink}" class="link-to-doc" style="color: green;" target="_blank">${doc.doc_name}</a>` : `<span style="color: red;">${doc.doc_name}</span>`; //ссылка существует - зеленый цвет выбираем, отсутвует - красный
        return link; //возвращает в новый массив(map) готовых HTML ссылок
    }).join(' '); //массив готовых HTML ссылок преобразовывает в строку где ссылки разделены пробелом
    return stringLinks;
}

function openEditForm(id) { //GET запрос загружает данные конкретной записи по id 
    fetch(`http://172.22.1.106/api/main/${id}`) //сервер принимает как app.get('//test/:id'
        .then(response => response.json())
        .then(data => {
            document.getElementById('new-id').textContent = data.id;
            document.getElementById('new-item_number').value = data.item_number.slice(-1)[0];
            document.getElementById('new-prod_name').value = data.prod_name;
            document.getElementById('new-prod_mark').value = data.prod_mark;
            document.getElementById('new-prod_number').value = data.prod_number;
            document.getElementById('new-prod_okpd').value = data.prod_okpd;
            document.getElementById('new-prod_okved').value = data.prod_okved;
            // Заполнение выпадающего списка категорий
            fetchCategories().then(categories => {
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
        });
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

document.getElementById('add-doc-btn').addEventListener('click', () => { //когда нажимем по кнопке "Добавить документ"
    addDocField();
});

function updateRow(id) { //Отправляет PUT запрос на сервер с обновленными данными
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
        docs
    };
    fetch(`http://172.22.1.106/api/main/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(() => {
        closeForm();
        loadData();
    });
}

//удаление позиции по id
function deleteRow(id) {
    fetch(`http://172.22.1.106/api/main/${id}`, { method: 'DELETE', })
        .then(response => response.json())
        .then(() => {
            closeForm();
            loadData();
        });
}

function createRow() { //Отправляет POST запрос на сервер для создания новой записи
    const category_id = document.getElementById('new-category_id').value.split(',').map(Number);  //"1,1" -> [1, 2]. Выбираем HTML элемент <select>(выпадающ. список катег.), value - берем значение "1,1" выбранного option, split - разделяем строку на массив подстрок ("1,2,3" -> ["1", "2", "3"]) используя разделитель ",", map - каждое значение массива строк ["1", "2", "3"] преобразуется в массив чисел [1, 2, 3]
    const item_number = document.getElementById('new-item_number').value; //порядковый номер изделия из формы
    const docFields = document.querySelectorAll('.doc-field');
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
        docs
    };
    fetch('http://172.22.1.106/api/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(() => {
        closeForm();
        loadData();
    });
}

function closeForm() { //Скрывает форму и сбрасывает её поля после создания записи или отмены
    document.getElementById('new-form-container').style.display = 'none';
    document.querySelector('.modal-backdrop').style.display = 'none';
    document.getElementById('new-form').reset();
    document.getElementById('form-submit-btn').textContent = 'Создать';
    document.getElementById('form-submit-btn').onclick = createRow;
    document.getElementById('form-delete-btn').onclick = null;
    document.getElementById('doc-container').innerHTML = '';
}

async function fetchCategories() { //запрос списка категорий
    const response = await fetch('http://172.22.1.106/api/categories');
    return response.json();
}

function toggleDocumentation() { //рокировка колонок ОКПД ОКЭД и Документация, а так же изменения названия конпки. ***нужно сохранять состояние
    const okpdCols = document.querySelectorAll('.okpd-okved-col');
    const docCols = document.querySelectorAll('.doc-col');
    const toggleBtn = document.getElementById('toggle-doc-btn');

    if (toggleBtn.textContent === 'Документация') {
        toggleBtn.textContent = 'ОКПД, ОКВЭД';
        okpdCols.forEach(col => col.style.display = 'none');
        docCols.forEach(col => col.style.display = '');
        localStorage.setItem('docToggleState', 'docs');
    } else {
        toggleBtn.textContent = 'Документация';
        okpdCols.forEach(col => col.style.display = '');
        docCols.forEach(col => col.style.display = 'none');
        localStorage.setItem('docToggleState', 'codes');
    }
}

document.getElementById('new-btn').addEventListener('click', () => { //открывает форму при создании новой записи
    fetchCategories().then(categories => {  //cateroties = [ { category_id: [1,1], category_name: 'Аппаратура', id: 1 }, {...}, ... ]
        const select = document.getElementById('new-category_id');
        select.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');  //внутри выпадающего списка select создаем элементы списка option
            option.value = category.category_id;
            option.textContent = `${category.category_id.join('.')} ${category.category_name}`;
            select.append(option);  // в HTML элемент select вставляем весь список категорий option
        });
        document.getElementById('new-form-container').style.display = 'block';
        document.querySelector('.modal-backdrop').style.display = 'block';
        document.getElementById('form-submit-btn').textContent = 'Создать';
        document.getElementById('form-submit-btn').onclick = createRow;
        document.getElementById('form-delete-btn').onclick = null;
        document.getElementById('new-id').textContent = ''; //очищает значение ID при создании новой записи
        document.getElementById('doc-container').innerHTML = ''; //*** возможно ненужно, чтоб можно было копировать записи
    });
});

document.getElementById('toggle-doc-btn').addEventListener('click', toggleDocumentation);

// Загрузка данных при загрузке страницы
loadData();

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
            <li class="context-menu-item" data-action="archive">Архивировать документацию</li>
        </ul>
    `;
    document.body.appendChild(contextMenu); //добавляем построенное всплывающее меню
    contextMenu.style.left = `${event.pageX}px`; //позиционируем рядом с кликом
    contextMenu.style.top = `${event.pageY}px`;

    // Обработка выбора пункта меню
    contextMenu.querySelector('.context-menu-item').addEventListener('click', () => { //событите на кнопку из всплывающего меню "Архивировать документацию"
        archiveDocs(item); //архивирования документов на кликнутое правой кнопкой изделие
        contextMenu.remove(); //удаление вспл меню
    });
    // Удаление контекстного меню при клике вне его
    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) { contextMenu.remove(); }
    }, { once: true });
}

// Функция для архивирования документов
async function archiveDocs(item) {
    const docs = item.docs; //массив объектов на каждый из документов(doc_name + doc_link)
    console.log('Начало архивации, документы: ', docs);
    const zip = new JSZip(); // Создаем экземпляр ZIP-архива

    // Функция для получения расширения из URL
    const getFileExtension = (url) => {
        try {
            const cleanUrl = url.split('?')[0];  // Удаляем параметры запроса (всё после ?)
            const filename = cleanUrl.split('/').pop(); // Получаем имя файла из URL
            const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : null; // Извлекаем расширение

            console.log('Расширение файла по ссылке: ', ext);
            return ext || ''; // Возвращаем пустую строку если нет расширения
        } catch { return ''; }
    };

    // 1. Загружаем все файлы асинхронно
    const filesPromises = docs.map(async (doc) => {
        if (!doc.doc_link) return null;
        try {
            let response;
            let fileUrl = doc.doc_link; //исходная ссылка записанная в БД
            let finalFilename = doc.doc_name; // Определяем finalFilename заранее

            // Проверяем, является ли ссылка локальной
            if (fileUrl.startsWith('\\')) {
                // Запрашиваем URL для локального файла
                const pdfResponse = await fetch('http://172.22.1.106/api/get-pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: fileUrl })
                });

                if (pdfResponse.ok) {
                    const data = await pdfResponse.json();
                    fileUrl = data.url; //путь с пробелами 'http://172.22.1.106/data/folder1/ЕИУС.468622.001_ППСЦ/ЭД/ЕИУС.468622.001 ПС  ППСЦ  изм.2.pdf'
                    response = await fetch(fileUrl);  // Загружаем файл по полученному URL
                    if (!response.ok) {
                        console.error(`Ошибка загрузки ${fileUrl}: ${response.status}`);
                        return null;
                    }
                } else {
                    console.error(`Ошибка получения URL для ${fileUrl}`);
                    return null;
                }
            } else { //иначе это внешняя ссылка
                response = await fetch('http://172.22.1.106/api/download-external', { //запрашиваем файл через прокси-сервер
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: fileUrl })
                });
                if (!response.ok) {
                    console.error(`Ошибка загрузки ${fileUrl}: ${response.status}`);
                    return null;
                }
            }

            const fileExtension = getFileExtension(fileUrl); // Получаем расширение из URL .pdf

            if (fileExtension) {               // Удаляем существующее расширение в имени (если есть)
                // const baseName = finalFilename.replace(/\.[^/.]+$/, '_'); //меняем на _
                finalFilename = `${finalFilename}.${fileExtension}`; //формируем имя файла с расширением 'ПС.pdf'
            }

            const blob = await response.blob();             // 4. Получаем бинарные данные как Blob (из внешнего ресурса или из локального - одинаково)
            zip.file(finalFilename, blob, { binary: true });             // 5. Добавляем в архив (БЕЗ вложенных папок)
            console.log(`Добавлен файл: ${finalFilename} (${blob.size} байт)`);

        } catch (error) { console.error(`Ошибка обработки файла:`, error); }
    });

    await Promise.all(filesPromises);     // 6. Ждем завершения всех загрузок

    if (Object.keys(zip.files).length === 0) {     // 7. Проверяем есть ли файлы в архиве
        console.error('Нет файлов для архивации');
        alert('Нет файлов для архивации');
        return;
    }

    const blob = await zip.generateAsync({     // 8. Генерируем архив
        type: 'blob',
        compression: 'DEFLATE', // Сжатие для уменьшения размера
        compressionOptions: { level: 9 } // Максимальное сжатие
    });

    const url = URL.createObjectURL(blob);     // 9. Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${item.prod_number}_${item.prod_mark}_${item.prod_name}.zip`; // Уникальное имя
    document.body.appendChild(a);
    a.click();

    a.remove();   // 10. Уборка
    URL.revokeObjectURL(url);

    console.log('Архив успешно создан');
    console.log(`'${item.prod_number}'_'${item.prod_mark}'_'${item.prod_name}'`);
}