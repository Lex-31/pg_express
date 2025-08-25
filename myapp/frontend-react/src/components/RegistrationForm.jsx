import React, { useState } from 'react';
import { registerUser } from '../api/auth'; // Import the API function

const RegistrationForm = ({ onUserAdded }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // State for messages

    const handleSubmit = async (event) => { // Make the handler asynchronous
        event.preventDefault(); // Prevent default form submission
        setMessage(''); // Clear previous messages
        console.log('Registration form data:', { username, email, password });

        try {
            const result = await registerUser({ username, email, password });
            setMessage('Пользователь успешно зарегистрирован');
            setUsername('');
            setEmail('');
            setPassword('');// Clear password after successful registration
            if (onUserAdded && result && result.user) {
                onUserAdded(result.user); // Call the prop with the new user data
            }
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.message && error.message.startsWith('Validation failed: ')) {
                // Extract validation messages
                const validationErrors = error.message.replace('Validation failed: ', '');
                setMessage('Ошибка валидации: ' + validationErrors);
            } else {
                setMessage('Ошибка при регистрации: ' + (error.message || 'Неизвестная ошибка'));
            }
        }

    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Регистрация пользователя</h2>
            <div>
                <label htmlFor="reg-username">Имя пользователя:</label>
                <input
                    type="text"
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-email">Email:</label>
                <input
                    type="email"
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="reg-password">Пароль:</label>
                <input
                    type="password"
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Зарегистрироваться</button>
            {message && <p>{message}</p>} {/* Display messages */}
        </form>
    );
};

export default RegistrationForm;