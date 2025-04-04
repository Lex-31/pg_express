import pg from "pg";
const { Pool } = pg;

export const table_name = 'stalenergo';
export const pool = new Pool({
    user: 'postgres',
    host: 'localhost', // Используйте имя сервиса базы данных из docker-compose - db
    database: 'production',
    password: 'Qwerty12345',
    port: 5432,
});
export async function ensureTableExists() {
    const client = await pool.connect();
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS ${table_name} (
            id SERIAL PRIMARY KEY NOT NULL,
            category_id INT[],
            item_number INT[],        
            prod_name VARCHAR(100),
            prod_mark VARCHAR(100),
            prod_number VARCHAR(100),
            prod_okpd VARCHAR(100),
            prod_okved VARCHAR(100),
            prod_dir VARCHAR(255)
        );
        `);
        await client.query(`
        CREATE TABLE IF NOT EXISTS ${table_name}_category (
            id SERIAL PRIMARY KEY NOT NULL,
            category_id INT[],
            category_name VARCHAR(100)
        );
        `);
        await client.query(`
        CREATE TABLE IF NOT EXISTS ${table_name}_doc (
            id SERIAL PRIMARY KEY NOT NULL,
            prod_id INT,
            doc_name VARCHAR(10),
            doc_link TEXT
        );
        `);
        const result = await client.query(`SELECT * FROM ${table_name}`);
        if (result.rowCount === 0) {
            await client.query(`
            INSERT INTO ${table_name} (category_id, item_number, prod_name, prod_mark, prod_number, prod_okpd, prod_okved, prod_dir) VALUES
                ('{1,1}', '{1,1,1}', 'Пункт промежуточный связи цифровой', 'ППСЦ', 'ЕИУС.468622.001', '26.30.23.170', '26.30.29', '\\\\fs3\\Технический архив\\ЕИУС.468622.001_ППСЦ\\ЭД'),
                ('{1,1}', '{1,1,2}', 'Пункт промежуточный связи цифровой влагозащищенный', 'ППСЦ-В', 'ЕИУС.468351.002', '26.30.23.170', '26.30.29', '\\\\fs3\\Технический архив\\ЕИУС.468351.002_Пункт пром. связи  ППСЦ-В\\ЭД'),
                ('{1,1}', '{1,1,3}', 'Усилитель диспетчера', 'УД-3МА ', 'ЕИУС.465311.007-01', '26.30.23.170', '26.30.29', '\\\\fs3\\Технический архив\\ЕИУС.465311.007-01_Усилитель диспетчера УД-3МА\\ЭД'),
                ('{1,1}', '{1,1,4}', 'Трубка избирательной связи', 'ТИС', 'ЕИУС.465661.010-01', '26.30.23.170', '26.30.29', '\\\\fs3\\Технический архив\\ЕИУС.465661.010-01_Трубка  ТИС\\ЭД'),
                ('{1,1}', '{1,1,5}', 'Приемник тонального вызова цифровой', 'ПТВЦ', 'ЕИУС.468351.102-02', '26.30.23.170', '26.30.29', '\\\\fs3\\Технический архив\\ЕИУС.468351.102-02_Приемник  ПТВЦ\\ЭД'),
                ('{1,1}', '{1,1,6}', 'Промежуточный телефонный дуплексный усилитель', 'ПТДУ-М2', 'ЕИУС.468714.001', '26.30.23.170', '26.30.29', ''),
                ('{1,2}', '{1,2,1}', 'Трубка перегонной связи цифровая', 'ТПСЦ (АССЦ, АССЦ-МП, Обь-128 Ц, ДСС, ОТС-ЦМ)', 'ЕИУС.465317.003', '26.30.23.170', '26.30.29', ''),
                ('{1,2}', '{1,2,2}', 'Трубка перегонной связи цифровая', 'ТПСЦ (DX-500 ЖТ)', 'ЕИУС.465317.003-01', '26.30.23.170', '26.30.29', ''),
                ('{1,2}', '{1,2,3}', 'Трубка перегонной связи цифровая', 'ТПСЦ (КС-2000 Р)', 'ЕИУС.465317.003-02', '26.30.23.170', '26.30.29', ''),
                ('{1,2}', '{1,2,4}', 'Трубка перегонной связи цифровая', 'ТПСЦ (КАСС)', 'ЕИУС.465317.003-03', '26.30.23.170', '26,30.29', ''),
                ('{1,2}', '{1,2,5}', 'Трубка перегонной связи цифровая', 'ТПСЦ (Ди-Станция, СМК-30)', 'ЕИУС.465317.003-04', '26.30.23.170', '26.30.29', ''),
                ('{1,2}', '{1,2,6}', 'Трубка перегонной связи цифровая', 'ТПСЦ  (КСМ-400)', 'ЕИУС.465317.003-06', '26.30.23.170', '26.30.29', ''),
                ('{1,4}', '{1,4,1}', 'Аппаратура станционной связи с цифровой коммутацией-МП', 'АССЦ-МП', 'ЕИУС.465235.015', '26.30.23.170', '26.30.29', ''),
                ('{1,4,1}', '{1,4,1,4}', 'Шкаф оборудования ШО 33Uх401', '', 'ЕИУС.301446.004-13', '26.30.30.190', '27.12', ''),
                ('{1,4,1}', '{1,4,1,5}', 'Блок вентиляторов БВ-4-600', '', 'ЕИУС.468264.002-01', '26.30.30.190', '27.90.9', ''),
                ('{1,4,1,6}', '{1,4,1,6,1}', 'ТЭЗ БП 220/48-03', '', 'ЕИУС.468367.008.560', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,6}', '{1,4,1,6,2}', 'ТЭЗ БГВ', '', 'ЕИУС.468367.008.570', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,6}', '{1,4,1,6,3}', 'ТЭЗ БП48/48-02', '', 'ЕИУС.468367.008.590', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,6}', '{1,4,1,6,4}', 'ТЭЗ БУП', '', 'ЕИУС.468367.008.580', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1}', '{1,4,1,8}', 'Кассета 6U', '', 'ЕИУС,468367.008.100', '27.33.13.190', '26.30.19', ''),
                ('{1,4,1,9}', '{1,4,1,9,1}', 'ТЭЗ БКС', '', 'ЕИУС.465338.003.630', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,9}', '{1,4,1,9,2}', 'ТЭЗ БП 220/60', '', 'ЕИУС.436112.001.200', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,10}', '{1,4,1,10,1}', 'Пульт ПД-АССЦ-30М', '', 'ЕИУС.468366.010', '26.30.23.170', '26.30.29', ''),
                ('{1,4,1,10}', '{1,4,1,10,4}', 'Блок дополнительной клавиатуры БДК-30', '', 'ЕИУС.468613.003', '26.20.16.110', '26.20', ''),
                ('{1,4,1,10}', '{1,4,1,10,5}', 'Переговорное устройство всепогодное цифровое ПУ.ВЦ-02', '', 'ЕИУС.465326.003', '26.30.11.199', '26.30.29', ''),
                ('{1,4,1,10}', '{1,4,1,10,6}', 'Переговорное устройство упрощенное цифровое ПУ.УЦ-02', '', 'ЕИУС.465326.001', '26.30.11.199', '26.30.29', ''),
                ('{1,4,1,10}', '{1,4,1,10,7}', 'Кросс настенный КН-10 (на 100 пар линий)', '', 'ЕИУС.465235.015.700', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,6}', '{1,4,1,6,1}', 'ТЭЗ БП 220/48-03', '', 'ЕИУС.468367.008.560', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,9}', '{1,4,1,9,1}', 'ТЭЗ БКС', '', 'ЕИУС.465338.003.630', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1,9}', '{1,4,1,9,2}', 'ТЭЗ БП 220/60', '', 'ЕИУС.436112.001.200', '26.30.30.190', '26.30.3', ''),
                ('{1,4,1}', '{1,4,1,12}', 'Микротелефонная трубка', '', 'ЕИУС.468351.032.300', '26.30.30.190', '26.30.3', ''),
                ('{2,1}', '{2,1,1}', 'Устройство вводно-защитное', 'ВЗУ-Е-1', 'ЕИУС.468240.001', '27.12.32.000', '27.90.9', ''),
                ('{2,1}', '{2,1,2}', 'Устройство вводно-защитное', 'ВЗУ-Е-1М', 'ЕИУС.468240.001', '27.12.32.000', '27.90.9', ''),
                ('{2,1}', '{2,1,3}', 'Устройство вводно-защитное', 'ВЗУ-Е-2', 'ЕИУС.468240.001-01', '27.12.32.000', '27.90.9', ''),
                ('{2,2}', '{2,2,1}', 'Шкаф', 'ШВЗУ-М', 'ЕИУС,468244,002', '27.12.32.000', '27.12', ''),
                ('{2,2}', '{2,2,2}', 'Шкаф', 'ШВЗУ', 'ЕИУС.468244.001', '27.12.32.000', '27.12', ''),
                ('{2,2}', '{2,2,3}', 'Шкаф', 'ШВЗУ-01', 'ЕИУС.468244.001-01', '27.12.32.000', '27.12', ''),
                ('{2,3}', '{2,3,1}', 'Комплект монтажный ВЗУ-Е9', '', 'ЕИУС.468240.001-08.950', '27.12.32.000', '26.30.3', ''),
                ('{2,3}', '{2,3,2}', 'Кронштейн БММ (для ШВЗУ-М)', '', 'ЕИУС.745418.002', '27.12.32.000', '25.99.29', ''),
                ('{2,3}', '{2,3,3}', 'Кронштейн БКТ (для ШВЗУ-М)', '', 'ЕИУС.745322.009', '27.12.32.000', '25.99.29', ''),
                ('{2,3}', '{2,3,4}', 'Групповой контакт заземления', 'ГКЗ-01', 'ЕИУС.685171.001', '27.12.32.000', '25.99.29', ''),
                ('{2,4}', '{2,4,1}', 'Блок', 'ЗМС-Е', 'ЕИУС.468240.118-02', '27.12.32.000', '27.90.9', ''),
                ('{2,4}', '{2,4,2}', 'Блок', 'ЗМС-Е-01', 'ЕИУС.468240.118-01', '27.12.32.000', '27.90.9', ''),
                ('{2,4}', '{2,4,3}', 'Блок', 'ЗИС-Е', 'ЕИУС.468240.119-02', '27.12.32.000', '27.90.9', ''),
                ('{3,1}', '{3,1,1}', 'Аппаратура громкоговорящего оповещения и связи', 'СДПС-МДЕ', 'ЕИУС.465312.002', '26.30.23.120', '26.30.11', ''),
                ('{3,2,2}', '{3,2,2,3}', 'Пульт руководителя упрощенный', 'ПР.У', 'ЕИУС.468351.060', '26.30.23.170', '26.30.29', ''),
                ('{3,2}', '{3,2,3}', 'Блок сопряжения с системой мониторинга', 'БССМ', 'ЕИУС.421451.001-01', '26.30.30.190', '26.30.3', ''),
                ('{3,2,4}', '{3,2,4,1}', 'Станционный комплект усилительный', 'СКУ.МД-200-xxx', 'ЕИУС.465235.003', '26.30.23.120', '26.30.23', ''),
                ('{3,3}', '{3,3,1}', 'Переговорное устройство', ' ПУ', 'ЕИУС.468351.057', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,2}', 'Переговорное устройство', 'ПУ-П', 'ЕИУС.465331.009', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,3}', 'Переговорное устройство упрощенное', ' ПУ.У', 'ЕИУС.468351.059', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,4}', 'Переговорное устройство упрощенное', 'ПУ.У-П', 'ЕИУС.465331.010', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,5}', 'Переговорное устройство внутреннее', 'ПУ.В', 'ЕИУС.468351.058', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,6}', 'Парковое переговорное устройство наружное', 'ППУН', 'ЕИУС.468351.056', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,7}', 'Парковое переговорное устройство', 'ППУ', 'ЕИУС.465331.008', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,8}', 'Парковое переговорное устройство упрощенное', 'ППУ.У', 'ЕИУС.465331.007', '26.30.11.199', '26.30.29', ''),
                ('{3,3}', '{3,3,9}', 'Устройство переговорное наружное', 'УПН', 'ЕИУС.468351.055', '26.40.42.110', '26.30.29', ''),
                ('{3,4}', '{3,4,1}', 'Аппаратура громкоговорящего оповещения (в составе: УТ200М и АПК)', 'АГО-200', 'ЕИУС.465333.008', '26.30.23.120', '26.30.29', ''),
                ('{3,4}', '{3,4,2}', 'Аппаратура громкоговорящего оповещения (в составе: УТ600М и АПК)', 'АГО-600', 'ЕИУС.465333.008-01', '26.30.23.120', '26.30.29', ''),
                ('{3,4}', '{3,4,3}', 'Усилитель трансляционный', 'УТ200', 'ЕИУС.468333.009', '26.40.43.110', '27.90.9', ''),
                ('{4}', '{4,1}', 'Сигнализатор заземления индивидуальный цифровой', 'СЗИЦ-Д(М)-1', 'ЕИУС.468262.104-05', '27.90.70.000', '26.51.4', ''),
                ('{4}', '{4,2}', 'Сигнализатор заземления индивидуальный цифровой (для линейных цепей)', 'СЗИЦ-Д-Л(М)-1', 'ЕИУС.468262.104-06', '27.90.70.000', '26.51.4', ''),
                ('{4}', '{4,3}', 'Реле импульсное путевое', 'ИВГ-Ц', 'ЕИУС.468362.024', '27.12.24.120', '27.12', ''),
                ('{4}', '{4,4}', 'Реле импульсное путевое', 'ИВГ-Ц-В', 'ЕИУС.468362.024-01', '27.12.24.120', '27.12', ''),
                ('{4}', '{4,5}', 'Устройство безопасного контроля напряжения', 'УБКН-1', 'ЕИУС.665222.001', '27.90.70.000', '26.51.4', ''),
                ('{4,13}', '{4,13,1}', 'Приемник тональных рельсовых цепей с цифровой обработкой сигналов', 'ПП3С', 'ЕИУС.468361.002-02', '27.90.70.000', ' 27.12', ''),
                ('{4}', '{4,14}', 'Приемник (Приемник тональных рельсовых цепей с цифровой обработкой сигналов)', 'ПП-С', 'ЕИУС.468361.002-90', '27.90.70.000', ' 27.12', ''),
                ('{4,17}', '{4,17,1}', 'Плата входная', '', 'ЕИУС.468361.002.200-01', '26.11.40.130', '26.12', ''),
                ('{4}', '{4,18}', 'Пульт проверки приемников и генераторов', 'ПППГ-ЦОС', 'ЕИУС.411182.001', '27.12.32.000', '27.12', ''),
                ('{4}', '{4,19}', 'Пульт проверки параметров сигнализаторов заземления индивидуальных цифровых', 'СЗИЦ, СЗИЦ-Д: ПП-СЗИЦ', 'ЕИУС.421413.001', '27.12.32.000', '27.12', ''),
                ('{4,20}', '{4,20,1}', 'Шкаф релейный унифицированный со встроенной грозозащитой (до 10 розеток на раме)', 'ШРУ-3-1', 'ЕИУС.468266.003', '27.12.32.000', '27.12', ''),
                ('{4,20}', '{4,20,2}', 'Шкаф релейный унифицированный со встроенной грозозащитой (до 20 розеток на раме)', 'ШРУ-3-2', 'ЕИУС.468266.003', '27.12.32.000', '27.12', ''),
                ('{4,21}', '{4,21,1}', 'Опора составная (для ШРУ-3)', '', 'ЕИУС.468266.003.800', '27.33.13.130', '28.99.9', ''),
                ('{4,21}', '{4,21,2}', 'Площадка малая', '', 'ЕИУС.468266.003.600', '27.33.13.130', '28.99.9', ''),
                ('{4,21}', '{4,21,3}', 'Площадка с перилами', '', 'ЕИУС.468266.003.660', '27.33.13.130', '28.99.9', ''),
                ('{5}', '{5,1}', 'Защитный фильтр', 'ЗФ-220', 'ЕИУС.436600.040', '27.12.32.000', ' 27.12', ''),
                ('{5}', '{5,2}', 'Защитный фильтр', 'ЗФ-220М', 'ЕИУС.436600.040-01', '27.12.32.000', ' 27.12', ''),
                ('{5,9}', '{5,9,1}', 'Аппаратура защиты Барьер', 'АБЧК-1М-ЭТ00-ОРФП-2РЦ', 'ЕИУС.646181.004-05', '27.12.32.000', '27.12', ''),
                ('{5}', '{5,10}', 'Устройство вводно-защитное постов ЭЦ', ' ВЗУ-ЭЦС-Е', 'ЕИУС.468243.004', '27.12.32.000', '27.90.9', ''),
                ('{5}', '{5,11}', 'Варисторный модуль', 'ВМ-250', 'ЕИУС.646181.023', '27.12.31.000', '27.12', ''),
                ('{5}', '{5,14}', 'Модуль защиты', ' МЗ-250', 'ЕИУС.646181.025', '27.12.32.000', '27.12', ''),
                ('{6,1}', '{6,1,1}', 'Установка питающая модульная совмещенная', 'МСПУ', 'ЕИУС.675122.004', '27.12.32.000', '27.12', ''),
                ('{6,2}', '{6,2,1}', 'Блок бесперебойного питания', 'ББП-12/0,25', 'ЕИУС.436231.001', '26.20.40.111', '27.90.9', ''),
                ('{7}', '{7,1}', 'Щит заземления для 3-х земель УХЛ3', 'ЩЗ-1', 'ЕИУС.468367.001', '27.12.32.000', '27.33', ''),
                ('{8,1}', '{8,1,1}', 'Шкаф распределительный телефонный', 'ШР-50', 'ЕИУС.465211.024', '27.12.32.000', '27.90.9', ''),
                ('{8,2}', '{8,2,1}', 'Комплект крепления боксов БММ (для ШРП-300, ШР-300, ШРП-600, ШР-600, ШР-1200)', ' ККБ-1', 'ЕИУС.465211.002.860', '25.72.14.190', '25.99.29', ''),
                ('{9}', '{9,1}', 'Шкаф управления трамвайной автоматикой', 'ШУТА-СЭ-04', 'ЕИУС.468332.011-01', '27.12.32.000', '27.90.9', ''),
                ('{9}', '{9,2}', 'Шкаф управления трамвайной автоматикой', 'ШУТА-СЭ-18', 'ЕИУС.468332.012', '27.12.32.000', '27.90.9', ''),
                ('{9}', '{9,3}', 'Шкаф управления трамвайной стрелкой ШУТС', 'ШУТС', 'ЕИУС.656365.001-01', '27.12.32.000', '27.90.9', ''),
                ('{9}', '{9,4}', 'Микропроцессорная централизация МПЦ-СМ', 'МПЦ-СМ', 'ЕИУС.', '00.00.00.000', '00.00', ''),
                ('{10}', '{10,1}', 'Цифровой модуль контроля рельсовых цепей ЦМ КРЦ (релейная увязка)', 'ЦМ КРЦ', 'ЕИУС.468172.001', '00.00.00.000', '00.00', '');
            `);
            await client.query(`
            INSERT INTO ${table_name}_category (category_id, category_name) VALUES
                ('{1}', 'Оборудование оперативно-технологической связи'),
                ('{1,1}', 'Аппаратура для избирательной связи'),
                ('{1,2}', 'Аппаратура для перегонной связи'),
                ('{1,3}', 'Аппараты телефонные'),
                ('{1,4}', 'Аппаратура станционной связи'),
                ('{2}', 'Оборудование защиты средств ОТС'),
                ('{2,1}', 'Устройства вводно-защитные'),
                ('{2,2}', 'Шкафы вводно-защитных устройств'),
                ('{2,3}', 'Дополнительная комплектации типовых ВЗУ-Е'),
                ('{2,4}', 'Блоки и модули защиты'),
                ('{3}', 'Оборудование парковой связи и громкоговорящего оповещения'),
                ('{3,1}', 'Аппаратура парковой связи'),
                ('{3,1,2}', 'Стойка коммутационно-усилительная СКУ.МДЕ'),
                ('{3,2}', 'Аппаратура парковой связи для малых станций'),
                ('{3,3}', 'Переговорные устройства'),
                ('{3,4}', 'Аппаратура ГГО'),
                ('{3,5}', 'Громкоговорители'),
                ('{3,6}', 'Педали диспетчера'),
                ('{4}', 'Оборудование СЦБ'),
                ('{4,20}', 'ШРУ-З'),
                ('{4,21}', 'Дополнительное оборудование для ШРУ-З'),
                ('{5}', 'Оборудование защиты устройств СЦБ'),
                ('{5,9}', 'Аппаратура защиты Барьер'),
                ('{6}', 'Системы и приборы питания'),
                ('{6,1}', 'Шкафы электропитания'),
                ('{6,2}', 'Приборы питания'),
                ('{7}', 'Элементы заземления'),
                ('{8}', 'Металлоизделия'),
                ('{8,1}', 'Шкафы коммутационно-распределительные'),
                ('{8,2}', 'Комплекты крепления боксов БММ и плинтов'),
                ('{8,3}', 'Шкафы батарейные'),
                ('{8,4}', 'Шкафы оборудования'),
                ('{8,5}', 'Принадлежности шкафов'),
                ('{8,6}', 'Элементы кабельных желобов'),
                ('{9}', 'Трамвайная автоматика'),
                ('{10}', 'Железнодорожная автоматика');
            `);
            await client.query(`
            INSERT INTO ${table_name}_doc (prod_id, doc_name, doc_link) VALUES
                ('1', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468622.001_ППСЦ\\ЭД\\ЕИУС.468622.001 ПС  ППСЦ  изм.2.pdf'),
                ('1', 'ТУ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468622.001_ППСЦ\\ЭД\\ЕИУС.468351.101 ТУ.pdf'),
                ('1', 'РЭ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468622.001_ППСЦ\\ЭД\\ЕИУС.468622.001 РЭ  ППСЦ изм.1.pdf'),
                ('2', 'ИН', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468351.002_Пункт пром. связи  ППСЦ-В\\ЭД\\ЕИУС.468351.002 ИН  Инстр. по пров. и рег.  изм.2.pdf'),
                ('2', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468351.002_Пункт пром. связи  ППСЦ-В\\ЭД\\ЕИУС.468351.002 ПС  ППСЦ-В изм.5.pdf'),
                ('2', 'РЭ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468351.002_Пункт пром. связи  ППСЦ-В\\ЭД\\ЕИУС.468351.002 РЭ  изм.3.pdf'),
                ('3', 'ИН', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465311.007-01_Усилитель диспетчера УД-3МА\\ЭД\\ЕИУС.465311.007-01 ИН Инстр. по пров. и рег.  изм.2.pdf'),
                ('3', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465311.007-01_Усилитель диспетчера УД-3МА\\ЭД\\ЕИУС.465311.007-01 ПС  УД-3МА-01  Россия  изм.2.pdf'),
                ('3', 'ТУ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465311.007-01_Усилитель диспетчера УД-3МА\\ЭД\\ТУ У 32.2-22697148-007_2007.pdf'),
                ('4', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465661.010-01_Трубка  ТИС\\ЭД\\ЕИУС.465661.010-01 ПС Трубка ТИС изм.2.pdf'),
                ('5', 'ИН', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468351.102-02_Приемник  ПТВЦ\\ЭД\\ЕИУС.468351.102 ИН  Инстр. по проверке и рег.  изм.1.pdf'),
                ('5', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468351.102-02_Приемник  ПТВЦ\\ЭД\\ЕИУС.468351.102 ПС Приемник ПТВЦ_Россия изм.2.pdf'),
                ('6', 'РЭ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468714.001_Промежуточный телеф. дуплексный усил. ПТДУ-М2\\ЭД\\ЕИУС.468714.001 РЭ.pdf'),
                ('6', 'ЭТ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.468714.001_Промежуточный телеф. дуплексный усил. ПТДУ-М2\\ЭД\\ЕИУС.468714.001 ЭТ Телефонный усилитель ПТДУ-М2_2 изм.3.pdf'),
                ('7', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('8', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('9', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('10', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('11', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('12', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465317.003_ ТПСЦ\\ЭД\\ЕИУС.465317.003 ПС_ТПСЦ изм.5.pdf'),
                ('13', 'РЭ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465235.015_АССЦ-МП\\ЭД\\ЕИУС.465235.015 РЭ АССЦ-МП_изм.4.pdf'),
                ('13', 'ПС', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465235.015_АССЦ-МП\\ЭД\\ЕИУС.465235.015 ПС АССЦ-МП изм.5.pdf'),
                ('13', 'ИМ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465235.015_АССЦ-МП\\ЭД\\ЕИУС.465235.015 ИМ АССЦ-МП изм.4.pdf'),
                ('13', 'ЗИ', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465235.015_АССЦ-МП\\ЭД\\ЕИУС.465235.015 ЗИ АССЦ-МП изм.2.pdf'),
                ('13', 'ЗИ.1', '\\\\fs3\\Производственный архив центрального офиса\\ЕИУС.465235.015_АССЦ-МП\\ЭД\\ЕИУС.465235.015 ЗИ.1 АССЦ-МП.pdf'),
                ('14', 'ПС', ''),
                ('15', 'ПС', ''),
                ('16', 'ПС', ''),
                ('17', 'ПС', ''),
                ('90', 'КР', 'https://new.stalenergo.ru/wp-content/uploads/2024/08/katalog-mpcz-sm-compressed.pdf'),
                ('91', 'РЭ', 'https://new.stalenergo.ru/wp-content/uploads/2020/11/468172_001-re.pdf'),
                ('91', 'ТП', 'https://new.stalenergo.ru/wp-content/uploads/2020/11/tipovye-materialy-dlya-proektirovaniya-1.pdf');
            `);
        }
    } finally { client.release(); }
} 