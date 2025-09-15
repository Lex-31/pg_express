import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import AdminPage from './pages/AdminPage';
import LogPage from './pages/LogPage'; // Наша новая страница
import LoginPage from './pages/LoginPage';
import './css/App.css'

// Компонент-обертка, который считывает данные пользователя из localStorage
const getUserFromStorage = () => {
    const name = localStorage.getItem('username');
    const email = localStorage.getItem('userEmail');
    return name && email ? { name, email } : null;
};

// КОМПОНЕНТ ДЛЯ ПРИВЕТСТВИЯ В АДМИН-ПАНЕЛИ
const HomePage = ({ isLoggedIn }) => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Добро пожаловать в панель администратора!</h1>
        {isLoggedIn ? (
            <p>Выберите раздел для работы: <Link to="/panel">Управление правами пользователей и регистрация</Link> или <Link to="/logs">Лог изменений</Link>.</p>
        ) : (
            <p>Пожалуйста, <Link to="/login">войдите в систему</Link>.</p>
        )}
    </div>
);

function App() {
    // Проверяем наличие токена при загрузке, чтобы понять, залогинен ли пользователь
    // Инициализируем состояние напрямую из localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwtToken'));
    const [currentUser, setCurrentUser] = useState(getUserFromStorage());

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        // После успешного входа, снова читаем данные из localStorage
        setCurrentUser(getUserFromStorage());
    };

    const handleLogout = () => {
        // Очищаем все данные сессии
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');

        // Обновляем состояние
        setIsLoggedIn(false);
        setCurrentUser(null);
    };

    // Компонент-обертка для защищенных роутов
    const PrivateRoute = ({ children }) => {
        return isLoggedIn ? children : <Navigate to="/login" />;
    };

    // Теперь React Router будет работать внутри /admin/.
    // Ссылка <Link to="/logs"> будет вести на /admin/logs.
    return (
        <Router basename="/admin">
            <div>
                <nav className="main-nav">
                    <ul>
                        <li>
                            {/* Ссылка на главную страницу админ-секции */}
                            <Link to="/">Главная</Link>
                        </li>
                        {isLoggedIn && (
                            <>
                                <li>
                                    {/* Ссылка на панель управления */}
                                    <Link to="/panel">Управление правами пользователей и регистрация</Link>
                                </li>
                                <li>
                                    <Link to="/logs">Лог изменений</Link>
                                </li>
                            </>
                        )}
                        <li>
                            {isLoggedIn && currentUser ? (
                                <div className="user-info-container">
                                    <span className="user-info">
                                        Вошел как: {currentUser.name} ({currentUser.email})
                                    </span>
                                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                                </div>
                            ) : (
                                <Link to="/login">Войти</Link>
                            )}
                        </li>
                    </ul>
                </nav>

                <main className="main-content">
                    <Routes>
                        {/* Путь к логину. Он будет доступен по /admin/login */}
                        <Route path="login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

                        {/* ИСПОЛЬЗУЕМ `index` ДЛЯ ГЛАВНОЙ СТРАНИЦЫ /admin/ */}
                        <Route index element={<HomePage isLoggedIn={isLoggedIn} />} />

                        {/* ИСПОЛЬЗУЕМ ОТНОСИТЕЛЬНЫЕ ПУТИ ДЛЯ ВЛОЖЕННЫХ МАРШРУТОВ */}
                        <Route
                            path="panel"
                            element={
                                <PrivateRoute>
                                    <AdminPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="logs"
                            element={
                                <PrivateRoute>
                                    <LogPage />
                                </PrivateRoute>
                            }
                        />

                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
