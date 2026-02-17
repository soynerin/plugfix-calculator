/**
 * Modal Confirmation System - Sistema de modales de confirmación
 * 
 * Gestiona modales de confirmación para acciones destructivas
 */

let confirmCallback = null;

/**
 * Muestra un modal de confirmación
 * 
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje descriptivo
 * @param {Function} onConfirm - Callback a ejecutar si se confirma
 * @param {string} confirmText - Texto del botón de confirmación (default: 'Eliminar')
 */
export function showConfirmation(title, message, onConfirm, confirmText = 'Eliminar') {
    const modal = document.getElementById('confirmation-modal');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    
    if (!modal || !titleElement || !messageElement || !confirmBtn) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    titleElement.textContent = title;
    messageElement.textContent = message;
    confirmBtn.textContent = confirmText;
    modal.classList.remove('hidden');
    
    confirmCallback = onConfirm;
}

/**
 * Cancela y cierra el modal de confirmación
 */
export function cancelConfirmation() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    confirmCallback = null;
}

/**
 * Ejecuta el callback de confirmación y cierra el modal
 */
export function executeConfirmation() {
    if (confirmCallback) {
        confirmCallback();
        cancelConfirmation();
    }
}

/**
 * Inicializa los event listeners del modal
 * Debe llamarse una vez al cargar la aplicación
 */
export function initModal() {
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const modal = document.getElementById('confirmation-modal');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', executeConfirmation);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'confirmation-modal') {
                cancelConfirmation();
            }
        });
    }
}
