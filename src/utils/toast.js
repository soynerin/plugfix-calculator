/**
 * Toast Notifications - Sistema de notificaciones temporales
 * 
 * Proporciona feedback visual al usuario mediante mensajes toast
 * que aparecen y desaparecen automáticamente.
 */

/**
 * Muestra una notificación toast
 * 
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success' | 'error' | 'warning' | 'info')
 * @param {number} duration - Duración en milisegundos (default: 3000)
 */
export function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container no encontrado en el DOM');
        return;
    }

    const toast = document.createElement('div');
    
    // Mapeo de estilos según el tipo
    const styles = {
        success: 'border-l-4 border-green-500',
        error: 'border-l-4 border-red-500',
        warning: 'border-l-4 border-yellow-500',
        info: 'border-l-4 border-blue-500'
    };

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.className = `toast glass-card rounded-lg p-4 ${styles[type] || styles.success}`;
    toast.innerHTML = `
        <p class="text-white font-medium">
            <span class="mr-2">${iconMap[type] || iconMap.success}</span>
            ${message}
        </p>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de la duración especificada
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje a mostrar
 */
export function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Muestra una notificación de error
 * @param {string} message - Mensaje a mostrar
 */
export function showError(message) {
    showToast(message, 'error');
}

/**
 * Muestra una notificación de advertencia
 * @param {string} message - Mensaje a mostrar
 */
export function showWarning(message) {
    showToast(message, 'warning');
}

/**
 * Muestra una notificación informativa
 * @param {string} message - Mensaje a mostrar
 */
export function showInfo(message) {
    showToast(message, 'info');
}
