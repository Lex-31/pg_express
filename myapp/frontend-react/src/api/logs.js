const API_BASE_URL = '/api';

/** API-функция для получения логов
 * Fetches log entries from the backend.
 * Requires a valid JWT in localStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of log objects.
 * @throws {Error} If the request fails or the user is not authenticated.
 */
export async function getLogs() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        throw new Error('User not authenticated: No token found.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/logs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching logs: ${response.status}`);
        }

        // Сервер возвращает массив JSON-объектов, его и возвращаем
        return await response.json();

    } catch (error) {
        console.error('Error in getLogs:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}
