/**
 * ========================================
 * EJEMPLOS DE USO - NUEVA ARQUITECTURA DE DATOS
 * ========================================
 * 
 * Este archivo contiene ejemplos de cómo usar la nueva capa de datos
 * con IndexedDB/Dexie.js en lugar de localStorage.
 * 
 * IMPORTANTE: Los componentes NUNCA llaman directamente a Dexie.js,
 * siempre usan la interface a través de useDB().
 */

import { useDB, initializeDB } from './databaseProvider.js';
import migrationService from './migrationService.js';

// ============================================
// 1. INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

/**
 * Inicializar la base de datos al cargar la aplicación
 * Incluye migración automática desde localStorage si es necesario
 */
async function initializeApp() {
    try {
        // 1. Ejecutar migración si es necesario
        const migrated = await migrationService.executeMigration();
        
        if (migrated) {
            console.log('✅ Datos migrados desde localStorage');
            // Opcional: limpiar localStorage después de migración exitosa
            // migrationService.cleanupLegacyData();
        }

        // 2. Inicializar base de datos
        await initializeDB();
        
        console.log('🚀 Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
    }
}

// Llamar al inicio
// initializeApp();

// ============================================
// 2. OPERACIONES CON MARCAS (BRANDS)
// ============================================

/**
 * Ejemplo: Cargar todas las marcas para un select/datalist
 */
async function loadBrands() {
    const db = useDB();
    const brands = await db.getAllBrands();
    
    console.log('Marcas cargadas:', brands);
    
    // Actualizar UI
    const datalist = document.getElementById('brand-list');
    datalist.innerHTML = '';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.name;
        option.dataset.id = brand.id;
        datalist.appendChild(option);
    });
}

/**
 * Ejemplo: Agregar una nueva marca
 */
async function addNewBrand(brandName) {
    const db = useDB();
    
    try {
        const brandId = await db.addBrand({
            name: brandName
        });
        
        console.log('✅ Marca agregada con ID:', brandId);
        
        // Recargar lista
        await loadBrands();
        
        return brandId;
    } catch (error) {
        console.error('❌ Error al agregar marca:', error);
        throw error;
    }
}

/**
 * Ejemplo: Eliminar una marca
 */
async function deleteBrand(brandId) {
    const db = useDB();
    
    try {
        await db.deleteBrand(brandId);
        console.log('✅ Marca eliminada');
        
        // Recargar lista
        await loadBrands();
    } catch (error) {
        console.error('❌ Error al eliminar marca:', error);
        throw error;
    }
}

/**
 * Ejemplo: Buscar marcas
 */
async function searchBrands(query) {
    const db = useDB();
    const results = await db.searchBrands(query);
    
    console.log(`Encontradas ${results.length} marcas:`, results);
    return results;
}

// ============================================
// 3. OPERACIONES CON MODELOS (MODELS)
// ============================================

/**
 * Ejemplo: Cargar modelos de una marca específica
 */
async function loadModelsByBrand(brandId) {
    const db = useDB();
    const models = await db.getModelsByBrand(brandId);
    
    console.log('Modelos cargados:', models);
    
    // Actualizar UI
    const datalist = document.getElementById('model-list');
    datalist.innerHTML = '';
    
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.dataset.id = model.id;
        option.dataset.risk = model.riskFactor;
        datalist.appendChild(option);
    });
}

/**
 * Ejemplo: Agregar un nuevo modelo
 */
async function addNewModel(brandId, modelName, riskFactor) {
    const db = useDB();
    
    try {
        const modelId = await db.addModel({
            brandId: brandId,
            name: modelName,
            riskFactor: parseFloat(riskFactor) || 1.0
        });
        
        console.log('✅ Modelo agregado con ID:', modelId);
        
        // Recargar modelos
        await loadModelsByBrand(brandId);
        
        return modelId;
    } catch (error) {
        console.error('❌ Error al agregar modelo:', error);
        throw error;
    }
}

// ============================================
// 4. OPERACIONES CON SERVICIOS (SERVICES)
// ============================================

/**
 * Ejemplo: Cargar todos los servicios
 */
async function loadServices() {
    const db = useDB();
    const services = await db.getAllServices();
    
    console.log('Servicios cargados:', services);
    
    // Actualizar UI
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

/**
 * Ejemplo: Agregar un nuevo servicio
 */
async function addNewService(serviceName, hours) {
    const db = useDB();
    
    try {
        const serviceId = await db.addService({
            name: serviceName,
            hours: parseFloat(hours)
        });
        
        console.log('✅ Servicio agregado con ID:', serviceId);
        
        // Recargar servicios
        await loadServices();
        
        return serviceId;
    } catch (error) {
        console.error('❌ Error al agregar servicio:', error);
        throw error;
    }
}

// ============================================
// 5. CONFIGURACIÓN (CONFIG)
// ============================================

/**
 * Ejemplo: Obtener configuración actual
 */
async function getConfiguration() {
    const db = useDB();
    const config = await db.getConfig();
    
    console.log('Configuración actual:', config);
    return config;
}

/**
 * Ejemplo: Actualizar configuración
 */
async function updateConfiguration(hourlyRate, margin, usdRate) {
    const db = useDB();
    
    try {
        await db.updateConfig({
            hourlyRate: parseFloat(hourlyRate),
            margin: parseFloat(margin),
            usdRate: parseFloat(usdRate)
        });
        
        console.log('✅ Configuración actualizada');
    } catch (error) {
        console.error('❌ Error al actualizar configuración:', error);
        throw error;
    }
}

// ============================================
// 6. HISTORIAL (HISTORY) - CASO DE USO PRINCIPAL
// ============================================

/**
 * Ejemplo: Guardar una reparación en el historial
 * Este es el caso de uso más importante de tu aplicación
 */
async function saveRepair(repairData) {
    const db = useDB();
    
    try {
        // Preparar datos de la reparación
        const entry = {
            clientName: repairData.clientName || '',
            brand: repairData.brand,
            model: repairData.model,
            service: repairData.service,
            partCost: parseFloat(repairData.partCost),
            currency: repairData.currency || 'ARS',
            finalPrice: parseFloat(repairData.finalPrice),
            breakdown: repairData.breakdown, // Desglose detallado
            date: new Date().toISOString()
        };
        
        // Guardar en base de datos
        const entryId = await db.addHistoryEntry(entry);
        
        console.log('✅ Reparación guardada con ID:', entryId);
        
        // Mostrar toast de confirmación
        showToast('✅ Reparación guardada en el historial', 'success');
        
        return entryId;
    } catch (error) {
        console.error('❌ Error al guardar reparación:', error);
        showToast('❌ Error al guardar la reparación', 'error');
        throw error;
    }
}

/**
 * Ejemplo de uso completo al calcular un precio
 */
async function calculateAndSavePrice() {
    // 1. Obtener valores del formulario
    const clientName = document.getElementById('calc-client-name').value;
    const brand = document.getElementById('calc-brand').value;
    const model = document.getElementById('calc-model').value;
    const service = document.getElementById('calc-service').value;
    const partCost = parseFloat(document.getElementById('calc-cost').value);
    const currency = document.getElementById('calc-currency').value;
    
    // 2. Obtener configuración
    const db = useDB();
    const config = await db.getConfig();
    
    // 3. Calcular precio (lógica existente)
    const finalPrice = calculatePrice(partCost, config, /* ... otros parámetros */);
    
    // 4. Guardar en historial
    await saveRepair({
        clientName,
        brand,
        model,
        service,
        partCost,
        currency,
        finalPrice,
        breakdown: {
            // ... desglose de costos
        }
    });
}

/**
 * Ejemplo: Cargar historial con paginación
 */
async function loadHistory(limit = 50) {
    const db = useDB();
    const history = await db.getAllHistory(limit);
    
    console.log(`Historial cargado: ${history.length} entradas`);
    
    // Renderizar en la UI
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    history.forEach(entry => {
        const item = createHistoryItem(entry);
        container.appendChild(item);
    });
}

/**
 * Ejemplo: Buscar en el historial
 */
async function searchHistory(query) {
    const db = useDB();
    const results = await db.searchHistory(query);
    
    console.log(`Encontradas ${results.length} reparaciones`);
    return results;
}

/**
 * Ejemplo: Eliminar entrada del historial
 */
async function deleteHistoryEntry(entryId) {
    const db = useDB();
    
    try {
        await db.deleteHistoryEntry(entryId);
        console.log('✅ Entrada eliminada');
        
        // Recargar historial
        await loadHistory();
    } catch (error) {
        console.error('❌ Error al eliminar entrada:', error);
        throw error;
    }
}

// ============================================
// 7. OPERACIONES ESPECIALES
// ============================================

/**
 * Ejemplo: Exportar todos los datos (backup)
 */
async function exportAllData() {
    const db = useDB();
    
    try {
        const data = await db.exportData();
        
        // Descargar como archivo JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plugfix-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        console.log('✅ Datos exportados');
    } catch (error) {
        console.error('❌ Error al exportar datos:', error);
        throw error;
    }
}

/**
 * Ejemplo: Importar datos desde archivo
 */
async function importDataFromFile(file) {
    const db = useDB();
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        await db.importData(data);
        
        console.log('✅ Datos importados correctamente');
        
        // Recargar toda la aplicación
        window.location.reload();
    } catch (error) {
        console.error('❌ Error al importar datos:', error);
        alert('Error al importar datos. Verifica que el archivo sea válido.');
        throw error;
    }
}

/**
 * Ejemplo: Resetear base de datos
 */
async function resetDatabase() {
    const db = useDB();
    
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará TODOS los datos y los restaurará a los valores por defecto.')) {
        return;
    }
    
    try {
        await db.resetDatabase();
        console.log('✅ Base de datos reseteada');
        
        // Recargar aplicación
        window.location.reload();
    } catch (error) {
        console.error('❌ Error al resetear base de datos:', error);
        throw error;
    }
}

// ============================================
// 8. MIGRACIÓN FUTURA A FIREBASE/SUPABASE
// ============================================

/**
 * EJEMPLO: Cómo sería migrar a Firebase
 * 
 * 1. Crear archivo: database/FirestoreService.js
 * 
 * import IDatabaseService from './IDatabaseService.js';
 * import { initializeApp } from 'firebase/app';
 * import { getFirestore, collection, getDocs, addDoc, ... } from 'firebase/firestore';
 * 
 * class FirestoreService extends IDatabaseService {
 *     constructor(config) {
 *         super();
 *         const app = initializeApp(config);
 *         this.db = getFirestore(app);
 *     }
 * 
 *     async getAllBrands() {
 *         const snapshot = await getDocs(collection(this.db, 'brands'));
 *         return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *     }
 * 
 *     // ... implementar todos los métodos de IDatabaseService
 * }
 * 
 * 2. En databaseProvider.js, cambiar:
 * 
 * import FirestoreService from './FirestoreService.js';
 * 
 * this.service = new FirestoreService({
 *     apiKey: "...",
 *     authDomain: "...",
 *     projectId: "...",
 * });
 * 
 * 3. ¡Listo! Todos tus componentes siguen funcionando sin cambios.
 */

// ============================================
// EXPORTAR FUNCIONES DE EJEMPLO
// ============================================

export {
    initializeApp,
    loadBrands,
    addNewBrand,
    deleteBrand,
    searchBrands,
    loadModelsByBrand,
    addNewModel,
    loadServices,
    addNewService,
    getConfiguration,
    updateConfiguration,
    saveRepair,
    loadHistory,
    searchHistory,
    deleteHistoryEntry,
    exportAllData,
    importDataFromFile,
    resetDatabase
};
