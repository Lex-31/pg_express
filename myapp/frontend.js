async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу

    // Загрузка всех категорий
    const categories = await fetchCategories(); // [ {id: 1, category_id: [1, 1], category_name: 'Аппаратура для связи'}, {...}, ... ]

    // Загрузка изделий
    const response = await fetch('http://172.22.1.100/api/test');
    const data = await response.json(); // [ {id: 1, category_code: [1, 1], category_name: 'Аппаратура для связи', item_number: [1, 1, 1], prod_name: 'Пункт связи', prod_mark: "ППСЦ", prod_number: "ЕИУС,468622,001", prod_okpd2: "26,30,23,170", prod_okved2: "26,30,29", }, {...}, ... ]

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
                <td class="okpd-okved-col">${item.prod_okpd2}</td>
                <td class="okpd-okved-col">${item.prod_okved2}</td>
                <td class="doc-col" style="display: none;">${item.docs ? formatDocs(item.docs) : ''}</td >
        `;
            tr.addEventListener('dblclick', () => openEditForm(item.id)); // двойной клик левой кнопкой мыши
            tr.addEventListener('contextmenu', (event) => { //клик правой кнопкой мыши
                if (!event.target.closest('a')) { // на ссылках оставляем дефолное выпадающее меню
                    event.preventDefault();
                    showContextMenu(event, item);
                }
            });
            tableBody.append(tr);
        });
    });

    // Восстановление состояния кнопки из LocalStorage
    const toggleBtn = document.getElementById('toggle-doc-btn');
    const savedState = localStorage.getItem('docToggleState');
    if (savedState === 'docs') {
        toggleBtn.textContent = 'ОКПД2, ОКВЭД2';
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = 'none');
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = '');
    } else { //если savedState === 'codes'
        toggleBtn.textContent = 'Документация';
        document.querySelectorAll('.okpd-okved-col').forEach(col => col.style.display = '');
        document.querySelectorAll('.doc-col').forEach(col => col.style.display = 'none');
    }

    document.querySelectorAll('.link-to-doc').forEach(link => { // обработчик событий для ссылок документации
        if (link.getAttribute('data-link').startsWith('\\')) { //если это ссылка на локальный ресурс file://
            link.addEventListener('click', (event) => {
                event.preventDefault(); //не будем пытаться открыть этот ресурс в новой вкладке
                const url = link.getAttribute('data-link'); // ссылка на документ с локальной машины вида \\fs3\...

                const textArea = document.createElement('textarea'); //временный элемент
                textArea.value = url;
                textArea.style.position = 'fixed'; //чтобы не было эффекта прокрутки страницы до конца документа
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select(); //делаем элемент с ссылкой выделенным
                document.execCommand('copy'); //копируем выделенный адрес ссылки в буфер
                document.body.removeChild(textArea); //удаляем временный элемент
                console.log('URL copied to clipboard using alternative method:', url);
                const newWindow = window.open('', '_blank'); //открываем новую вкладку
                console.log(newWindow);

                // Открываем новую вкладку и отправляем сообщение
                /*const newWindow = window.open('about:blank', '_blank');
                newWindow.onload = function() {
                    newWindow.postMessage({ type: 'COPY_URL', url: url }, '*');
                };*/

                /* //неработает
                newWindow.onload = function () {
                    newWindow.document.write(`
                        <body>Hello</body>
                        <script>
                        setTimeout(() => {
                            console.log(Hello);
                                            }, 5000);
                            document.addEventListener('DOMContentLoaded', function() {
                                alert('URL copied to clipboard: ${url}');
                            });
                        </script>
                    `);
                    newWindow.document.close();
                };*/

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

    // console.log(document.querySelector('.link-to-doc'));

    return stringLinks;
}


function openEditForm(id) { //GET запрос загружает данные конкретной записи по id 
    fetch(`http://172.22.1.100/api/test/${id}`) //сервер принимает как app.get('//test/:id'
        .then(response => response.json())
        .then(data => {

            document.getElementById('new-id').textContent = data.id;
            document.getElementById('new-item_number').value = data.item_number.slice(-1)[0];
            document.getElementById('new-prod_name').value = data.prod_name;
            document.getElementById('new-prod_mark').value = data.prod_mark;
            document.getElementById('new-prod_number').value = data.prod_number;
            document.getElementById('new-prod_okpd2').value = data.prod_okpd2;
            document.getElementById('new-prod_okved2').value = data.prod_okved2;

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
        prod_okpd2: document.getElementById('new-prod_okpd2').value,
        prod_okved2: document.getElementById('new-prod_okved2').value,
        docs
    };

    fetch(`http://172.22.1.100/api/test/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(() => {
            closeForm();
            loadData();
        });
}

//удаление позиции по id
function deleteRow(id) {
    fetch(`http://172.22.1.100/api/test/${id}`, {
        method: 'DELETE',
    })
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
        prod_okpd2: document.getElementById('new-prod_okpd2').value,
        prod_okved2: document.getElementById('new-prod_okved2').value,
        docs
    };

    fetch('http://172.22.1.100/api/test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(() => {
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
    const response = await fetch('http://172.22.1.100/api/categories');
    return response.json();
}

function toggleDocumentation() { //рокировка колонок ОКПД2 ОКЭД2 и Документация, а так же изменения названия конпки. ***нужно сохранять состояние
    const okpdCols = document.querySelectorAll('.okpd-okved-col');
    const docCols = document.querySelectorAll('.doc-col');
    const toggleBtn = document.getElementById('toggle-doc-btn');

    if (toggleBtn.textContent === 'Документация') {
        toggleBtn.textContent = 'ОКПД2, ОКВЭД2';
        okpdCols.forEach(col => col.style.display = 'none');
        docCols.forEach(col => col.style.display = '');
        localStorage.setItem('docToggleState', 'docs');
    } else {
        toggleBtn.textContent = 'Документация';
        okpdCols.forEach(col => col.style.display = '');
        docCols.forEach(col => col.style.display = 'none');
        localStorage.setItem('docToggleState', 'codes');
    }

    // okpdCols.forEach(col => col.style.display = col.style.display === 'none' ? 'table-cell' : 'none');
    // docCols.forEach(col => col.style.display = col.style.display === 'none' ? 'table-cell' : 'none');

    // toggleBtn.textContent = toggleBtn.textContent === 'Документация' ? 'ОКПД2, ОКВЭД2' : 'Документация';
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




// Обработка сообщений в новой вкладке - НЕРАБОТАЕТ
/*window.addEventListener('message', (event) => {
    if (event.data.type === 'COPY_URL') {
        const url = event.data.url;
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('URL copied to clipboard: ' + url);
    }
});*/

// Функция для отображения контекстного меню
function showContextMenu(event, item) {
    // удаление предыдущего контекстного меню
    const context_menu = document.querySelector('.context-menu')
    if (context_menu) {
        context_menu.remove();
    }
    //создание текущего контекстного меню
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.innerHTML = `
        <ul>
            <li class="context-menu-item" data-action="archive">Архивировать документацию</li>
        </ul>
    `;
    document.body.appendChild(contextMenu);
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;

    // Обработка выбора пункта меню
    contextMenu.querySelector('.context-menu-item').addEventListener('click', () => {
        archiveDocs(item);
        document.body.removeChild(contextMenu);
    });

    // Удаление контекстного меню при клике вне его
    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            document.body.removeChild(contextMenu);
        }
    }, { once: true });
}

// Функция для архивирования документов
async function archiveDocs(item) {
    const docs = item.docs;
    console.log('Начало архивации, документы: ', docs);

    /*const zip = new JSZip(); //Создание нового экземпляра JSZip для работы с ZIP-архивом
    // const folder = zip.folder(`${docs[0].doc_name}_${docs[0].doc_link.split('/').pop().split('.')[0]}.zip`);
    const folder = zip.folder(`test.zip`); //Создание основной папки в архиве

    docs.forEach(doc => {

        console.log('doc', doc);

        if (doc.doc_link) { //если на документ есть ссылка...
            folder.file(doc.doc_name, doc.doc_link, { base64: true }); //добавление файла в архив. doc.doc_name - имя файла, doc.doc_link - содержимое файла (предполагается, что в base64)
        }
    });

    const blob = await zip.generateAsync({ type: 'blob' }); //Асинхронное преобразование архива в бинарный Blob-объект
    const url = URL.createObjectURL(blob); //Создание временной URL-ссылки для созданного Blob
    const a = document.createElement('a'); //Создание скрытого временного элемента <a> для скачивания
    a.href = url; //Установка ссылки на архив
    // a.download = `${docs[0].doc_name}_${docs[0].doc_link.split('/').pop().split('.')[0]}.zip`;
    a.download = `test.zip`; //Задание имени скачиваемого файла
    document.body.appendChild(a); //Добавление ссылки в DOM
    a.click(); //Программный клик для запуска скачивания
    document.body.removeChild(a); //Удаление временной ссылки из DOM
    URL.revokeObjectURL(url); //Освобождение памяти, занятой временной URL*/

    const zip = new JSZip(); // Создаем экземпляр ZIP-архива

    // Функция для получения расширения из URL
    const getFileExtension = (url) => {
        try {
            // Удаляем параметры запроса (всё после ?)
            const cleanUrl = url.split('?')[0];
            // Получаем имя файла из URL
            const filename = cleanUrl.split('/').pop();
            // Извлекаем расширение
            const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : null;

            console.log('Расширение файла по ссылке: ', ext);


            return ext || ''; // Возвращаем пустую строку если нет расширения
        } catch {
            return '';
        }
    };

    // 1. Загружаем все файлы асинхронно
    const filesPromises = docs.map(async (doc) => {
        if (!doc.doc_link) return null;

        try {
            // 2. Загружаем файл по URL
            const response = await fetch(doc.doc_link);

            // 3. Проверяем статус ответа
            if (!response.ok) {
                console.error(`Ошибка загрузки ${doc.doc_link}: ${response.status}`);
                return null;
            }

            // Получаем расширение из URL
            const fileExtension = getFileExtension(doc.doc_link);
            console.log('резульатат работы функции получения расширения: ', fileExtension);

            // Формируем имя файла
            let finalFilename = doc.doc_name;

            // Если есть расширение в URL
            if (fileExtension) {
                // Удаляем существующее расширение в имени (если есть)
                const baseName = finalFilename.replace(/\.[^/.]+$/, '_'); //меняем на _
                finalFilename = `${baseName}.${fileExtension}`; //формируем имя файла с расширением
            }


            // 4. Получаем бинарные данные как Blob
            const blob = await response.blob();

            // 5. Добавляем в архив (БЕЗ вложенных папок)
            zip.file(finalFilename, blob, { binary: true });

            console.log(`Добавлен файл: ${finalFilename} (${blob.size} байт)`);
        } catch (error) {
            console.error(`Ошибка обработки файла ${finalFilename}:`, error);
        }
    });

    // 6. Ждем завершения всех загрузок
    await Promise.all(filesPromises);

    // 7. Проверяем есть ли файлы в архиве
    if (Object.keys(zip.files).length === 0) {
        console.error('Нет файлов для архивации');
        return;
    }

    // 8. Генерируем архив
    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE', // Сжатие для уменьшения размера
        compressionOptions: { level: 9 } // Максимальное сжатие
    });

    // 9. Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${item.prod_number}_${item.prod_mark}_${item.prod_name}.zip`; // Уникальное имя

    document.body.appendChild(a);
    a.click();

    // 10. Уборка
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Архив успешно создан');

}