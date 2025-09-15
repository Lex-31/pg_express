import React, { useState } from 'react';
import { loginUser } from '../api/auth'; // Import the API function

const LoginForm = ({ onLoginSuccess }) => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // State for messages

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setMessage(''); // Clear previous messages
        const loginData = { emailOrUsername, password };
        console.log('Login form data:', loginData);

        try {
            const result = await loginUser(loginData);

            if (result && result.token) {
                localStorage.setItem('jwtToken', result.token); // 1. сохраняет токен

                // 2. Декодируем токен, чтобы получить данные пользователя
                let decodedData = {};
                try {
                    // Вторая часть токена - это payload с данными
                    const payloadBase64 = result.token.split('.')[1];
                    // Декодируем из Base64 и парсим JSON
                    const decodedPayload = JSON.parse(atob(payloadBase64));

                    console.log('Полностью декодированный токен (payload):', decodedPayload);

                    decodedData = {
                        username: decodedPayload.username, // Убедитесь, что поля в вашем токене называются именно так
                        email: decodedPayload.email
                    };
                    localStorage.setItem('username', decodedData.username);
                    localStorage.setItem('userEmail', decodedData.email);
                } catch (e) {
                    console.error("Ошибка декодирования токена:", e);
                }

                // Сбрасываем поля формы
                setEmailOrUsername('');
                setPassword('');

                // 3. Вызываем коллбэк и ПЕРЕДАЕМ в него декодированные данные
                if (onLoginSuccess) {
                    onLoginSuccess(decodedData); // передаем декодированные данные
                }
            }
        } catch (error) {
            setMessage('Ошибка при входе: ' + (error.message || 'Неизвестная ошибка'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Вход</h2>
            <div className="form-group">
                <label htmlFor="login-emailOrUsername">Email или имя пользователя:</label>
                <input
                    type="text"
                    id="login-emailOrUsername"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="login-password">Пароль:</label>
                <input
                    type="password"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Войти</button>
            {message && <p>{message}</p>} {/* Display messages */}
        </form>
    );
};

export default LoginForm;