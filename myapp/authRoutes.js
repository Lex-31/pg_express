import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { pool } from '../config/dbConfig.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with a strong secret key

// Validation middleware for registration
const validateRegistration = [
    body('username')
        .trim()
        .notEmpty().withMessage('Имя пользователя не может быть пустым')
        .isLength({ min: 3 }).withMessage('Имя пользователя должно содержать не менее 3 символов'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email не может быть пустым')
        .isEmail().withMessage('Неверный формат Email'),
    body('password')
        .notEmpty().withMessage('Пароль не может быть пустым')
        .isLength({ min: 6 }).withMessage('Пароль должен содержать не менее 6 символов'),
];

// POST /api/register
router.post('/api/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    let client;

    try {
        client = await pool.connect();

        // Check if user with this email or username already exists
        const existingUser = await client.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);

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

        // Hash the password
        const saltRounds = 10; // Cost factor
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database
        const newUser = await client.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, permissions',
            [username, email, passwordHash]
        );

        // Respond with success (excluding password hash)
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: newUser.rows[0].id,
                username: newUser.rows[0].username,
                email: newUser.rows[0].email,
                permissions: newUser.rows[0].permissions,
            }
        });

    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя', error: error.message });
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

    let client;

    try {
        client = await pool.connect();

        // Find user by email or username
        const userQuery = await client.query(
            'SELECT id, username, email, password_hash, permissions FROM users WHERE email = $1 OR username = $2',
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
        const token = jwt.sign({ userId: user.id, permissions: user.permissions }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

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

const authenticateToken = (req, res, next) => {
    // Placeholder for JWT authentication middleware
    // In a real app, this would extract the token from headers, verify it,
    // and attach user info (like permissions) to req.user
    req.user = { id: 1, permissions: ['edit_permissions', 'view_users'] }; // Mock user with admin permissions
    next();
};

// GET /api/users - Fetch all users
router.get('/api/users', authenticateToken, async (req, res) => {
    // TODO: Implement proper authorization check here (e.g., check if req.user has 'view_users' permission)
    if (!req.user || !req.user.permissions.includes('view_users')) {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT id, username, email, permissions FROM users ORDER BY id');
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

// PUT /api/users/:id - Update user permissions
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

    let client;
    try {
        client = await pool.connect();

        // Check if the user exists
        const userExists = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        // Update permissions
        const result = await client.query(
            'UPDATE users SET permissions = $1 WHERE id = $2 RETURNING id, username, email, permissions',
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

export default router;