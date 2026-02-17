/**
 * App.js - Orquestador Principal de la Aplicación
 * 
 * Este es el punto de entrada principal de la aplicación.
 * Coordina la inicialización de todos los módulos y servicios.
 * 
 * Arquitectura:
 * - Servicios: db.js, currency.js
 * - Utilidades: formatters.js, toast.js, modal.js
 * - Módulos: calculator, history, navigation
 */

import { initDB, getDB } from './services/db.js';
import { getDolarPrice } from './services/currency.js';
import migrationService from '../database/migrationService.js';
import { initModal, cancelConfirmation } from './utils/modal.js';
import { initCalculator, copyBudgetToClipboard } from './modules/calculator/calculatorUI.js';
import { toggleDisplayCurrency } from './modules/calculator/calculator.js';
import { 
    initHistory, 
    saveToHistory, 
    confirmClearHistory,
    previousPage,
    nextPage
} from './modules/history/history.js';
import { initNavigation } from './modules/navigation/navigation.js';

/**
 * Inicializa la aplicación
 */
async function initApp() {
    try {
        console.log('🚀 Iniciando aplicación...');

        // 1. Ejecutar migración desde localStorage si es necesario
        const migrated = await migrationService.executeMigration();
        if (migrated) {
            console.log('✅ Datos migrados desde localStorage a IndexedDB');
        }

        // 2. Inicializar base de datos
        await initDB();
        console.log('✅ Base de datos inicializada');

        // 3. Inicializar modal de confirmación
        initModal();
        console.log('✅ Sistema de modales inicializado');

        // 4. Obtener cotización del dólar (en background, no bloqueante)
        getDolarPrice().then(result => {
            if (result.price) {
                console.log(`💵 Cotización del dólar: $${result.price} (${result.source})`);
            }
        }).catch(err => {
            console.warn('⚠️ No se pudo obtener cotización del dólar:', err);
        });

        // 5. Inicializar módulos principales
        await initCalculator();
        initHistory();
        initNavigation('calculator');

        // 6. Exponer funciones globales al window (para compatibilidad con HTML inline)
        window.saveToHistory = saveToHistory;
        window.copyBudgetToClipboard = copyBudgetToClipboard;
        window.confirmClearHistory = confirmClearHistory;
        window.cancelConfirmation = cancelConfirmation;
        window.toggleDisplayCurrency = toggleDisplayCurrency;
        window.previousPage = previousPage;
        window.nextPage = nextPage;

        // 7. Exponer instancia de DB al window para otros scripts que la necesiten
        window.dbInstance = getDB();

        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
        
        // Mostrar error al usuario
        const container = document.querySelector('.page-container');
        if (container) {
            container.innerHTML = `
                <div class="card-container text-center">
                    <div class="text-red-500 text-xl mb-4">❌ Error al inicializar la aplicación</div>
                    <p class="text-gray-400 mb-4">${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOMContentLoaded ya se disparó
    initApp();
}
