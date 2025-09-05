import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { pool, table_name } from '../config/dbConfig.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './authMiddleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with a strong secret key


const validateRegistration = [
    body('username')
        .trim()
        .notEmpty().withMessage('Имя пользователя не может быть пустым')
        .isLength({ min: 3 }).withMessage('Длинна должна быть не менее 3 символов'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email не может быть пустым')
        .isEmail().withMessage('Неверный формат Email'),
    body('password')
        .trim()
        .notEmpty().withMessage('Пароль не может быть пустым')
        .isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов')
];

// POST /api/register - User registration
router.post('/api/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const client = await pool.connect();

    try {
        // Проверка существует ли уже пользователь с email или именем
        const existingUser = await client.query(
            `SELECT id FROM ${table_name}_users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            const userExistsByEmail = existingUser.rows.some(user => user.email === email);
            const userExistsByUsername = existingUser.rows.some(user => user.username === username);
            let message = 'Пользователь с такими данными уже существует.';
            if (userExistsByEmail && userExistsByUsername) {
                message = 'Пользователь с таким Email и именем пользователя уже существует.';
            } else if (userExistsByEmail) {
                message = 'Пользователь с таким Email уже существует.';
            } else if (userExistsByUsername) {
                message = 'Пользователь с таким именем пользователя уже существует.';
            }
            return res.status(409).json({ message });
        }

        // Хеширование пароля
        const saltRounds = 10; //коэфициент затрат на хеширование
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Вставка нового пользователя в БД
        const newUser = await client.query(
            `INSERT INTO ${table_name}_users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, permissions`,
            [username, email, passwordHash]
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован.',
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email,
                permissions: newUser.rows[0].permissions || [], //гарантирует, что свойство permissions в объекте ответа всегда будет массивом, даже если оно не было возвращено из базы данных при вставке
            }
        });

    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера при регистрации.', error: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Validation middleware for login
const validateLogin = [
    body('emailOrUsername')
        .trim()
        .notEmpty().withMessage('Email или имя пользователя не может быть пустым'),
    body('password')
        .notEmpty().withMessage('Пароль не может быть пустым'),
];

// POST /api/login
router.post('/api/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrUsername, password } = req.body;
    const client = await pool.connect();

    try {
        // Find user by email or username
        const userQuery = await client.query(
            `SELECT id, username, email, password_hash, permissions FROM ${table_name}_users WHERE email = $1 OR username = $2`,
            [emailOrUsername, emailOrUsername] // Using the same value for both checks
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Неверный Email/имя пользователя или пароль' });
        }

        const user = userQuery.rows[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Неверный Email/имя пользователя или пароль' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                permissions: user.permissions,
            },
            JWT_SECRET,
            { expiresIn: '1000h' } // Token expires in 1000 hour
        );

        res.status(200).json({ message: 'Вход выполнен успешно', token });

    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        res.status(500).json({ message: 'Произошла ошибка при входе пользователя', error: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// GET /api/users - Fetch all users

// GET /api/user/me - Get current authenticated user's info
router.get('/api/user/me', authenticateToken, async (req, res) => {
    // authenticateToken middleware already ensures req.user exists and is populated from the token payload
    const userId = req.user.userId; // Get user ID from the token payload

    if (!userId) {
        // This case should ideally not happen if authenticateToken works correctly,
        // but it's a safeguard.
        return res.status(400).json({ message: 'Идентификатор пользователя отсутствует в токене.' });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(`SELECT id, username, email, permissions FROM ${table_name}_users WHERE id = $1`, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден в базе данных.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при получении информации о текущем пользователе:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении информации о текущем пользователе', error: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Для получения списка всех пользователей с их ID, именами пользователей, почтами и разрешениями
router.get('/api/users', authenticateToken, async (req, res) => {
    // TODO: Implement proper authorization check here (e.g., check if req.user has 'view_users' permission)
    // With the current requirements, simply being authenticated is enough to view the user list.

    const client = await pool.connect();

    try {
        const result = await client.query(`SELECT id, username, email, permissions FROM ${table_name}_users ORDER BY id`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении списка пользователей', error: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Validation middleware for updating permissions
const validatePermissionsUpdate = [
    body('permissions')
        .isArray().withMessage('Поле permissions должно быть массивом'),
];

// Для обновления разрешений конкретного пользователя по его ID
router.put('/api/users/:id', authenticateToken, validatePermissionsUpdate, async (req, res) => {
    // TODO: Implement proper authorization check here (e.g., check if req.user has 'edit_permissions' permission)
    if (!req.user || !req.user.permissions.includes('edit_permissions')) {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = parseInt(req.params.id, 10);
    const { permissions } = req.body;

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Неверный формат ID пользователя.' });
    }

    const client = await pool.connect();

    try {
        // Check if the user exists
        const userExists = await client.query(`SELECT id FROM ${table_name}_users WHERE id = $1`, [userId]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        // Update permissions
        const result = await client.query(
            `UPDATE ${table_name}_users SET permissions = $1 WHERE id = $2 RETURNING id, username, email, permissions`,
            [permissions, userId]
        );

        res.status(200).json({
            message: 'Права пользователя успешно обновлены.',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Ошибка при обновлении прав пользователя:', error);
        res.status(500).json({ message: 'Произошла ошибка при обновлении прав пользователя', error: error.message });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// GET /api/permissions - Get a list of all possible permissions
const ALL_PERMISSIONS = [
    'view_users',
    'edit_permissions',
    'create_journals',
    'edit_journals',
    'delete_journals',
    'create_entries',
    'edit_entries_full', // Полное редактирование записи
    'edit_entries_initiator', // Редактирование части заполняемой инициатором
    'edit_entries_responder', // Редактирование части заполняемой отвечающим (включая утверждение)
    'delete_entries' // Удаление записи
];

router.get('/api/permissions', authenticateToken, (req, res) => {
    // Basic authorization check: only allow users with 'edit_permissions' to get the list
    if (!req.user || !req.user.permissions.includes('edit_permissions')) {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }

    res.status(200).json(ALL_PERMISSIONS);
});

export default router;