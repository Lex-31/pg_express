import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Make sure this is consistent

/** Функция-миддлвар для проверки токена. Для встраивания в маршруты
 * @param {*} req запрос
 * @param {*} res ответ
 * @param {*} next следующий маршрут
 * @returns в случае успеха возвращает следующий маршрут, при не корректном токене возвращает ошибку */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Требуется аутентификация (отсутствует токен).' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Ошибка верификации JWT:', err.message);
            return res.status(403).json({ message: 'Неверный или просроченный токен.' });
        }
        req.user = user; // Добавляем информацию о пользователе в запрос
        next();
    });
};

export { authenticateToken };