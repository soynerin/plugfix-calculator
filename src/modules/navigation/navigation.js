/**
 * Navigation Module - Gestión de Navegación entre Tabs
 * 
 * Maneja la navegación entre diferentes secciones de la aplicación
 * y advierte sobre cambios sin guardar
 */

import { showConfirmation } from '../../utils/modal.js';
import { getHasUnsavedChanges, setHasUnsavedChanges } from '../calculator/calculatorUI.js';

let pendingNavigation = null;

/**
 * Marca el tab activo en la navegación
 * 
 * @param {string} tabName - Nombre del tab a marcar como activo
 */
export function setActiveTab(tabName) {
    // Remover clase activa de todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    
    // Agregar clase activa al tab seleccionado
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('tab-active');
    }
}

/**
 * Configura advertencias de navegación cuando hay cambios sin guardar
 */
export function setupNavigationWarning() {
    document.querySelectorAll('.tab-btn').forEach(link => {
        link.addEventListener('click', function(e) {
            // No mostrar advertencia si no hay cambios o si ya estamos en calculadora
            if (!getHasUnsavedChanges() || this.dataset.tab === 'calculator') {
                return;
            }

            e.preventDefault();
            pendingNavigation = this.href;

            showConfirmation(
                '⚠️ Cambios sin guardar',
                'Tienes un cálculo sin guardar en el historial. ¿Deseas salir sin guardarlo?',
                () => {
                    setHasUnsavedChanges(false);
                    window.location.href = pendingNavigation;
                },
                'Salir sin guardar'
            );
        });
    });
}

/**
 * Inicializa el módulo de navegación
 * 
 * @param {string} currentTab - Tab actual de la página
 */
export function initNavigation(currentTab = 'calculator') {
    setActiveTab(currentTab);
    setupNavigationWarning();
    
    console.log('✅ Módulo navegación inicializado');
}
