/**
 * History Module - Gestión del Historial de Cálculos
 * 
 * Maneja el historial de presupuestos:
 * - Guardar cálculos en IndexedDB
 * - Renderizar tabla de historial
 * - Paginación
 * - Métricas mensuales
 * - Eliminación de historial
 */

import { getDB } from '../../services/db.js';
import { formatARS } from '../../utils/formatters.js';
import { showToast } from '../../utils/toast.js';
import { showConfirmation } from '../../utils/modal.js';
import { getLastCalculation } from '../calculator/calculator.js';
import { setHasUnsavedChanges } from '../calculator/calculatorUI.js';

// Estado del módulo
let currentPage = 1;
const itemsPerPage = 5;

/**
 * Guarda el último cálculo en el historial
 */
export async function saveToHistory() {
    const calculation = getLastCalculation();
    
    if (!calculation) {
        showToast('No hay cálculo para guardar', 'error');
        return;
    }

    try {
        const db = getDB();
        
        // Crear entrada de historial
        const historyEntry = {
            id: Date.now(), // ID único basado en timestamp
            date: calculation.date,
            clientName: calculation.clientName || '',
            brand: calculation.brand,
            model: calculation.model,
            service: calculation.service,
            cost: calculation.cost,
            price: calculation.price,
            priceUSD: calculation.priceUSD,
            profit: calculation.profit,
            dolarRate: calculation.dolarRate
        };

        await db.history.add(historyEntry);
        
        // Limpiar historial si supera 100 entradas (mantener solo las más recientes)
        const count = await db.history.count();
        if (count > 100) {
            const oldEntries = await db.history
                .orderBy('id')
                .limit(count - 100)
                .toArray();
            
            const idsToDelete = oldEntries.map(e => e.id);
            await db.history.bulkDelete(idsToDelete);
        }

        setHasUnsavedChanges(false);
        currentPage = 1; // Ir a la primera página al guardar nuevo
        await renderHistory();
        showToast('¡Guardado en historial!');
    } catch (error) {
        console.error('Error al guardar en historial:', error);
        showToast('Error al guardar en historial', 'error');
    }
}

/**
 * Renderiza la tabla de historial con paginación
 */
export async function renderHistory() {
    const historyList = document.getElementById('history-list');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!historyList) return;

    try {
        const db = getDB();
        
        // Actualizar métricas mensuales
        await calculateMonthlyMetrics();
        
        // Obtener total de entradas
        const totalEntries = await db.history.count();
        
        if (totalEntries === 0) {
            historyList.innerHTML = '<tr><td colspan="5" class="text-gray-500 text-center py-8">No hay cálculos recientes</td></tr>';
            if (paginationContainer) {
                paginationContainer.classList.add('hidden');
            }
            return;
        }
        
        // Calcular paginación
        const totalPages = Math.ceil(totalEntries / itemsPerPage);
        const offset = (currentPage - 1) * itemsPerPage;
        
        // Obtener items de la página actual (ordenados por ID desc = más recientes primero)
        const pageItems = await db.history
            .orderBy('id')
            .reverse()
            .offset(offset)
            .limit(itemsPerPage)
            .toArray();
        
        // Renderizar tabla (responsive)
        historyList.innerHTML = pageItems.map(item => `
            <tr class="block md:table-row border-b border-slate-700 hover:bg-slate-700/30 transition mb-3 md:mb-0 rounded-lg md:rounded-none p-3 md:p-0 bg-slate-800/30 md:bg-transparent">
                <!-- Móvil: Card Layout | Desktop: Columna Fecha -->
                <td class="hidden md:table-cell py-3 px-2">
                    <p class="text-gray-400 text-xs">${item.date.split(',')[0]}</p>
                    <p class="text-gray-500 text-[10px]">${item.date.split(',')[1] || ''}</p>
                </td>
                
                <!-- Móvil: Fila Superior (Dispositivo + Precio) | Desktop: Columna Dispositivo -->
                <td class="block md:table-cell py-0 md:py-3 px-0 md:px-2">
                    <div class="flex justify-between items-start md:block">
                        <div>
                            <p class="text-white font-semibold text-base md:text-sm md:font-medium">${item.brand} ${item.model}</p>
                            <p class="text-gray-400 text-sm md:hidden mt-0.5">${item.service}</p>
                        </div>
                        <p class="text-cyan-400 font-bold text-lg md:hidden">${formatARS(item.price)}</p>
                    </div>
                </td>
                
                <!-- Desktop: Columna Servicio (oculto en móvil) -->
                <td class="hidden md:table-cell py-3 px-2">
                    <p class="text-gray-400 text-sm">${item.service}</p>
                </td>
                
                <!-- Desktop: Columna Precio (oculto en móvil) -->
                <td class="hidden md:table-cell py-3 px-2 text-right">
                    <p class="text-cyan-400 font-bold text-sm">${formatARS(item.price)}</p>
                </td>
                
                <!-- Móvil: Fila Inferior (Fecha + Ganancia) | Desktop: Columna Ganancia -->
                <td class="block md:table-cell py-0 md:py-3 px-0 md:px-2 text-left md:text-right mt-2 md:mt-0">
                    <div class="flex justify-between items-center md:block">
                        <p class="text-gray-500 text-xs md:hidden">📅 ${item.date.split(',')[0]}</p>
                        <p class="text-green-400 font-semibold text-sm">+${formatARS(item.profit)}</p>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Actualizar controles de paginación
        if (paginationContainer && totalPages > 1) {
            paginationContainer.classList.remove('hidden');
            
            const pageInfo = document.getElementById('page-info');
            const btnPrev = document.getElementById('btn-prev');
            const btnNext = document.getElementById('btn-next');
            
            if (pageInfo) {
                pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
            }
            
            if (btnPrev) {
                btnPrev.disabled = currentPage === 1;
            }
            
            if (btnNext) {
                btnNext.disabled = currentPage === totalPages;
            }
        } else if (paginationContainer) {
            paginationContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error al renderizar historial:', error);
        historyList.innerHTML = '<tr><td colspan="5" class="text-gray-500 text-center py-8">Error al cargar historial</td></tr>';
    }
}

/**
 * Navega a la página anterior del historial
 */
export function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderHistory();
    }
}

/**
 * Navega a la página siguiente del historial
 */
export function nextPage() {
    currentPage++;
    renderHistory();
}

/**
 * Calcula y actualiza las métricas del mes actual
 */
async function calculateMonthlyMetrics() {
    try {
        const db = getDB();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Obtener todas las entradas del historial
        const allEntries = await db.history.toArray();

        // Filtrar solo los ítems del mes actual
        const currentMonthItems = allEntries.filter(item => {
            try {
                // Parsear la fecha del formato "DD/MM/YYYY, HH:MM:SS"
                const dateParts = item.date.split(',')[0].split('/');
                if (dateParts.length !== 3) return false;
                
                const itemDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
            } catch (error) {
                return false;
            }
        });

        // Calcular métricas
        const repairsCount = currentMonthItems.length;
        const totalRevenue = currentMonthItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const totalProfit = currentMonthItems.reduce((sum, item) => sum + (item.profit || 0), 0);

        // Actualizar el DOM
        const statRepairs = document.getElementById('stat-repairs');
        const statRevenue = document.getElementById('stat-revenue');
        const statProfit = document.getElementById('stat-profit');

        if (statRepairs) {
            statRepairs.textContent = repairsCount;
        }
        
        if (statRevenue) {
            statRevenue.textContent = formatARS(totalRevenue);
        }
        
        if (statProfit) {
            statProfit.textContent = formatARS(totalProfit);
        }
    } catch (error) {
        console.error('Error al calcular métricas mensuales:', error);
    }
}

/**
 * Limpia todo el historial
 */
async function clearHistory() {
    try {
        const db = getDB();
        await db.history.clear();
        
        currentPage = 1;
        await renderHistory();
        showToast('Historial eliminado');
    } catch (error) {
        console.error('Error al limpiar historial:', error);
        showToast('Error al limpiar historial', 'error');
    }
}

/**
 * Muestra confirmación antes de limpiar historial
 */
export function confirmClearHistory() {
    showConfirmation(
        '¿Limpiar historial?',
        'Se eliminará todo el historial de cálculos. Esta acción no se puede deshacer.',
        clearHistory,
        'Eliminar'
    );
}

/**
 * Inicializa el módulo de historial
 */
export function initHistory() {
    // Configurar event listeners para paginación
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    if (btnPrev) {
        btnPrev.addEventListener('click', previousPage);
    }
    
    if (btnNext) {
        btnNext.addEventListener('click', nextPage);
    }
    
    // Renderizar historial inicial
    renderHistory();
    
    console.log('✅ Módulo historial inicializado');
}
