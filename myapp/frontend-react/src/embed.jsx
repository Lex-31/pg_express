import React from 'react';
import { createRoot } from 'react-dom/client'; // Use react-dom/client for React 18+
import LoginForm from './components/LoginForm.jsx';

//log
console.log('загрузка файла embed.js');

/**Function to render the LoginForm into a specific DOM element
 * @param elementId ID DOM-элемента, куда будет рендериться форма логина
 * @param onLoginSuccessCallback Коллбэк-функция, которая должна быть вызвана после успешного входа пользователя*/
function renderLoginForm(elementId, onLoginSuccessCallback) {
    const element = document.getElementById(elementId);
    if (element) {
        // Use createRoot for React 18+
        const root = createRoot(element);  // Используем импортированный createRoot
        root.render(
            // Pass the callback as a prop
            <React.StrictMode>
                <LoginForm onLoginSuccess={onLoginSuccessCallback} /> {/* Убедитесь, что onLoginSuccess здесь передается */}
            </React.StrictMode>
        );
    } else {
        console.error(`Element with ID '${elementId}' not found for rendering LoginForm.`);
    }
}

window.renderLoginForm = renderLoginForm;
// export { renderLoginForm }; // Export renderLoginForm;