/**
 * ========================================
 * ARCHIVO DE PRUEBAS - TEST SUITE
 * ========================================
 * 
 * Este archivo contiene pruebas simples que puedes ejecutar en la consola
 * del navegador para verificar que todo funciona correctamente.
 */

import { useDB, initializeDB } from './database/databaseProvider.js';
import migrationService from './database/migrationService.js';

// ============================================
// TEST 1: Inicialización
// ============================================

async function test1_initialization() {
    console.log('🧪 TEST 1: Inicialización');
    
    try {
        await initializeDB();
        console.log('✅ Base de datos inicializada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 2: CRUD Brands
// ============================================

async function test2_brands() {
    console.log('🧪 TEST 2: CRUD de Marcas');
    const db = useDB();
    
    try {
        // CREATE
        const brandId = await db.addBrand({ name: 'Test Brand' });
        console.log(`✅ Marca creada con ID: ${brandId}`);
        
        // READ
        const brand = await db.getBrandById(brandId);
        console.log('✅ Marca obtenida:', brand);
        
        // SEARCH
        const results = await db.searchBrands('Test');
        console.log(`✅ Búsqueda: ${results.length} resultados`);
        
        // UPDATE
        await db.updateBrand(brandId, { name: 'Test Brand Updated' });
        const updated = await db.getBrandById(brandId);
        console.log('✅ Marca actualizada:', updated);
        
        // DELETE
        await db.deleteBrand(brandId);
        const deleted = await db.getBrandById(brandId);
        console.log('✅ Marca eliminada:', deleted === undefined);
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 3: CRUD Models
// ============================================

async function test3_models() {
    console.log('🧪 TEST 3: CRUD de Modelos');
    const db = useDB();
    
    try {
        // Crear marca de prueba
        const brandId = await db.addBrand({ name: 'Test Brand' });
        
        // CREATE
        const modelId = await db.addModel({
            brandId: brandId,
            name: 'Test Model',
            riskFactor: 1.5
        });
        console.log(`✅ Modelo creado con ID: ${modelId}`);
        
        // READ
        const models = await db.getModelsByBrand(brandId);
        console.log(`✅ Modelos de la marca: ${models.length}`);
        
        // UPDATE
        await db.updateModel(modelId, { riskFactor: 2.0 });
        const updated = await db.getModelById(modelId);
        console.log('✅ Modelo actualizado:', updated);
        
        // DELETE
        await db.deleteModel(modelId);
        await db.deleteBrand(brandId);
        console.log('✅ Modelo y marca eliminados');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 4: Config
// ============================================

async function test4_config() {
    console.log('🧪 TEST 4: Configuración');
    const db = useDB();
    
    try {
        // READ
        const config = await db.getConfig();
        console.log('✅ Configuración actual:', config);
        
        // UPDATE
        const originalRate = config.hourlyRate;
        await db.updateConfig({ hourlyRate: 99999 });
        
        const updated = await db.getConfig();
        console.log('✅ Configuración actualizada:', updated);
        
        // RESTORE
        await db.updateConfig({ hourlyRate: originalRate });
        console.log('✅ Configuración restaurada');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 5: History
// ============================================

async function test5_history() {
    console.log('🧪 TEST 5: Historial');
    const db = useDB();
    
    try {
        // CREATE
        const entryId = await db.addHistoryEntry({
            clientName: 'Test Client',
            brand: 'Samsung',
            model: 'Galaxy Test',
            service: 'Test Service',
            partCost: 10000,
            currency: 'ARS',
            finalPrice: 25000,
            breakdown: {
                laborCost: 10000,
                partCostInARS: 10000,
                subtotal: 20000,
                marginAmount: 5000
            }
        });
        console.log(`✅ Entrada creada con ID: ${entryId}`);
        
        // READ
        const history = await db.getAllHistory(10);
        console.log(`✅ Historial: ${history.length} entradas`);
        
        // SEARCH
        const results = await db.searchHistory('Test');
        console.log(`✅ Búsqueda: ${results.length} resultados`);
        
        // DELETE
        await db.deleteHistoryEntry(entryId);
        console.log('✅ Entrada eliminada');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 6: Export/Import
// ============================================

async function test6_exportImport() {
    console.log('🧪 TEST 6: Exportar/Importar');
    const db = useDB();
    
    try {
        // EXPORT
        const data = await db.exportData();
        console.log('✅ Datos exportados:', {
            brands: data.brands.length,
            models: data.models.length,
            services: data.services.length,
            history: data.history.length
        });
        
        // IMPORT (mismos datos)
        await db.importData(data);
        console.log('✅ Datos importados correctamente');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 7: Migration Service
// ============================================

async function test7_migration() {
    console.log('🧪 TEST 7: Servicio de Migración');
    
    try {
        const completed = migrationService.isMigrationCompleted();
        console.log(`✅ Migración completada: ${completed}`);
        
        const hasLegacy = migrationService.hasLegacyData();
        console.log(`✅ Tiene datos legacy: ${hasLegacy}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// TEST 8: Performance Test
// ============================================

async function test8_performance() {
    console.log('🧪 TEST 8: Prueba de Rendimiento');
    const db = useDB();
    
    try {
        // Crear muchos datos
        console.log('Insertando 100 entradas de historial...');
        const start = performance.now();
        
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(db.addHistoryEntry({
                clientName: `Test Client ${i}`,
                brand: 'Samsung',
                model: 'Galaxy Test',
                service: 'Test Service',
                partCost: 10000 + i,
                currency: 'ARS',
                finalPrice: 25000 + i,
                breakdown: {}
            }));
        }
        
        await Promise.all(promises);
        const end = performance.now();
        
        console.log(`✅ 100 inserts en ${(end - start).toFixed(2)}ms`);
        
        // Leer todos
        const readStart = performance.now();
        await db.getAllHistory();
        const readEnd = performance.now();
        
        console.log(`✅ Lectura completa en ${(readEnd - readStart).toFixed(2)}ms`);
        
        // Limpiar
        await db.clearHistory();
        console.log('✅ Historial limpiado');
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// ============================================
// EJECUTAR TODOS LOS TESTS
// ============================================

async function runAllTests() {
    console.log('🚀 INICIANDO TEST SUITE\n');
    
    const tests = [
        { name: 'Inicialización', fn: test1_initialization },
        { name: 'CRUD Brands', fn: test2_brands },
        { name: 'CRUD Models', fn: test3_models },
        { name: 'Config', fn: test4_config },
        { name: 'History', fn: test5_history },
        { name: 'Export/Import', fn: test6_exportImport },
        { name: 'Migration', fn: test7_migration },
        { name: 'Performance', fn: test8_performance }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n${'='.repeat(50)}`);
        const success = await test.fn();
        results.push({ name: test.name, success });
        console.log(`${'='.repeat(50)}\n`);
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Resumen
    console.log('\n📊 RESUMEN DE TESTS\n');
    results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
    });
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`\n${passed}/${total} tests pasados (${(passed/total*100).toFixed(0)}%)`);
}

// ============================================
// FUNCIONES AUXILIARES PARA DEBUGGING
// ============================================

async function inspectDatabase() {
    console.log('🔍 INSPECCIÓN DE LA BASE DE DATOS\n');
    const db = useDB();
    
    const brands = await db.getAllBrands();
    const models = await db.getAllModels();
    const services = await db.getAllServices();
    const config = await db.getConfig();
    const history = await db.getAllHistory();
    
    console.log('📊 Estadísticas:');
    console.log(`  • Marcas: ${brands.length}`);
    console.log(`  • Modelos: ${models.length}`);
    console.log(`  • Servicios: ${services.length}`);
    console.log(`  • Entradas de historial: ${history.length}`);
    console.log(`\n⚙️ Configuración:`, config);
    
    console.log('\n📱 Marcas y Modelos:');
    for (const brand of brands) {
        const brandModels = await db.getModelsByBrand(brand.id);
        console.log(`  • ${brand.name} (${brandModels.length} modelos)`);
        brandModels.forEach(model => {
            console.log(`    - ${model.name} (riesgo: ${model.riskFactor}x)`);
        });
    }
    
    console.log('\n🔧 Servicios:');
    services.forEach(service => {
        console.log(`  • ${service.name} (${service.hours}h)`);
    });
}

async function clearAllTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    const db = useDB();
    
    // Eliminar marcas que empiecen con "Test"
    const brands = await db.getAllBrands();
    for (const brand of brands) {
        if (brand.name.startsWith('Test')) {
            await db.deleteBrand(brand.id);
            console.log(`✅ Eliminada marca: ${brand.name}`);
        }
    }
    
    // Limpiar historial de pruebas
    const history = await db.getAllHistory();
    for (const entry of history) {
        if (entry.clientName && entry.clientName.startsWith('Test')) {
            await db.deleteHistoryEntry(entry.id);
            console.log(`✅ Eliminada entrada de historial: ${entry.id}`);
        }
    }
    
    console.log('✅ Limpieza completada');
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

// Para usar en la consola del navegador:
// > import('./database/testSuite.js').then(m => m.runAllTests())
// > import('./database/testSuite.js').then(m => m.inspectDatabase())

export {
    runAllTests,
    inspectDatabase,
    clearAllTestData,
    test1_initialization,
    test2_brands,
    test3_models,
    test4_config,
    test5_history,
    test6_exportImport,
    test7_migration,
    test8_performance
};

/*
 * ============================================
 * CÓMO EJECUTAR LOS TESTS:
 * ============================================
 * 
 * 1. Abre la aplicación en el navegador
 * 2. Abre la consola del navegador (F12)
 * 3. Ejecuta:
 * 
 *    import('./database/testSuite.js').then(m => m.runAllTests())
 * 
 * Para inspeccionar la base de datos:
 * 
 *    import('./database/testSuite.js').then(m => m.inspectDatabase())
 * 
 * Para limpiar datos de prueba:
 * 
 *    import('./database/testSuite.js').then(m => m.clearAllTestData())
 * 
 * ============================================
 */
