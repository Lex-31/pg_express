const API_BASE_URL = '/api'; // Adjust if your API base path is different

/** Для получения списка пользователей с бэкенда
 * @returns {Promise<Array<Object>>} A promise that resolves with the list of users.
 * @throws {Error} If the request fails. */
export async function getUsers() {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: headers,
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

/**
 * Fetches the list of all possible permissions from the backend.
 * Requires a valid JWT in localStorage and potentially specific permissions.
 * @returns {Promise<string[]>} A promise that resolves with an array of permission strings.
 * @throws {Error} If the request fails or the user does not have sufficient permissions.
 */
export async function getAllPermissions() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        throw new Error('User not authenticated: No token found.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching permissions: ${response.status}`);
        }
        return await response.json(); // Expecting an array of permission strings
    } catch (error) {
        console.error('Error in getAllPermissions:', error);
        throw error; // Re-throw the error
    }
}

/**
 * Fetches information about the currently authenticated user.
 * Requires a valid JWT in localStorage.
 * @returns {Promise<Object>} A promise that resolves with the current user's data (id, username, email, permissions).
 * @throws {Error} If the request fails or the user is not authenticated.
 */
export async function getCurrentUser() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        throw new Error('User not authenticated: No token found.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error fetching current user: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Registers a new user.
 * @param {Object} userData An object containing username, email, and password.
 * @returns {Promise<Object>} A promise that resolves with the registration success message or user data.
 * @throws {Error} If the registration fails.
 */
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        // Attempt to parse response body even on non-OK status to get error details
        let responseData = {};
        try {
            responseData = await response.json();
        } catch (parseError) {
            // Ignore JSON parsing errors for non-JSON responses
        }

        if (!response.ok) {
            // Check if response contains validation errors from express-validator
            if (responseData.errors && Array.isArray(responseData.errors)) {
                const validationErrors = responseData.errors.map(err => err.msg).join(', ');
                throw new Error(`Validation failed: ${validationErrors}`);
            }
            // If it's another type of error response
            throw new Error(responseData.message || `Error registering user: ${response.status}`);
        }

        // If the response is OK, return the data
        return responseData;

    } catch (error) {
        console.error('Error in registerUser:', error);
        // Re-throw the error to be handled by the caller, preserving detailed errors if they exist
        // If the error is a Validation failed error thrown above, it's already an Error object with the message
        if (error.message.startsWith('Validation failed:')) {
            throw error; // Propagate the detailed validation error
        }
        // For other errors (like network issues or parsing errors not caught above)
        throw new Error(`Registration failed: ${error.message}`); // Throw a new error with a more specific message
    }
}

/**
 * Logs in an existing user.
 * @param {Object} credentials An object containing emailOrUsername and password.
 * @returns {Promise<Object>} A promise that resolves with a success message and JWT token.
 * @throws {Error} If the login fails.
 */
// Note: Login function is not provided in the prompt, but adding a placeholder for consistency
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error logging in: ${response.status}`);
        }

        const data = await response.json();
        return data; // Should contain message and token
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

/** Для обновления разрешений пользователя на бэкенде
 * @param {string|number} userId The ID of the user to update.
 * @param {string[]} permissions An array of permission strings.
 * @returns {Promise<Object>} A promise that resolves with the updated user data or a success message.
 * @throws {Error} If the request fails. */
export async function updateUserPermissions(userId, permissions) {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: headers,
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