// Утилиты для модальных окон
/**
 * Работа с модальными окнами:
 * Код для открытия/закрытия модальных окон (.modal-backdrop, формы контейнеры)
 */

/** Открывает модальное окно и фон.
 * @param {string} modalElementId - ID элемента контейнера модального окна */
export function openModal(modalElementId) {
    const modal = document.getElementById(modalElementId);
    const backdrop = document.querySelector('.modal-backdrop');
    if (modal && backdrop) {
        modal.style.display = 'block';
        backdrop.style.display = 'block';
    }
}

/** Закрывает модальное окно и фон.
 * @param {string} modalElementId - ID элемента контейнера модального окна */
export function closeModal(modalElementId) {
    const modal = document.getElementById(modalElementId);
    const backdrop = document.querySelector('.modal-backdrop');
    if (modal && backdrop) {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    }
}

/** Навешивает обработчики событий для закрытия модального окна
 * @param {string} modalElementId - ID элемента контейнера модального окна
 * @param {string} [closeButtonSelector] - Селектор кнопки закрытия внутри модального окна
 * @param {string} [backdropSelector='.modal-backdrop'] - Селектор фона модального окна
 * @param {Function} [onCloseCallback] - Callback функция, вызываемая при закрытии модального окна */
export function addCloseEventListeners(modalElementId, closeButtonSelector, backdropSelector = '.modal-backdrop', onCloseCallback) {
    const modal = document.getElementById(modalElementId);
    const backdrop = document.querySelector(backdropSelector);

    if (!modal) return;

    // Закрытие по кнопке закрытия
    if (closeButtonSelector) {
        const closeButton = modal.querySelector(closeButtonSelector);
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modalElementId);
                if (onCloseCallback) { onCloseCallback(); }
            });
        }
    }

    // Закрытие по клику на фон
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeModal(modalElementId);
            if (onCloseCallback) { onCloseCallback(); }
        });
    }
}