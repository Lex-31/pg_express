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
                localStorage.setItem('jwtToken', result.token); // Store the token
                setMessage('Вход выполнен успешно');
                setEmailOrUsername('');
                setPassword('');
                if (onLoginSuccess) {
                    onLoginSuccess(); // Call the prop on successful login
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