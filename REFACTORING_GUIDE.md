/**
 * ========================================
 * GUÍA DE REFACTORIZACIÓN: app.js
 * ========================================
 * 
 * Esta guía te ayudará a refactorizar app.js paso a paso
 * para usar la nueva arquitectura con IndexedDB.
 */

// ============================================
// PASO 1: IMPORTAR EL SERVICIO
// ============================================

// Al inicio de app.js, agrega:
import { useDB, initializeDB } from './database/databaseProvider.js';
import migrationService from './database/migrationService.js';

// ============================================
// PASO 2: ELIMINAR/COMENTAR CÓDIGO LEGACY
// ============================================

// ELIMINAR o COMENTAR estas líneas:
/*
const DEFAULT_DATA = { ... };

function loadData() {
    const saved = localStorage.getItem('plugfixData');
    if (!saved) {
        localStorage.setItem('plugfixData', JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
    return JSON.parse(saved);
}

function saveData(data) {
    localStorage.setItem('plugfixData', JSON.stringify(data));
}

let appData = loadData();
*/

// ============================================
// PASO 3: INICIALIZACIÓN
// ============================================

// Reemplazar la inicialización por:
async function initApp() {
    try {
        // Ejecutar migración automática
        await migrationService.executeMigration();
        
        // Inicializar base de datos
        await initializeDB();
        
        console.log('✅ Aplicación inicializada');
        
        // Cargar datos iniciales en la UI
        await loadInitialData();
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        alert('Error al cargar la aplicación');
    }
}

async function loadInitialData() {
    await Promise.all([
        loadBrandsToUI(),
        loadServicesToUI(),
        loadConfigToUI()
    ]);
}

// ============================================
// PASO 4: REFACTORIZAR FUNCIONES - BRANDS
// ============================================

// ANTES (localStorage):
/*
function loadBrandsUI() {
    const brands = appData.brands;
    // ... renderizar UI
}
*/

// DESPUÉS (IndexedDB):
async function loadBrandsToUI() {
    const db = useDB();
    const brands = await db.getAllBrands();
    
    // Actualizar datalist
    const datalist = document.getElementById('brand-list');
    datalist.innerHTML = '';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.name;
        option.dataset.id = brand.id;
        datalist.appendChild(option);
    });
}

// ANTES:
/*
function addBrand() {
    const name = document.getElementById('new-brand').value;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    appData.brands.push({ id, name, models: [] });
    saveData(appData);
}
*/

// DESPUÉS:
async function addBrand() {
    const name = document.getElementById('new-brand').value.trim();
    
    if (!name) {
        showToast('❌ Ingresa un nombre de marca', 'error');
        return;
    }
    
    try {
        const db = useDB();
        await db.addBrand({ name });
        
        showToast('✅ Marca agregada', 'success');
        document.getElementById('new-brand').value = '';
        
        await loadBrandsToUI();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al agregar marca', 'error');
    }
}

// ANTES:
/*
function deleteBrand(brandId) {
    appData.brands = appData.brands.filter(b => b.id !== brandId);
    saveData(appData);
}
*/

// DESPUÉS:
async function deleteBrand(brandId) {
    if (!confirm('¿Eliminar esta marca y todos sus modelos?')) {
        return;
    }
    
    try {
        const db = useDB();
        await db.deleteBrand(brandId);
        
        showToast('✅ Marca eliminada', 'success');
        await loadBrandsToUI();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al eliminar marca', 'error');
    }
}

// ============================================
// PASO 5: REFACTORIZAR FUNCIONES - MODELS
// ============================================

// ANTES:
/*
function loadModelsByBrand(brandId) {
    const brand = appData.brands.find(b => b.id === brandId);
    return brand ? brand.models : [];
}
*/

// DESPUÉS:
async function loadModelsByBrandToUI(brandId) {
    const db = useDB();
    const models = await db.getModelsByBrand(brandId);
    
    // Actualizar datalist
    const datalist = document.getElementById('model-list');
    datalist.innerHTML = '';
    
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.dataset.id = model.id;
        option.dataset.risk = model.riskFactor;
        datalist.appendChild(option);
    });
    
    // Habilitar input
    const modelInput = document.getElementById('calc-model');
    modelInput.disabled = false;
    modelInput.placeholder = 'Escribe o selecciona un modelo...';
}

// ANTES:
/*
function addModel() {
    const brandName = document.getElementById('model-brand-select').value;
    const modelName = document.getElementById('new-model-name').value;
    const risk = document.getElementById('new-model-risk').value;
    
    const brand = appData.brands.find(b => b.name === brandName);
    if (!brand) return;
    
    const id = modelName.toLowerCase().replace(/\s+/g, '-');
    brand.models.push({ id, name: modelName, riskFactor: parseFloat(risk) });
    saveData(appData);
}
*/

// DESPUÉS:
async function addModel() {
    const brandName = document.getElementById('model-brand-select').value.trim();
    const modelName = document.getElementById('new-model-name').value.trim();
    const riskFactor = parseFloat(document.getElementById('new-model-risk').value);
    
    if (!brandName || !modelName) {
        showToast('❌ Completa todos los campos', 'error');
        return;
    }
    
    try {
        const db = useDB();
        
        // Buscar marca por nombre
        const brands = await db.searchBrands(brandName);
        const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
        
        if (!brand) {
            showToast('❌ Marca no encontrada', 'error');
            return;
        }
        
        // Agregar modelo
        await db.addModel({
            brandId: brand.id,
            name: modelName,
            riskFactor
        });
        
        showToast('✅ Modelo agregado', 'success');
        
        // Limpiar formulario
        document.getElementById('new-model-name').value = '';
        
        // Recargar modelos si es la marca actual
        await loadModelsByBrandToUI(brand.id);
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al agregar modelo', 'error');
    }
}

// ============================================
// PASO 6: REFACTORIZAR FUNCIONES - SERVICES
// ============================================

// ANTES:
/*
function loadServicesUI() {
    const services = appData.services;
    // ... renderizar
}
*/

// DESPUÉS:
async function loadServicesToUI() {
    const db = useDB();
    const services = await db.getAllServices();
    
    // Actualizar datalist
    const datalist = document.getElementById('service-list');
    datalist.innerHTML = '';
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name;
        option.dataset.id = service.id;
        option.dataset.hours = service.hours;
        datalist.appendChild(option);
    });
}

// ANTES:
/*
function addService() {
    const name = document.getElementById('new-service-name').value;
    const hours = document.getElementById('new-service-hours').value;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    appData.services.push({ id, name, hours: parseFloat(hours) });
    saveData(appData);
}
*/

// DESPUÉS:
async function addService() {
    const name = document.getElementById('new-service-name').value.trim();
    const hours = parseFloat(document.getElementById('new-service-hours').value);
    
    if (!name || !hours) {
        showToast('❌ Completa todos los campos', 'error');
        return;
    }
    
    try {
        const db = useDB();
        await db.addService({ name, hours });
        
        showToast('✅ Servicio agregado', 'success');
        
        // Limpiar formulario
        document.getElementById('new-service-name').value = '';
        document.getElementById('new-service-hours').value = '';
        
        await loadServicesToUI();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al agregar servicio', 'error');
    }
}

// ============================================
// PASO 7: REFACTORIZAR CONFIG
// ============================================

// ANTES:
/*
function loadConfig() {
    document.getElementById('config-hour-rate').value = appData.config.hourlyRate;
    document.getElementById('config-margin').value = appData.config.margin;
    document.getElementById('config-usd-rate').value = appData.config.usdRate;
}
*/

// DESPUÉS:
async function loadConfigToUI() {
    const db = useDB();
    const config = await db.getConfig();
    
    document.getElementById('config-hour-rate').value = config.hourlyRate;
    document.getElementById('config-margin').value = config.margin;
    document.getElementById('config-usd-rate').value = config.usdRate;
}

// ANTES:
/*
function saveConfig() {
    appData.config.hourlyRate = parseFloat(document.getElementById('config-hour-rate').value);
    appData.config.margin = parseFloat(document.getElementById('config-margin').value);
    appData.config.usdRate = parseFloat(document.getElementById('config-usd-rate').value);
    saveData(appData);
}
*/

// DESPUÉS:
async function saveConfig() {
    try {
        const db = useDB();
        
        await db.updateConfig({
            hourlyRate: parseFloat(document.getElementById('config-hour-rate').value),
            margin: parseFloat(document.getElementById('config-margin').value),
            usdRate: parseFloat(document.getElementById('config-usd-rate').value)
        });
        
        showToast('✅ Configuración guardada', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al guardar configuración', 'error');
    }
}

// ============================================
// PASO 8: REFACTORIZAR HISTORIAL (MÁS IMPORTANTE)
// ============================================

// ANTES:
/*
function saveToHistory(data) {
    appData.history.push({
        id: Date.now().toString(),
        ...data,
        date: new Date().toISOString()
    });
    saveData(appData);
}
*/

// DESPUÉS:
async function saveToHistory(repairData) {
    try {
        const db = useDB();
        
        await db.addHistoryEntry({
            clientName: repairData.clientName || '',
            brand: repairData.brand,
            model: repairData.model,
            service: repairData.service,
            partCost: parseFloat(repairData.partCost),
            currency: repairData.currency,
            finalPrice: parseFloat(repairData.finalPrice),
            breakdown: repairData.breakdown
        });
        
        showToast('✅ Reparación guardada en el historial', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al guardar en el historial', 'error');
    }
}

// ANTES:
/*
function loadHistory() {
    const history = appData.history.reverse();
    // ... renderizar
}
*/

// DESPUÉS:
async function loadHistoryToUI() {
    const db = useDB();
    const history = await db.getAllHistory(100); // Últimas 100 entradas
    
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    if (history.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay reparaciones en el historial</p>';
        return;
    }
    
    history.forEach(entry => {
        const item = createHistoryItemElement(entry);
        container.appendChild(item);
    });
}

// ANTES:
/*
function deleteHistoryEntry(id) {
    appData.history = appData.history.filter(h => h.id !== id);
    saveData(appData);
}
*/

// DESPUÉS:
async function deleteHistoryEntry(id) {
    if (!confirm('¿Eliminar esta entrada del historial?')) {
        return;
    }
    
    try {
        const db = useDB();
        await db.deleteHistoryEntry(id);
        
        showToast('✅ Entrada eliminada', 'success');
        await loadHistoryToUI();
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al eliminar entrada', 'error');
    }
}

// ============================================
// PASO 9: FUNCIÓN DE CÁLCULO PRINCIPAL
// ============================================

// DESPUÉS (integración completa):
async function calculatePrice() {
    try {
        const db = useDB();
        
        // 1. Obtener datos del formulario
        const clientName = document.getElementById('calc-client-name').value.trim();
        const brandName = document.getElementById('calc-brand').value.trim();
        const modelName = document.getElementById('calc-model').value.trim();
        const serviceName = document.getElementById('calc-service').value.trim();
        const partCost = parseFloat(document.getElementById('calc-cost').value);
        const currency = document.getElementById('calc-currency').value;
        
        // 2. Validar
        if (!brandName || !modelName || !serviceName || !partCost) {
            showToast('❌ Completa todos los campos', 'error');
            return;
        }
        
        // 3. Obtener configuración
        const config = await db.getConfig();
        
        // 4. Buscar modelo para obtener riskFactor
        const models = await db.searchModels(modelName);
        const model = models.find(m => m.name.toLowerCase() === modelName.toLowerCase());
        const riskFactor = model ? model.riskFactor : 1.0;
        
        // 5. Buscar servicio para obtener horas
        const services = await db.searchServices(serviceName);
        const service = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
        const hours = service ? service.hours : 1.0;
        
        // 6. Calcular precio (tu lógica existente)
        const partCostInARS = currency === 'USD' ? partCost * config.usdRate : partCost;
        const laborCost = config.hourlyRate * hours * riskFactor;
        const subtotal = partCostInARS + laborCost;
        const marginAmount = subtotal * (config.margin / 100);
        const finalPrice = Math.round(subtotal + marginAmount);
        
        // 7. Mostrar resultado
        displayResult(finalPrice, {
            partCostInARS,
            laborCost,
            subtotal,
            marginAmount
        });
        
        // 8. Guardar en historial (si el usuario lo confirma después)
        // Se puede llamar manualmente con un botón "Guardar en Historial"
        
    } catch (error) {
        console.error('Error al calcular:', error);
        showToast('❌ Error en el cálculo', 'error');
    }
}

// ============================================
// PASO 10: EVENT LISTENERS
// ============================================

// AL FINAL DE app.js, reemplazar:

// ANTES:
/*
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderUI();
});
*/

// DESPUÉS:
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar aplicación
    await initApp();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Marca - cargar modelos cuando cambie
    const brandInput = document.getElementById('calc-brand');
    if (brandInput) {
        brandInput.addEventListener('change', async (e) => {
            const brandName = e.target.value;
            const db = useDB();
            const brands = await db.searchBrands(brandName);
            const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
            
            if (brand) {
                await loadModelsByBrandToUI(brand.id);
            }
        });
    }
    
    // Más listeners...
}

// ============================================
// RESUMEN DE CAMBIOS
// ============================================

/**
 * PATRÓN GENERAL:
 * 
 * 1. Eliminar referencias a `appData` y `localStorage`
 * 2. Convertir todas las funciones relevantes a `async`
 * 3. Obtener instancia con `const db = useDB()`
 * 4. Usar métodos de la interface: `await db.metodo()`
 * 5. Manejar errores con try/catch
 * 6. Actualizar UI después de cambios
 * 
 * EJEMPLO RÁPIDO:
 * 
 * // ANTES:
 * function getData() {
 *     return appData.brands;
 * }
 * 
 * // DESPUÉS:
 * async function getData() {
 *     const db = useDB();
 *     return await db.getAllBrands();
 * }
 */

export {
    initApp,
    loadBrandsToUI,
    addBrand,
    deleteBrand,
    loadModelsByBrandToUI,
    addModel,
    loadServicesToUI,
    addService,
    loadConfigToUI,
    saveConfig,
    saveToHistory,
    loadHistoryToUI,
    deleteHistoryEntry,
    calculatePrice
};
