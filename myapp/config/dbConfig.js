import pg from 'pg';
const { Pool } = pg; //сократить

/** Экземпляр класса Pool для подключения к базе данных
 * @param {string} user имя пользователя
 * @param {string} host имя хоста
 * @param {string} database имя базы данных
 * @param {string} password пароль
 * @param {number} port порт
 * @returns {Pool} объект подключения к базе данных
 * @example const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'production', password: 'Qwerty12345', port: 5432 }); */
export const pool = new Pool({
    user: 'postgres',
    host: 'localhost', // имя сервиса базы данных из docker-compose - db
    database: 'production',
    password: 'Qwerty12345',
    port: 5432,
});

/** Имя префикса таблиц в базе данных
 * @type {string} */
export const table_name = 'stalenergo';