import React from 'react';
import { useNavigate } from 'react-router-dom';

import LoginForm from '../components/LoginForm';

const LoginPage = ({ onLoginSuccess }) => {
    // Получаем функцию навигации от React Router
    const navigate = useNavigate();

    // Создаем новую функцию, которая будет и обновлять состояние, и перенаправлять
    const handleLoginAndRedirect = () => {
        // 1. Вызываем оригинальную функцию, чтобы App.jsx обновил состояние isLoggedIn
        if (onLoginSuccess) {
            onLoginSuccess();
        }
        // 2. Выполняем программное перенаправление на главную страницу
        // Поскольку в App.jsx используется <Router basename="/admin">, путь "/" 
        // будет правильно преобразован в "/admin/".
        navigate('/');
    };

    return (
        <div>
            <h2>Вход в систему</h2>
            {/* Передаем нашу новую функцию-обертку в компонент формы */}
            <LoginForm onLoginSuccess={handleLoginAndRedirect} />
        </div>
    );
};

export default LoginPage;