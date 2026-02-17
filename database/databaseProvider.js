import LocalDBService from './LocalDBService.js';

/**
 * DatabaseProvider - Factory Pattern
 * 
 * Este es el único punto de entrada para acceder a la base de datos.
 * Proporciona una instancia del servicio de base de datos actualmente configurado.
 * 
 * ¿Por qué es importante?
 * - Centraliza la creación del servicio de base de datos
 * - Permite cambiar fácilmente entre diferentes implementaciones
 * - Los componentes nunca dependen directamente de una implementación específica
 * 
 * MIGRACIÓN FUTURA A FIREBASE/SUPABASE:
 * Para migrar a otro backend, solo necesitas:
 * 1. Crear una nueva clase (ej: FirestoreService) que implemente IDatabaseService
 * 2. Cambiar la línea 'dbService = new LocalDBService()' por 'dbService = new FirestoreService()'
 * 3. ¡Listo! Toda tu aplicación usará el nuevo backend sin cambios adicionales
 */

class DatabaseProvider {
    constructor() {
        if (DatabaseProvider.instance) {
            return DatabaseProvider.instance;
        }

        // 🔥 PUNTO DE CAMBIO PARA MIGRACIÓN
        // Para cambiar a otro backend, reemplaza esta línea:
        // this.service = new FirestoreService();
        // this.service = new SupabaseService();
        // this.service = new MongoDBService();
        this.service = new LocalDBService();

        DatabaseProvider.instance = this;
    }

    /**
     * Obtiene la instancia del servicio de base de datos
     * @returns {IDatabaseService}
     */
    getService() {
        return this.service;
    }

    /**
     * Inicializa el servicio de base de datos
     * @returns {Promise<void>}
     */
    async initialize() {
        await this.service.initialize();
    }
}

// Crear una instancia única (Singleton)
const provider = new DatabaseProvider();

/**
 * Hook/Helper para acceder al servicio de base de datos desde cualquier componente
 * 
 * EJEMPLO DE USO:
 * 
 * import { useDB } from './database/databaseProvider.js';
 * 
 * async function saveRepair() {
 *     const db = useDB();
 *     await db.addHistoryEntry({
 *         clientName: 'Juan Pérez',
 *         brand: 'Samsung',
 *         model: 'Galaxy A14',
 *         service: 'Cambio de Módulo',
 *         partCost: 25000,
 *         currency: 'ARS',
 *         finalPrice: 45000,
 *         breakdown: { ... }
 *     });
 * }
 */
export function useDB() {
    return provider.getService();
}

/**
 * Inicializa la base de datos
 * Llamar esto al inicio de la aplicación
 */
export async function initializeDB() {
    return await provider.initialize();
}

export default provider;
