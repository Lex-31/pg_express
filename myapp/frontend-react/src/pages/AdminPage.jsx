import React, { useState, useEffect } from 'react';
import { getUsers } from '../api/auth'; // Import the getUsers function

const AdminPage = () => {
    const [users, setUsers] = useState([]); // Состояние для хранения списка пользователей
    const [error, setError] = useState(null); // Состояние для сохранения любой ошибки выборки

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersList = await getUsers(); // Fetch users using the API function
                setUsers(usersList); // Update the state with the fetched users
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Не удалось загрузить список пользователей.'); // Set error message
            }
        };

        fetchUsers(); // Call the fetch function when the component mounts
    }, []); // Empty dependency array means this effect runs only once on mount

    return (
        <div>
            <h1>Управление пользователями</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if there is one */}
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.username || user.email}</li> // Display username or email
                ))}
            </ul>
        </div>
    );
};

export default AdminPage;