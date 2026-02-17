/**
 * ========================================
 * SCRIPT DE VALIDACIÓN: Samsung Serie S
 * ========================================
 * 
 * Este script valida que todos los modelos Samsung Serie S
 * se hayan cargado correctamente en la base de datos.
 * 
 * INSTRUCCIONES:
 * 1. Abre index.html o database.html en tu navegador
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega este script en la consola
 * 4. Presiona Enter
 */

(async function validateSamsungSeeding() {
    console.log('🔍 Iniciando validación de modelos Samsung Serie S...\n');
    
    try {
        // Importar el provider
        const { useDB, initializeDB } = await import('./database/databaseProvider.js');
        
        // Inicializar DB
        await initializeDB();
        const db = useDB();
        
        // 1. Verificar que Samsung existe
        console.log('📌 Paso 1: Verificando marca Samsung...');
        const brands = await db.getAllBrands();
        const samsung = brands.find(b => b.name === 'Samsung');
        
        if (!samsung) {
            console.error('❌ Error: Marca Samsung no encontrada');
            return;
        }
        console.log('✅ Marca Samsung encontrada:', samsung);
        
        // 2. Obtener todos los modelos Samsung
        console.log('\n📌 Paso 2: Obteniendo modelos Samsung...');
        const samsungModels = await db.getModelsByBrand(samsung.id);
        console.log(`✅ Total modelos cargados: ${samsungModels.length}`);
        
        // 3. Validar cantidad esperada
        const expectedCount = 43; // 42 Serie S + 1 A14
        if (samsungModels.length < expectedCount) {
            console.warn(`⚠️ Advertencia: Se esperaban al menos ${expectedCount} modelos, pero se encontraron ${samsungModels.length}`);
        } else {
            console.log(`✅ Cantidad correcta de modelos (≥ ${expectedCount})`);
        }
        
        // 4. Agrupar por generación
        console.log('\n📌 Paso 3: Agrupando modelos por generación...');
        
        const generations = {
            'S6': [],
            'S7': [],
            'S8': [],
            'S9': [],
            'S10': [],
            'S20': [],
            'S21': [],
            'S22': [],
            'S23': [],
            'S24': [],
            'S25': [],
            'S26': [],
            'Otros': []
        };
        
        samsungModels.forEach(model => {
            let found = false;
            for (const gen in generations) {
                if (model.name.includes(gen)) {
                    generations[gen].push(model);
                    found = true;
                    break;
                }
            }
            if (!found) {
                generations['Otros'].push(model);
            }
        });
        
        // Mostrar resumen por generación
        console.log('\n📊 RESUMEN POR GENERACIÓN:');
        console.log('═'.repeat(60));
        for (const [gen, models] of Object.entries(generations)) {
            if (models.length > 0) {
                console.log(`\n${gen} (${models.length} modelos):`);
                models.forEach(m => {
                    console.log(`  • ${m.name} - ${m.category || 'N/A'} - Factor: ${m.riskFactor}x`);
                });
            }
        }
        
        // 5. Validar factores de riesgo
        console.log('\n📌 Paso 4: Validando factores de riesgo...');
        const invalidFactors = samsungModels.filter(m => m.riskFactor < 1.0 || m.riskFactor > 2.5);
        if (invalidFactors.length > 0) {
            console.warn('⚠️ Modelos con factores fuera de rango (1.0 - 2.5):');
            invalidFactors.forEach(m => console.warn(`  • ${m.name}: ${m.riskFactor}x`));
        } else {
            console.log('✅ Todos los factores de riesgo están en rango válido');
        }
        
        // 6. Verificar modelos clave
        console.log('\n📌 Paso 5: Verificando modelos clave...');
        const keyModels = [
            'Galaxy S6',
            'Galaxy S10',
            'Galaxy S20 Ultra',
            'Galaxy S23 Ultra',
            'Galaxy S24 Ultra',
            'Galaxy S26 Ultra'
        ];
        
        keyModels.forEach(modelName => {
            const found = samsungModels.find(m => m.name === modelName);
            if (found) {
                console.log(`✅ ${modelName} - Factor: ${found.riskFactor}x`);
            } else {
                console.error(`❌ ${modelName} - NO ENCONTRADO`);
            }
        });
        
        // 7. Estadísticas finales
        console.log('\n' + '═'.repeat(60));
        console.log('📈 ESTADÍSTICAS FINALES:');
        console.log('═'.repeat(60));
        
        const stats = {
            total: samsungModels.length,
            gamaBaja: samsungModels.filter(m => m.category?.includes('Baja')).length,
            gamaMedia: samsungModels.filter(m => m.category?.includes('Media')).length,
            gamaAlta: samsungModels.filter(m => m.category?.includes('Alta')).length,
            premium: samsungModels.filter(m => m.category?.includes('Premium')).length,
            avgRiskFactor: (samsungModels.reduce((sum, m) => sum + m.riskFactor, 0) / samsungModels.length).toFixed(2),
            minRiskFactor: Math.min(...samsungModels.map(m => m.riskFactor)),
            maxRiskFactor: Math.max(...samsungModels.map(m => m.riskFactor))
        };
        
        console.log(`Total de modelos: ${stats.total}`);
        console.log(`  • Gama Baja: ${stats.gamaBaja}`);
        console.log(`  • Gama Media: ${stats.gamaMedia}`);
        console.log(`  • Gama Alta: ${stats.gamaAlta}`);
        console.log(`  • Premium: ${stats.premium}`);
        console.log(`\nFactores de Riesgo:`);
        console.log(`  • Promedio: ${stats.avgRiskFactor}x`);
        console.log(`  • Mínimo: ${stats.minRiskFactor}x`);
        console.log(`  • Máximo: ${stats.maxRiskFactor}x`);
        
        // Resultado final
        console.log('\n' + '═'.repeat(60));
        if (samsungModels.length >= expectedCount && invalidFactors.length === 0) {
            console.log('✅ VALIDACIÓN EXITOSA: Todos los modelos Samsung están correctos');
        } else {
            console.warn('⚠️ VALIDACIÓN CON ADVERTENCIAS: Revisa los mensajes anteriores');
        }
        console.log('═'.repeat(60) + '\n');
        
        // Devolver datos para inspección adicional
        return {
            success: true,
            samsung,
            models: samsungModels,
            stats,
            generations
        };
        
    } catch (error) {
        console.error('❌ Error durante la validación:', error);
        console.error(error.stack);
        return { success: false, error: error.message };
    }
})();
