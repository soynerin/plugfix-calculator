/**
 * Database Service - Configuración de Dexie.js (IndexedDB)
 * 
 * Este servicio centraliza toda la configuración de la base de datos local
 * usando Dexie.js como wrapper de IndexedDB.
 * 
 * Incluye:
 * - Inicialización de la base de datos
 * - Definición del esquema
 * - Seeding de datos iniciales
 */

/**
 * Instancia de la base de datos Dexie
 * @type {Dexie}
 */
let db = null;

/**
 * Inicializa la base de datos Dexie
 * 
 * @returns {Promise<Dexie>} Instancia de la base de datos
 */
export async function initDB() {
    if (db) {
        return db; // Ya inicializada
    }

    // Crear instancia de Dexie
    db = new Dexie('PlugFixDB');
    
    // Definir esquema de la base de datos
    db.version(1).stores({
        brands: 'id, name',
        models: 'id, brandId, name, riskFactor',
        services: 'id, name, hours',
        config: 'id',
        history: 'id, date, clientName, brand, model, service'
    });

    try {
        await db.open();
        console.log('✅ Base de datos IndexedDB abierta correctamente');
        
        // Verificar si necesita seeding
        const brandsCount = await db.brands.count();
        if (brandsCount === 0) {
            console.log('📦 Inicializando base de datos con datos por defecto...');
            await seedDatabase();
        }
        
        return db;
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        throw error;
    }
}

/**
 * Obtiene la instancia de la base de datos
 * 
 * @returns {Dexie} Instancia de la base de datos
 */
export function getDB() {
    if (!db) {
        throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
    }
    return db;
}

/**
 * Puebla la base de datos con datos iniciales (Seeding)
 * 
 * @returns {Promise<void>}
 */
export async function seedDatabase() {
    try {
        // 1. Configuración por defecto
        await db.config.add({
            id: 'main',
            hourlyRate: 13000,
            margin: 40,
            usdRate: 1200
        });

        // 2. Marcas
        const samsungId = 'samsung';
        const appleId = 'apple';

        await db.brands.bulkAdd([
            { id: samsungId, name: 'Samsung' },
            { id: appleId, name: 'Apple' }
        ]);

        // 3. Modelos Samsung - Serie S Completa
        const samsungModels = [
            { id: 'a14', brandId: samsungId, name: 'Galaxy A14', category: 'Gama Media-Baja', riskFactor: 1.0 },
            
            // Era "Glass & Edge" (Tapas pegadas / Pantallas Curvas)
            { id: 's6', brandId: samsungId, name: 'Galaxy S6', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's6edge', brandId: samsungId, name: 'Galaxy S6 Edge', category: 'Gama Media-Baja', riskFactor: 1.3 },
            { id: 's7', brandId: samsungId, name: 'Galaxy S7', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's7edge', brandId: samsungId, name: 'Galaxy S7 Edge', category: 'Gama Media-Baja', riskFactor: 1.3 },
            { id: 's8', brandId: samsungId, name: 'Galaxy S8', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's8plus', brandId: samsungId, name: 'Galaxy S8+', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's9', brandId: samsungId, name: 'Galaxy S9', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's9plus', brandId: samsungId, name: 'Galaxy S9+', category: 'Gama Media', riskFactor: 1.3 },
            
            // Era Moderna (Hole-punch / Dynamic AMOLED)
            { id: 's10e', brandId: samsungId, name: 'Galaxy S10e', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's10', brandId: samsungId, name: 'Galaxy S10', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's10plus', brandId: samsungId, name: 'Galaxy S10+', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's20', brandId: samsungId, name: 'Galaxy S20', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's20plus', brandId: samsungId, name: 'Galaxy S20+', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's20ultra', brandId: samsungId, name: 'Galaxy S20 Ultra', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's20fe', brandId: samsungId, name: 'Galaxy S20 FE', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's21', brandId: samsungId, name: 'Galaxy S21', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's21plus', brandId: samsungId, name: 'Galaxy S21+', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's21ultra', brandId: samsungId, name: 'Galaxy S21 Ultra', category: 'Gama Alta', riskFactor: 1.7 },
            { id: 's21fe', brandId: samsungId, name: 'Galaxy S21 FE', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's22', brandId: samsungId, name: 'Galaxy S22', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's22plus', brandId: samsungId, name: 'Galaxy S22+', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's22ultra', brandId: samsungId, name: 'Galaxy S22 Ultra', category: 'Gama Alta', riskFactor: 1.7 },
            { id: 's23', brandId: samsungId, name: 'Galaxy S23', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's23plus', brandId: samsungId, name: 'Galaxy S23+', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's23ultra', brandId: samsungId, name: 'Galaxy S23 Ultra', category: 'Gama Alta', riskFactor: 1.8 },
            { id: 's23fe', brandId: samsungId, name: 'Galaxy S23 FE', category: 'Gama Media', riskFactor: 1.5 },
            
            // Gama Reciente (IA Integrada)
            { id: 's24', brandId: samsungId, name: 'Galaxy S24', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's24plus', brandId: samsungId, name: 'Galaxy S24+', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's24ultra', brandId: samsungId, name: 'Galaxy S24 Ultra', category: 'Premium', riskFactor: 1.9 },
            { id: 's24fe', brandId: samsungId, name: 'Galaxy S24 FE', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's25', brandId: samsungId, name: 'Galaxy S25', category: 'Premium', riskFactor: 1.8 },
            { id: 's25plus', brandId: samsungId, name: 'Galaxy S25+', category: 'Premium', riskFactor: 1.8 },
            { id: 's25ultra', brandId: samsungId, name: 'Galaxy S25 Ultra', category: 'Premium', riskFactor: 2.0 },
            
            // Flagships Actuales (2026)
            { id: 's26', brandId: samsungId, name: 'Galaxy S26', category: 'Premium', riskFactor: 2.0 },
            { id: 's26plus', brandId: samsungId, name: 'Galaxy S26+', category: 'Premium', riskFactor: 2.0 },
            { id: 's26ultra', brandId: samsungId, name: 'Galaxy S26 Ultra', category: 'Premium', riskFactor: 2.2 }
        ];

        // 4. Modelos iPhone - Listado Completo
        const iPhoneModels = [
            // Era Touch ID & Primeros Face ID
            { id: 'iphone7', brandId: appleId, name: 'iPhone 7', category: 'Gama Baja', riskFactor: 1.0 },
            { id: 'iphone7plus', brandId: appleId, name: 'iPhone 7 Plus', category: 'Gama Baja', riskFactor: 1.1 },
            { id: 'iphone8', brandId: appleId, name: 'iPhone 8', category: 'Gama Baja', riskFactor: 1.1 },
            { id: 'iphone8plus', brandId: appleId, name: 'iPhone 8 Plus', category: 'Gama Baja', riskFactor: 1.1 },
            { id: 'iphonex', brandId: appleId, name: 'iPhone X', category: 'Gama Media', riskFactor: 1.2 },
            { id: 'iphonexs', brandId: appleId, name: 'iPhone XS', category: 'Gama Media', riskFactor: 1.2 },
            { id: 'iphonexsmax', brandId: appleId, name: 'iPhone XS Max', category: 'Gama Media', riskFactor: 1.2 },
            { id: 'iphonexr', brandId: appleId, name: 'iPhone XR', category: 'Gama Media', riskFactor: 1.2 },
            { id: 'iphone11', brandId: appleId, name: 'iPhone 11', category: 'Gama Media', riskFactor: 1.2 },
            { id: 'iphone11pro', brandId: appleId, name: 'iPhone 11 Pro', category: 'Gama Media', riskFactor: 1.25 },
            { id: 'iphone11promax', brandId: appleId, name: 'iPhone 11 Pro Max', category: 'Gama Media', riskFactor: 1.25 },
            { id: 'iphonese2', brandId: appleId, name: 'iPhone SE (2ª Gen)', category: 'Gama Baja', riskFactor: 1.0 },
            { id: 'iphonese3', brandId: appleId, name: 'iPhone SE (3ª Gen)', category: 'Gama Baja', riskFactor: 1.1 },
            
            // Era OLED Moderna
            { id: 'iphone12mini', brandId: appleId, name: 'iPhone 12 mini', category: 'Gama Alta', riskFactor: 1.4 },
            { id: 'iphone12', brandId: appleId, name: 'iPhone 12', category: 'Gama Alta', riskFactor: 1.4 },
            { id: 'iphone12pro', brandId: appleId, name: 'iPhone 12 Pro', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone12promax', brandId: appleId, name: 'iPhone 12 Pro Max', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone13mini', brandId: appleId, name: 'iPhone 13 mini', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone13', brandId: appleId, name: 'iPhone 13', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone13pro', brandId: appleId, name: 'iPhone 13 Pro', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 'iphone13promax', brandId: appleId, name: 'iPhone 13 Pro Max', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 'iphone14', brandId: appleId, name: 'iPhone 14', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone14plus', brandId: appleId, name: 'iPhone 14 Plus', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 'iphone14pro', brandId: appleId, name: 'iPhone 14 Pro', category: 'Gama Alta', riskFactor: 1.7 },
            { id: 'iphone14promax', brandId: appleId, name: 'iPhone 14 Pro Max', category: 'Gama Alta', riskFactor: 1.7 },
            { id: 'iphone15', brandId: appleId, name: 'iPhone 15', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 'iphone15plus', brandId: appleId, name: 'iPhone 15 Plus', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 'iphone15pro', brandId: appleId, name: 'iPhone 15 Pro', category: 'Gama Alta', riskFactor: 1.8 },
            { id: 'iphone15promax', brandId: appleId, name: 'iPhone 15 Pro Max', category: 'Gama Alta', riskFactor: 1.8 },
            
            // Últimas Generaciones
            { id: 'iphone16', brandId: appleId, name: 'iPhone 16', category: 'Premium', riskFactor: 1.8 },
            { id: 'iphone16plus', brandId: appleId, name: 'iPhone 16 Plus', category: 'Premium', riskFactor: 1.8 },
            { id: 'iphone16pro', brandId: appleId, name: 'iPhone 16 Pro', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone16promax', brandId: appleId, name: 'iPhone 16 Pro Max', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphonese4', brandId: appleId, name: 'iPhone SE (4ª Gen)', category: 'Gama Media', riskFactor: 1.5 },
            { id: 'iphone17', brandId: appleId, name: 'iPhone 17', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone17air', brandId: appleId, name: 'iPhone 17 Air', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone17pro', brandId: appleId, name: 'iPhone 17 Pro', category: 'Premium', riskFactor: 2.2 },
            { id: 'iphone17promax', brandId: appleId, name: 'iPhone 17 Pro Max', category: 'Premium', riskFactor: 2.2 }
        ];

        await db.models.bulkAdd([...samsungModels, ...iPhoneModels]);

        // 5. Servicios por defecto
        await db.services.bulkAdd([
            { id: 'screen', name: 'Cambio de Módulo', hours: 1.0 },
            { id: 'battery', name: 'Cambio de Batería', hours: 0.5 },
            { id: 'charging', name: 'Pin de Carga', hours: 1.5 },
            { id: 'software', name: 'Limpieza/Software', hours: 0.5 }
        ]);

        console.log('✅ Base de datos poblada con datos iniciales');
    } catch (error) {
        console.error('❌ Error al poblar base de datos:', error);
        throw error;
    }
}

/**
 * Exportar la instancia de la base de datos para uso directo
 */
export { db };
