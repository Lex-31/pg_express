import React, { useState, useEffect } from 'react';
import { getUsers, getCurrentUser, getAllPermissions } from '../api/auth'; // Import the getUsers function
import UserRow from '../components/UserRow'; // Import the UserRow component
import RegistrationForm from '../components/RegistrationForm'; // Import the RegistrationForm component
import LoginForm from '../components/LoginForm'; // Import the LoginForm component

const AdminPage = () => {
    const [allPermissions, setAllPermissions] = useState([]); // State to store all possible permissions
    const [users, setUsers] = useState([]); // Состояние для хранения списка пользователей
    const [error, setError] = useState(null); // Состояние для сохранения любой ошибки выборки
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

    const [currentUser, setCurrentUser] = useState(null); // State to store current logged-in user

    useEffect(() => {
        const fetchData = async () => {
            setError(null); // Clear previous errors

            // Fetch current user data if token exists
            const token = localStorage.getItem('jwtToken');
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setCurrentUser(userData); // Set current user state
                    setIsLoggedIn(true); // Set logged in status

                    // Fetch users list only if successfully authenticated
                    const usersList = await getUsers();
                    setUsers(usersList);

                    // Fetch all permissions list
                    const permissionsList = await getAllPermissions();
                    setAllPermissions(permissionsList);
                } catch (err) {
                    console.error('Error fetching current user:', err);
                    // If token is invalid or expired, clear it and state
                    localStorage.removeItem('jwtToken');
                    setCurrentUser(null);
                    setIsLoggedIn(false); // Ensure logged out state
                }
            }
        };

        fetchData(); // Call the fetch function when the component mounts
    }, [isLoggedIn]); // Empty dependency array means this effect runs only once on mount

    const handleLogout = () => {
        localStorage.removeItem('jwtToken'); // 1. Удаляем токен
        setCurrentUser(null); // 2. Очищаем текущего пользователя
        setUsers([]); // 3. Очищаем список пользователей
        setIsLoggedIn(false); // 4. Устанавливаем isLoggedIn в false

        console.log('User logged out. isLoggedIn:', false); // <-- Добавить этот лог
    };

    // Function to handle user updates from UserRow
    const handleUserUpdate = (updatedUser) => {
        //логирование
        console.log('AdminPage: Handling user update:', updatedUser);

        setUsers(prevUsers => {
            const newUsers = prevUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            );
            console.log('AdminPage: New users state in setUsers callback:', newUsers); // Лог нового состояния
            return newUsers;
        });

        // Лог здесь может показать старое состояние users
        console.log('AdminPage: Users state after update:', users);
    };

    // Function to handle adding a newly registered user to the list
    const handleUserAdded = (newUser) => {
        setUsers(prevUsers => [...prevUsers, newUser]);
    };

    // Function to handle successful login
    const handleLoginSuccess = async () => {
        setIsLoggedIn(true); // Set logged in status
        // Re-fetch user data and user list after successful login
        setError(null); // Clear previous errors
        try {
            const userData = await getCurrentUser();
            setCurrentUser(userData);

            const usersList = await getUsers();
            setUsers(usersList);

            // Fetch all permissions list
            const permissionsList = await getAllPermissions();
            setAllPermissions(permissionsList);
        } catch (err) {
            console.error('Error fetching data after login:', err);
            setError('Не удалось обновить данные после входа.');
        }
    };

    return (
        <div>
            {isLoggedIn ? (
                <> {/* Оборачиваем содержимое в фрагмент */}
                    {currentUser && ( // Условно отображаем информацию о пользователе
                        <div>
                            <p>Вошел как: {currentUser.username} ({currentUser.email})</p>
                            <button onClick={handleLogout}>Выход</button>
                        </div>
                    )}

                    {error && <p style={{ color: 'red' }}>{error}</p>} {/* Отображение ошибки */}
                    <ul>
                        {users.map(user => (
                            <UserRow key={user.id} user={user} onUserUpdate={handleUserUpdate} allPermissions={allPermissions} />
                        ))}
                    </ul>
                    {/* Здесь можно добавить контент только для авторизованных, если нужно */}
                    <h2>Регистрация</h2>
                    <RegistrationForm onUserAdded={handleUserAdded} />

                </>
            ) : (
                <> {/* Отображаем формы входа и регистрации */}
                    <h2>Вход</h2>
                    <LoginForm onLoginSuccess={handleLoginSuccess} />

                    {/* Форму регистрации можно отобразить здесь для неавторизованных */}
                    <h2>Регистрация</h2>
                    <RegistrationForm onUserAdded={handleUserAdded} />
                </>
            )}
        </div>
    );
};

export default AdminPage;