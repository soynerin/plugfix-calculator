/**
 * Calculator UI Module - Gestión de la Interfaz del Calculador
 * 
 * Maneja toda la interacción del usuario con la calculadora:
 * - Event listeners de los inputs
 * - Cascading selects (marca -> modelo)
 * - Validaciones y warnings
 * - Integración con el módulo de cálculo
 */

import { getDB } from '../../services/db.js';
import { 
    calculatePrice, 
    updatePriceDisplay, 
    toggleDisplayCurrency, 
    getLastCalculation,
    getDisplayCurrency,
    setDisplayCurrency,
    generateBudgetText
} from './calculator.js';
import { showToast } from '../../utils/toast.js';

// Estado local
let hasUnsavedChanges = false;

/**
 * Obtiene si hay cambios sin guardar
 * @returns {boolean}
 */
export function getHasUnsavedChanges() {
    return hasUnsavedChanges;
}

/**
 * Establece el estado de cambios sin guardar
 * @param {boolean} value
 */
export function setHasUnsavedChanges(value) {
    hasUnsavedChanges = value;
}

/**
 * Inicializa el módulo de calculadora
 * Carga datos iniciales y configura event listeners
 */
export async function initCalculator() {
    try {
        const db = getDB();

        // Cargar marcas en el datalist
        const brandList = document.getElementById('brand-list');
        if (brandList) {
            brandList.innerHTML = '';
            const brands = await db.brands.toArray();
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.name;
                option.dataset.id = brand.id;
                brandList.appendChild(option);
            });
        }

        // Cargar servicios en el datalist
        const serviceList = document.getElementById('service-list');
        if (serviceList) {
            serviceList.innerHTML = '';
            const services = await db.services.toArray();
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.name;
                option.dataset.id = service.id;
                option.dataset.hours = service.hours;
                serviceList.appendChild(option);
            });
        }

        // Configurar event listeners
        setupEventListeners();
        
        console.log('✅ Módulo calculadora inicializado');
    } catch (error) {
        console.error('Error al inicializar calculadora:', error);
        showToast('Error al cargar datos de la calculadora', 'error');
    }
}

/**
 * Configura todos los event listeners del calculador
 */
function setupEventListeners() {
    // Event listener para cambio de marca (Cascading Select)
    const brandInput = document.getElementById('calc-brand');
    if (brandInput) {
        brandInput.addEventListener('input', handleBrandChange);
    }

    // Event listeners para cálculo reactivo
    const modelInput = document.getElementById('calc-model');
    const serviceInput = document.getElementById('calc-service');
    const costInput = document.getElementById('calc-cost');
    const currencySelect = document.getElementById('calc-currency');

    if (modelInput) {
        modelInput.addEventListener('input', () => {
            hasUnsavedChanges = true;
            updateLastCostHint();
            performCalculation();
        });
    }

    if (serviceInput) {
        serviceInput.addEventListener('input', () => {
            hasUnsavedChanges = true;
            updateLastCostHint();
            performCalculation();
        });
    }

    if (costInput) {
        costInput.addEventListener('input', () => {
            hasUnsavedChanges = true;
            checkUSDWarning();
            performCalculation();
        });
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', () => {
            hasUnsavedChanges = true;
            checkUSDWarning();
            
            // Sincronizar moneda de input con visualización
            const selectedCurrency = currencySelect.value;
            setDisplayCurrency(selectedCurrency);
            
            performCalculation();
        });
    }

    // Event listener para toggle de moneda
    const toggleBtn = document.getElementById('currency-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleDisplayCurrency();
        });
    }
}

/**
 * Maneja el cambio de marca (carga modelos correspondientes)
 */
async function handleBrandChange() {
    const brandInput = document.getElementById('calc-brand');
    const modelList = document.getElementById('model-list');
    const modelInput = document.getElementById('calc-model');

    if (!brandInput || !modelList || !modelInput) return;

    const brandValue = brandInput.value;
    
    // Limpiar modelos
    modelList.innerHTML = '';
    modelInput.value = '';

    if (!brandValue) {
        modelInput.disabled = true;
        modelInput.placeholder = 'Primero selecciona una marca';
        return;
    }

    try {
        const db = getDB();
        
        // Buscar marca
        const brands = await db.brands.where('name').equals(brandValue).toArray();
        const brand = brands[0];
        
        if (brand) {
            modelInput.disabled = false;
            modelInput.placeholder = 'Escribe o selecciona un modelo...';
            
            // Cargar modelos filtrados por marca
            const models = await db.models
                .where('brandId').equals(brand.id)
                .sortBy('name');
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.dataset.id = model.id;
                option.dataset.risk = model.riskFactor;
                modelList.appendChild(option);
            });
        } else {
            modelInput.disabled = true;
            modelInput.placeholder = 'Primero selecciona una marca';
        }
    } catch (error) {
        console.error('Error al cargar modelos:', error);
        modelInput.disabled = true;
        modelInput.placeholder = 'Error al cargar modelos';
    }

    hasUnsavedChanges = true;
    updateLastCostHint();
    performCalculation();
}

/**
 * Ejecuta el cálculo de precio y actualiza la UI
 */
async function performCalculation() {
    try {
        const params = {
            clientName: document.getElementById('calc-client-name')?.value.trim() || '',
            brand: document.getElementById('calc-brand')?.value || '',
            model: document.getElementById('calc-model')?.value || '',
            service: document.getElementById('calc-service')?.value || '',
            inputCost: parseFloat(document.getElementById('calc-cost')?.value) || 0,
            inputCurrency: document.getElementById('calc-currency')?.value || 'ARS'
        };

        const result = await calculatePrice(params);
        updatePriceDisplay(result);
    } catch (error) {
        console.error('Error al calcular precio:', error);
        showToast('Error al calcular el precio', 'error');
    }
}

/**
 * Valida y muestra advertencia si el valor en USD es sospechosamente alto
 */
function checkUSDWarning() {
    const costInput = document.getElementById('calc-cost');
    const currencySelect = document.getElementById('calc-currency');
    const warningElement = document.getElementById('usd-warning');

    if (!costInput || !currencySelect || !warningElement) return;

    const cost = parseFloat(costInput.value) || 0;
    const currency = currencySelect.value;
    
    if (currency === 'USD' && cost > 1000) {
        warningElement.classList.remove('hidden');
    } else {
        warningElement.classList.add('hidden');
    }
}

/**
 * Busca y muestra el último costo registrado para una combinación marca+modelo+servicio
 */
async function updateLastCostHint() {
    const brandValue = document.getElementById('calc-brand')?.value;
    const modelValue = document.getElementById('calc-model')?.value;
    const serviceValue = document.getElementById('calc-service')?.value;
    const lastCostHint = document.getElementById('last-cost-hint');
    const lastCostValue = document.getElementById('last-cost-value');
    const costInput = document.getElementById('calc-cost');
    const currencySelect = document.getElementById('calc-currency');

    if (!lastCostHint || !lastCostValue) return;

    // Si no están todos los campos seleccionados, ocultar el hint
    if (!brandValue || !modelValue || !serviceValue) {
        lastCostHint.classList.add('hidden');
        return;
    }

    try {
        const db = getDB();
        
        // Buscar en el historial la última reparación con esta combinación
        const historyItems = await db.history
            .where('brand').equals(brandValue)
            .and(item => item.model === modelValue && item.service === serviceValue)
            .limit(1)
            .toArray();
        
        const lastRepair = historyItems[0];

        if (lastRepair && lastRepair.cost) {
            // Mostrar el último costo registrado
            lastCostValue.textContent = `$${Math.round(lastRepair.cost).toLocaleString('es-AR')}`;
            lastCostHint.classList.remove('hidden');
            
            // Si el campo de costo está vacío, pre-llenar con el último valor
            if (costInput && (!costInput.value || costInput.value === '0')) {
                costInput.value = Math.round(lastRepair.cost);
                
                // Como el historial guarda en ARS, asegurar que la moneda sea ARS
                if (currencySelect) {
                    currencySelect.value = 'ARS';
                }
                
                // Recalcular el precio con el nuevo valor
                performCalculation();
            }
        } else {
            // No hay historial para esta combinación
            lastCostHint.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error al buscar último costo:', error);
        lastCostHint.classList.add('hidden');
    }
}

/**
 * Copia el presupuesto al portapapeles
 */
export async function copyBudgetToClipboard() {
    const calculation = getLastCalculation();
    
    if (!calculation) {
        showToast('No hay presupuesto para copiar', 'error');
        return;
    }

    try {
        const budgetText = generateBudgetText(calculation);

        // Intentar copiar con la API moderna
        await navigator.clipboard.writeText(budgetText);
        showToast('✅ Presupuesto copiado al portapapeles');
    } catch (err) {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = generateBudgetText(calculation);
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('✅ Presupuesto copiado al portapapeles');
        } catch (err) {
            showToast('❌ Error al copiar. Intenta nuevamente', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

/**
 * Resetea el formulario de la calculadora
 */
export function resetCalculator() {
    document.getElementById('calc-client-name').value = '';
    document.getElementById('calc-brand').value = '';
    document.getElementById('calc-model').value = '';
    document.getElementById('calc-service').value = '';
    document.getElementById('calc-cost').value = '';
    document.getElementById('calc-currency').value = 'ARS';
    
    const modelInput = document.getElementById('calc-model');
    if (modelInput) {
        modelInput.disabled = true;
        modelInput.placeholder = 'Primero selecciona una marca';
    }
    
    document.getElementById('result-container')?.classList.add('hidden');
    document.getElementById('usd-warning')?.classList.add('hidden');
    document.getElementById('last-cost-hint')?.classList.add('hidden');
    
    hasUnsavedChanges = false;
}
