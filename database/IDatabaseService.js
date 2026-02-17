/**
 * Interface IDatabaseService
 * 
 * Define el contrato que debe cumplir cualquier implementación de almacenamiento de datos.
 * Esto permite cambiar fácilmente entre diferentes proveedores (IndexedDB, Firebase, Supabase, etc.)
 * sin modificar la lógica de negocio de la aplicación.
 * 
 * @interface
 */

/**
 * @typedef {Object} Brand
 * @property {string} id - Identificador único de la marca
 * @property {string} name - Nombre de la marca
 */

/**
 * @typedef {Object} Model
 * @property {string} id - Identificador único del modelo
 * @property {string} brandId - ID de la marca a la que pertenece
 * @property {string} name - Nombre del modelo
 * @property {number} riskFactor - Factor de riesgo para cálculo de precios
 */

/**
 * @typedef {Object} Service
 * @property {string} id - Identificador único del servicio
 * @property {string} name - Nombre del servicio
 * @property {number} hours - Horas estimadas de trabajo
 */

/**
 * @typedef {Object} Config
 * @property {string} id - Siempre 'main'
 * @property {number} hourlyRate - Tarifa por hora en moneda local
 * @property {number} margin - Margen de ganancia en porcentaje
 * @property {number} usdRate - Tasa de cambio USD
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {string} id - Identificador único (timestamp)
 * @property {string} clientName - Nombre del cliente (opcional)
 * @property {string} brand - Marca del dispositivo
 * @property {string} model - Modelo del dispositivo
 * @property {string} service - Tipo de servicio realizado
 * @property {number} partCost - Costo del repuesto
 * @property {string} currency - Moneda (ARS/USD)
 * @property {number} finalPrice - Precio final calculado
 * @property {string} date - Fecha de la reparación
 * @property {Object} breakdown - Desglose de costos
 */

class IDatabaseService {
    /**
     * Inicializa la base de datos y ejecuta migraciones si es necesario
     * @returns {Promise<void>}
     */
    async initialize() {
        throw new Error('Method initialize() must be implemented');
    }

    // ============================================
    // BRANDS - Gestión de Marcas
    // ============================================

    /**
     * Obtiene todas las marcas
     * @returns {Promise<Brand[]>}
     */
    async getAllBrands() {
        throw new Error('Method getAllBrands() must be implemented');
    }

    /**
     * Obtiene una marca por su ID
     * @param {string} id - ID de la marca
     * @returns {Promise<Brand|undefined>}
     */
    async getBrandById(id) {
        throw new Error('Method getBrandById() must be implemented');
    }

    /**
     * Busca marcas por nombre (búsqueda parcial, case-insensitive)
     * @param {string} query - Texto a buscar
     * @returns {Promise<Brand[]>}
     */
    async searchBrands(query) {
        throw new Error('Method searchBrands() must be implemented');
    }

    /**
     * Agrega una nueva marca
     * @param {Brand} brand - Datos de la marca
     * @returns {Promise<string>} ID de la marca creada
     */
    async addBrand(brand) {
        throw new Error('Method addBrand() must be implemented');
    }

    /**
     * Actualiza una marca existente
     * @param {string} id - ID de la marca
     * @param {Partial<Brand>} updates - Campos a actualizar
     * @returns {Promise<void>}
     */
    async updateBrand(id, updates) {
        throw new Error('Method updateBrand() must be implemented');
    }

    /**
     * Elimina una marca (y todos sus modelos)
     * @param {string} id - ID de la marca
     * @returns {Promise<void>}
     */
    async deleteBrand(id) {
        throw new Error('Method deleteBrand() must be implemented');
    }

    // ============================================
    // MODELS - Gestión de Modelos
    // ============================================

    /**
     * Obtiene todos los modelos
     * @returns {Promise<Model[]>}
     */
    async getAllModels() {
        throw new Error('Method getAllModels() must be implemented');
    }

    /**
     * Obtiene todos los modelos de una marca específica
     * @param {string} brandId - ID de la marca
     * @returns {Promise<Model[]>}
     */
    async getModelsByBrand(brandId) {
        throw new Error('Method getModelsByBrand() must be implemented');
    }

    /**
     * Obtiene un modelo por su ID
     * @param {string} id - ID del modelo
     * @returns {Promise<Model|undefined>}
     */
    async getModelById(id) {
        throw new Error('Method getModelById() must be implemented');
    }

    /**
     * Busca modelos por nombre (búsqueda parcial, case-insensitive)
     * @param {string} query - Texto a buscar
     * @param {string} [brandId] - Filtrar por marca (opcional)
     * @returns {Promise<Model[]>}
     */
    async searchModels(query, brandId) {
        throw new Error('Method searchModels() must be implemented');
    }

    /**
     * Agrega un nuevo modelo
     * @param {Model} model - Datos del modelo
     * @returns {Promise<string>} ID del modelo creado
     */
    async addModel(model) {
        throw new Error('Method addModel() must be implemented');
    }

    /**
     * Actualiza un modelo existente
     * @param {string} id - ID del modelo
     * @param {Partial<Model>} updates - Campos a actualizar
     * @returns {Promise<void>}
     */
    async updateModel(id, updates) {
        throw new Error('Method updateModel() must be implemented');
    }

    /**
     * Elimina un modelo
     * @param {string} id - ID del modelo
     * @returns {Promise<void>}
     */
    async deleteModel(id) {
        throw new Error('Method deleteModel() must be implemented');
    }

    // ============================================
    // SERVICES - Gestión de Servicios
    // ============================================

    /**
     * Obtiene todos los servicios
     * @returns {Promise<Service[]>}
     */
    async getAllServices() {
        throw new Error('Method getAllServices() must be implemented');
    }

    /**
     * Obtiene un servicio por su ID
     * @param {string} id - ID del servicio
     * @returns {Promise<Service|undefined>}
     */
    async getServiceById(id) {
        throw new Error('Method getServiceById() must be implemented');
    }

    /**
     * Busca servicios por nombre (búsqueda parcial, case-insensitive)
     * @param {string} query - Texto a buscar
     * @returns {Promise<Service[]>}
     */
    async searchServices(query) {
        throw new Error('Method searchServices() must be implemented');
    }

    /**
     * Agrega un nuevo servicio
     * @param {Service} service - Datos del servicio
     * @returns {Promise<string>} ID del servicio creado
     */
    async addService(service) {
        throw new Error('Method addService() must be implemented');
    }

    /**
     * Actualiza un servicio existente
     * @param {string} id - ID del servicio
     * @param {Partial<Service>} updates - Campos a actualizar
     * @returns {Promise<void>}
     */
    async updateService(id, updates) {
        throw new Error('Method updateService() must be implemented');
    }

    /**
     * Elimina un servicio
     * @param {string} id - ID del servicio
     * @returns {Promise<void>}
     */
    async deleteService(id) {
        throw new Error('Method deleteService() must be implemented');
    }

    // ============================================
    // CONFIG - Gestión de Configuración
    // ============================================

    /**
     * Obtiene la configuración de la aplicación
     * @returns {Promise<Config>}
     */
    async getConfig() {
        throw new Error('Method getConfig() must be implemented');
    }

    /**
     * Actualiza la configuración de la aplicación
     * @param {Partial<Config>} updates - Campos a actualizar
     * @returns {Promise<void>}
     */
    async updateConfig(updates) {
        throw new Error('Method updateConfig() must be implemented');
    }

    // ============================================
    // HISTORY - Gestión de Historial
    // ============================================

    /**
     * Obtiene todas las entradas del historial (ordenadas por fecha descendente)
     * @param {number} [limit] - Límite de registros (opcional)
     * @returns {Promise<HistoryEntry[]>}
     */
    async getAllHistory(limit) {
        throw new Error('Method getAllHistory() must be implemented');
    }

    /**
     * Obtiene una entrada del historial por su ID
     * @param {string} id - ID de la entrada
     * @returns {Promise<HistoryEntry|undefined>}
     */
    async getHistoryById(id) {
        throw new Error('Method getHistoryById() must be implemented');
    }

    /**
     * Busca en el historial por cliente, marca, modelo o servicio
     * @param {string} query - Texto a buscar
     * @returns {Promise<HistoryEntry[]>}
     */
    async searchHistory(query) {
        throw new Error('Method searchHistory() must be implemented');
    }

    /**
     * Agrega una nueva entrada al historial
     * @param {HistoryEntry} entry - Datos de la entrada
     * @returns {Promise<string>} ID de la entrada creada
     */
    async addHistoryEntry(entry) {
        throw new Error('Method addHistoryEntry() must be implemented');
    }

    /**
     * Elimina una entrada del historial
     * @param {string} id - ID de la entrada
     * @returns {Promise<void>}
     */
    async deleteHistoryEntry(id) {
        throw new Error('Method deleteHistoryEntry() must be implemented');
    }

    /**
     * Limpia todo el historial
     * @returns {Promise<void>}
     */
    async clearHistory() {
        throw new Error('Method clearHistory() must be implemented');
    }

    // ============================================
    // BULK OPERATIONS - Operaciones Masivas
    // ============================================

    /**
     * Resetea toda la base de datos a los valores por defecto
     * @returns {Promise<void>}
     */
    async resetDatabase() {
        throw new Error('Method resetDatabase() must be implemented');
    }

    /**
     * Exporta todos los datos de la aplicación
     * @returns {Promise<Object>} Objeto con todos los datos
     */
    async exportData() {
        throw new Error('Method exportData() must be implemented');
    }

    /**
     * Importa datos a la aplicación (sobrescribe los existentes)
     * @param {Object} data - Datos a importar
     * @returns {Promise<void>}
     */
    async importData(data) {
        throw new Error('Method importData() must be implemented');
    }
}

export default IDatabaseService;
