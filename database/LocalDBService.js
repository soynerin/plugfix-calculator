import IDatabaseService from './IDatabaseService.js';

/**
 * LocalDBService - Implementación del almacenamiento local usando Dexie.js (IndexedDB)
 * 
 * Esta implementación utiliza IndexedDB a través de Dexie.js para almacenar datos localmente
 * de forma offline-first. Cuando decidas migrar a Firebase/Supabase, solo necesitarás crear
 * una nueva clase (ej: FirestoreService) que implemente la misma interface.
 * 
 * @extends IDatabaseService
 */
class LocalDBService extends IDatabaseService {
    constructor() {
        super();
        
        // Inicializar Dexie
        this.db = new Dexie('PlugFixDB');
        
        // Definir esquema de la base de datos
        // La sintaxis de Dexie es: 'campo1, campo2, &campo3' donde & indica primary key
        this.db.version(1).stores({
            brands: 'id, name',
            models: 'id, brandId, name, riskFactor',
            services: 'id, name, hours',
            config: 'id',
            history: 'id, date, clientName, brand, model, service'
        });

        // Referencias a las tablas
        this.brands = this.db.brands;
        this.models = this.db.models;
        this.services = this.db.services;
        this.config = this.db.config;
        this.history = this.db.history;
    }

    /**
     * Inicializa la base de datos con datos por defecto si está vacía
     */
    async initialize() {
        try {
            await this.db.open();
            
            // Verificar si ya hay datos
            const brandsCount = await this.brands.count();
            
            if (brandsCount === 0) {
                console.log('📦 Inicializando base de datos con datos por defecto...');
                await this._seedDefaultData();
            }
            
            console.log('✅ Base de datos inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    /**
     * Puebla la base de datos con datos por defecto
     * @private
     */
    async _seedDefaultData() {
        // Configuración por defecto
        await this.config.add({
            id: 'main',
            hourlyRate: 13000,
            margin: 40,
            usdRate: 1200
        });

        // Marcas y modelos por defecto
        const samsungId = 'samsung';
        const appleId = 'apple';

        await this.brands.bulkAdd([
            { id: samsungId, name: 'Samsung' },
            { id: appleId, name: 'Apple' }
        ]);

        // Limpiar modelos Apple existentes para evitar duplicados
        await this.models.where('brandId').equals(appleId).delete();

        // Modelos Samsung - Serie S Completa (hasta Feb 2026)
        const samsungModels = [
            // --- OTROS MODELOS POPULARES ---
            { id: 'a14', brandId: samsungId, name: 'Galaxy A14', category: 'Gama Media-Baja', riskFactor: 1.0 },
            
            // --- ERA "GLASS & EDGE" (Tapas pegadas / Pantallas Curvas) [1.2x - 1.3x] ---
            { id: 's6', brandId: samsungId, name: 'Galaxy S6', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's6edge', brandId: samsungId, name: 'Galaxy S6 Edge', category: 'Gama Media-Baja', riskFactor: 1.3 },
            { id: 's6edgeplus', brandId: samsungId, name: 'Galaxy S6 Edge+', category: 'Gama Media-Baja', riskFactor: 1.3 },
            { id: 's6active', brandId: samsungId, name: 'Galaxy S6 Active', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's7', brandId: samsungId, name: 'Galaxy S7', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's7edge', brandId: samsungId, name: 'Galaxy S7 Edge', category: 'Gama Media-Baja', riskFactor: 1.3 },
            { id: 's7active', brandId: samsungId, name: 'Galaxy S7 Active', category: 'Gama Media-Baja', riskFactor: 1.2 },
            { id: 's8', brandId: samsungId, name: 'Galaxy S8', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's8plus', brandId: samsungId, name: 'Galaxy S8+', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's8active', brandId: samsungId, name: 'Galaxy S8 Active', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's9', brandId: samsungId, name: 'Galaxy S9', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's9plus', brandId: samsungId, name: 'Galaxy S9+', category: 'Gama Media', riskFactor: 1.3 },
            
            // --- ERA MODERNA (Hole-punch / Dynamic AMOLED) [1.4x - 1.5x] ---
            { id: 's10e', brandId: samsungId, name: 'Galaxy S10e', category: 'Gama Media', riskFactor: 1.3 },
            { id: 's10', brandId: samsungId, name: 'Galaxy S10', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's10plus', brandId: samsungId, name: 'Galaxy S10+', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's105g', brandId: samsungId, name: 'Galaxy S10 5G', category: 'Gama Media', riskFactor: 1.4 },
            { id: 's10lite', brandId: samsungId, name: 'Galaxy S10 Lite', category: 'Gama Media', riskFactor: 1.3 },
            
            { id: 's20', brandId: samsungId, name: 'Galaxy S20', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's20plus', brandId: samsungId, name: 'Galaxy S20+', category: 'Gama Alta', riskFactor: 1.5 },
            { id: 's20ultra', brandId: samsungId, name: 'Galaxy S20 Ultra', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's20fe', brandId: samsungId, name: 'Galaxy S20 FE (Fan Edition)', category: 'Gama Media', riskFactor: 1.4 },
            
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
            
            // --- GAMA RECIENTE (IA Integrada / Repuestos costosos) [1.6x - 1.9x] ---
            { id: 's24', brandId: samsungId, name: 'Galaxy S24', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's24plus', brandId: samsungId, name: 'Galaxy S24+', category: 'Gama Alta', riskFactor: 1.6 },
            { id: 's24ultra', brandId: samsungId, name: 'Galaxy S24 Ultra', category: 'Premium', riskFactor: 1.9 },
            { id: 's24fe', brandId: samsungId, name: 'Galaxy S24 FE', category: 'Gama Alta', riskFactor: 1.5 },
            
            { id: 's25', brandId: samsungId, name: 'Galaxy S25', category: 'Premium', riskFactor: 1.8 },
            { id: 's25plus', brandId: samsungId, name: 'Galaxy S25+', category: 'Premium', riskFactor: 1.8 },
            { id: 's25ultra', brandId: samsungId, name: 'Galaxy S25 Ultra', category: 'Premium', riskFactor: 2.0 },
            
            // --- FLAGSHIPS ACTUALES (Lanzamiento 2026) [2.0x - 2.2x] ---
            { id: 's26', brandId: samsungId, name: 'Galaxy S26', category: 'Premium', riskFactor: 2.0 },
            { id: 's26plus', brandId: samsungId, name: 'Galaxy S26+', category: 'Premium', riskFactor: 2.0 },
            { id: 's26ultra', brandId: samsungId, name: 'Galaxy S26 Ultra', category: 'Premium', riskFactor: 2.2 }
        ];

        // Modelos iPhone - LISTADO COMPLETO (Histórico hasta Feb 2026)
        const iPhoneModels = [
            // --- ERA TOUCH ID & PRIMEROS FACE ID (Gama Media-Baja) [1.0x - 1.2x] ---
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
            { id: 'iphonese2', brandId: appleId, name: 'iPhone SE (2ª Gen - 2020)', category: 'Gama Baja', riskFactor: 1.0 },
            { id: 'iphonese3', brandId: appleId, name: 'iPhone SE (3ª Gen - 2022)', category: 'Gama Baja', riskFactor: 1.1 },
            
            // --- ERA OLED MODERNA (Gama Alta Estándar) [1.4x - 1.6x] ---
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
            
            // --- ÚLTIMAS GENERACIONES (Gama Premium / Actual) [1.8x - 2.2x] ---
            // Serie 16 (2024)
            { id: 'iphone16', brandId: appleId, name: 'iPhone 16', category: 'Premium', riskFactor: 1.8 },
            { id: 'iphone16plus', brandId: appleId, name: 'iPhone 16 Plus', category: 'Premium', riskFactor: 1.8 },
            { id: 'iphone16pro', brandId: appleId, name: 'iPhone 16 Pro', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone16promax', brandId: appleId, name: 'iPhone 16 Pro Max', category: 'Premium', riskFactor: 2.0 },
            
            // Serie SE 4 / Modelos 2025
            { id: 'iphonese4', brandId: appleId, name: 'iPhone SE (4ª Gen)', category: 'Gama Media', riskFactor: 1.5 },
            { id: 'iphone16e', brandId: appleId, name: 'iPhone 16e', category: 'Gama Media', riskFactor: 1.6 },
            
            // Serie 17 (Flagship Actual 2025-2026)
            { id: 'iphone17', brandId: appleId, name: 'iPhone 17', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone17air', brandId: appleId, name: 'iPhone 17 Air', category: 'Premium', riskFactor: 2.0 },
            { id: 'iphone17pro', brandId: appleId, name: 'iPhone 17 Pro', category: 'Premium', riskFactor: 2.2 },
            { id: 'iphone17promax', brandId: appleId, name: 'iPhone 17 Pro Max', category: 'Premium', riskFactor: 2.2 }
        ];

        // Insertar todos los modelos
        await this.models.bulkAdd([...samsungModels, ...iPhoneModels]);

        // Servicios por defecto
        await this.services.bulkAdd([
            { id: 'screen', name: 'Cambio de Módulo', hours: 1.0 },
            { id: 'battery', name: 'Cambio de Batería', hours: 0.5 },
            { id: 'charging', name: 'Pin de Carga', hours: 1.5 },
            { id: 'software', name: 'Limpieza/Software', hours: 0.5 }
        ]);
    }

    // ============================================
    // BRANDS - Gestión de Marcas
    // ============================================

    async getAllBrands() {
        return await this.brands.toArray();
    }

    async getBrandById(id) {
        return await this.brands.get(id);
    }

    async searchBrands(query) {
        const lowerQuery = query.toLowerCase();
        return await this.brands
            .filter(brand => brand.name.toLowerCase().includes(lowerQuery))
            .toArray();
    }

    async addBrand(brand) {
        // Generar ID si no existe
        if (!brand.id) {
            brand.id = this._generateId(brand.name);
        }
        await this.brands.add(brand);
        return brand.id;
    }

    async updateBrand(id, updates) {
        await this.brands.update(id, updates);
    }

    async deleteBrand(id) {
        // Eliminar también todos los modelos de esta marca
        await this.models.where('brandId').equals(id).delete();
        await this.brands.delete(id);
    }

    // ============================================
    // MODELS - Gestión de Modelos
    // ============================================

    async getAllModels() {
        return await this.models.toArray();
    }

    async getModelsByBrand(brandId) {
        return await this.models
            .where('brandId')
            .equals(brandId)
            .toArray();
    }

    async getModelById(id) {
        return await this.models.get(id);
    }

    async searchModels(query, brandId) {
        const lowerQuery = query.toLowerCase();
        let collection = this.models;
        
        if (brandId) {
            collection = collection.where('brandId').equals(brandId);
        }
        
        return await collection
            .filter(model => model.name.toLowerCase().includes(lowerQuery))
            .toArray();
    }

    async addModel(model) {
        // Generar ID si no existe
        if (!model.id) {
            model.id = this._generateId(model.name);
        }
        await this.models.add(model);
        return model.id;
    }

    async updateModel(id, updates) {
        await this.models.update(id, updates);
    }

    async deleteModel(id) {
        await this.models.delete(id);
    }

    // ============================================
    // SERVICES - Gestión de Servicios
    // ============================================

    async getAllServices() {
        return await this.services.toArray();
    }

    async getServiceById(id) {
        return await this.services.get(id);
    }

    async searchServices(query) {
        const lowerQuery = query.toLowerCase();
        return await this.services
            .filter(service => service.name.toLowerCase().includes(lowerQuery))
            .toArray();
    }

    async addService(service) {
        // Generar ID si no existe
        if (!service.id) {
            service.id = this._generateId(service.name);
        }
        await this.services.add(service);
        return service.id;
    }

    async updateService(id, updates) {
        await this.services.update(id, updates);
    }

    async deleteService(id) {
        await this.services.delete(id);
    }

    // ============================================
    // CONFIG - Gestión de Configuración
    // ============================================

    async getConfig() {
        let config = await this.config.get('main');
        
        // Si no existe, crear una por defecto
        if (!config) {
            config = {
                id: 'main',
                hourlyRate: 13000,
                margin: 40,
                usdRate: 1200
            };
            await this.config.add(config);
        }
        
        return config;
    }

    async updateConfig(updates) {
        await this.config.update('main', updates);
    }

    // ============================================
    // HISTORY - Gestión de Historial
    // ============================================

    async getAllHistory(limit) {
        let query = this.history.orderBy('date').reverse();
        
        if (limit) {
            query = query.limit(limit);
        }
        
        return await query.toArray();
    }

    async getHistoryById(id) {
        return await this.history.get(id);
    }

    async searchHistory(query) {
        const lowerQuery = query.toLowerCase();
        return await this.history
            .filter(entry => {
                const clientName = (entry.clientName || '').toLowerCase();
                const brand = (entry.brand || '').toLowerCase();
                const model = (entry.model || '').toLowerCase();
                const service = (entry.service || '').toLowerCase();
                
                return clientName.includes(lowerQuery) ||
                       brand.includes(lowerQuery) ||
                       model.includes(lowerQuery) ||
                       service.includes(lowerQuery);
            })
            .reverse()
            .toArray();
    }

    async addHistoryEntry(entry) {
        // Generar ID basado en timestamp si no existe
        if (!entry.id) {
            entry.id = Date.now().toString();
        }
        
        // Asegurar que tenga fecha
        if (!entry.date) {
            entry.date = new Date().toISOString();
        }
        
        await this.history.add(entry);
        return entry.id;
    }

    async deleteHistoryEntry(id) {
        await this.history.delete(id);
    }

    async clearHistory() {
        await this.history.clear();
    }

    // ============================================
    // BULK OPERATIONS - Operaciones Masivas
    // ============================================

    async resetDatabase() {
        // Limpiar todas las tablas
        await this.brands.clear();
        await this.models.clear();
        await this.services.clear();
        await this.config.clear();
        await this.history.clear();
        
        // Re-inicializar con datos por defecto
        await this._seedDefaultData();
    }

    async exportData() {
        const [brands, models, services, config, history] = await Promise.all([
            this.getAllBrands(),
            this.getAllModels(),
            this.getAllServices(),
            this.getConfig(),
            this.getAllHistory()
        ]);

        return {
            brands,
            models,
            services,
            config,
            history,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    async importData(data) {
        try {
            // Validar que tenga la estructura correcta
            if (!data.brands || !data.models || !data.services || !data.config) {
                throw new Error('Datos de importación inválidos');
            }

            // Limpiar datos existentes
            await this.brands.clear();
            await this.models.clear();
            await this.services.clear();
            await this.config.clear();
            await this.history.clear();

            // Importar nuevos datos
            await this.brands.bulkAdd(data.brands);
            await this.models.bulkAdd(data.models);
            await this.services.bulkAdd(data.services);
            await this.config.add(data.config);
            
            if (data.history && data.history.length > 0) {
                await this.history.bulkAdd(data.history);
            }

            console.log('✅ Datos importados correctamente');
        } catch (error) {
            console.error('❌ Error al importar datos:', error);
            throw error;
        }
    }

    // ============================================
    // UTILIDADES PRIVADAS
    // ============================================

    /**
     * Genera un ID único basado en un nombre
     * @private
     */
    _generateId(name) {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales por guiones
            .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
        
        // Agregar timestamp para asegurar unicidad
        const timestamp = Date.now().toString(36);
        return `${slug}-${timestamp}`;
    }
}

export default LocalDBService;
