const API_BASE_URL = '/api'; // Adjust if your API base path is different

/** Для получения списка пользователей с бэкенда
 * @returns {Promise<Array<Object>>} A promise that resolves with the list of users.
 * @throws {Error} If the request fails. */
export async function getUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if user is logged in
                // 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching users: ${response.status}`);
        }

        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error in getUsers:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

/** Для обновления разрешений пользователя на бэкенде
 * @param {string|number} userId The ID of the user to update.
 * @param {string[]} permissions An array of permission strings.
 * @returns {Promise<Object>} A promise that resolves with the updated user data or a success message.
 * @throws {Error} If the request fails. */
export async function updateUserPermissions(userId, permissions) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if user is logged in
                // 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify({ permissions }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error updating user permissions: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error in updateUserPermissions:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}