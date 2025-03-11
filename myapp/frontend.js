async function loadData() { //GET запрос загружает данные из сервера и обновляет таблицу

    // Загрузка всех категорий
    const categories = await fetchCategories();

    // Загрузка изделий
    const response = await fetch('http://172.22.1.100/api/test');
    const data = await response.json();

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
        const categoryItems = data.filter(item => JSON.stringify(item.category_code) === JSON.stringify(category.category_id));  //сравниваем изделия и категории по колонке массива чисел

        categoryItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            tr.innerHTML = `
                <td>${item.item_number.join('.')}</td>
                <td>${item.prod_name}</td>
                <td>${item.prod_mark}</td>
                <td>${item.prod_number}</td>
                <td>${item.prod_okpd2}</td>
                <td>${item.prod_okved2}</td>
            `;
            tr.addEventListener('dblclick', () => openEditForm(item.id));
            tableBody.append(tr);
        });
    });
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
                const select = document.getElementById('new-category_id');
                select.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = `${category.category_id.join('.')} ${category.category_name}`;
                    if (JSON.stringify(category.category_id) === JSON.stringify(data.category_id)) {
                        option.selected = true;
                    }
                    select.append(option);
                });
            });

            document.getElementById('form-submit-btn').textContent = 'Обновить';
            document.getElementById('form-submit-btn').onclick = () => updateRow(id);
            document.getElementById('form-delete-btn').onclick = () => deleteRow(id);

            document.getElementById('new-form-container').style.display = 'block';
            document.querySelector('.modal-backdrop').style.display = 'block';
        });
}

function updateRow(id) { //Отправляет PUT запрос на сервер с обновленными данными
    const category_id = document.getElementById('new-category_id').value.split(',').map(Number);   //"1,1" -> [1, 2]. Выбираем HTML элемент <select>(выпадающ. список катег.), value - берем значение "1,1" выбранного option, split - разделяем строку на массив подстрок ("1,2,3" -> ["1", "2", "3"]) используя разделитель ",", map - каждое значение массива строк ["1", "2", "3"] преобразуется в массив чисел [1, 2, 3]
    const item_number = document.getElementById('new-item_number').value; //порядковый номер изделия из формы

    const data = {
        category_id,
        item_number: [...category_id, Number(item_number)],
        prod_name: document.getElementById('new-prod_name').value,
        prod_mark: document.getElementById('new-prod_mark').value,
        prod_number: document.getElementById('new-prod_number').value,
        prod_okpd2: document.getElementById('new-prod_okpd2').value,
        prod_okved2: document.getElementById('new-prod_okved2').value,
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

    const data = {
        category_id,
        item_number: [...category_id, Number(item_number)],
        prod_name: document.getElementById('new-prod_name').value,
        prod_mark: document.getElementById('new-prod_mark').value,
        prod_number: document.getElementById('new-prod_number').value,
        prod_okpd2: document.getElementById('new-prod_okpd2').value,
        prod_okved2: document.getElementById('new-prod_okved2').value,
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
}

async function fetchCategories() { //запрос списка категорий
    const response = await fetch('http://172.22.1.100/api/categories');
    return response.json();
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

    });
});

// Загрузка данных при загрузке страницы
loadData();