import { useDB } from './databaseProvider.js';

/**
 * MigrationService - Servicio de Migración de localStorage a IndexedDB
 * 
 * Este servicio se encarga de migrar los datos existentes de localStorage a IndexedDB.
 * Solo se ejecuta una vez, la primera vez que se carga la aplicación después de actualizar.
 * 
 * PROCESO DE MIGRACIÓN:
 * 1. Detecta si hay datos en localStorage
 * 2. Lee y parsea los datos
 * 3. Los transforma al nuevo formato (separando brands/models)
 * 4. Los importa a IndexedDB
 * 5. Crea un backup en localStorage por seguridad
 * 6. Marca la migración como completada
 */

const MIGRATION_FLAG = 'plugfix_migration_completed';
const BACKUP_KEY = 'plugfix_data_backup';
const LEGACY_KEY = 'plugfixData';

class MigrationService {
    /**
     * Verifica si la migración ya se completó
     */
    isMigrationCompleted() {
        return localStorage.getItem(MIGRATION_FLAG) === 'true';
    }

    /**
     * Verifica si hay datos legacy en localStorage
     */
    hasLegacyData() {
        return localStorage.getItem(LEGACY_KEY) !== null;
    }

    /**
     * Ejecuta la migración si es necesario
     * @returns {Promise<boolean>} true si se ejecutó la migración, false si no fue necesario
     */
    async executeMigration() {
        // Si ya se migró antes, no hacer nada
        if (this.isMigrationCompleted()) {
            console.log('✅ Migración ya completada anteriormente');
            return false;
        }

        // Si no hay datos legacy, marcar como completado y salir
        if (!this.hasLegacyData()) {
            console.log('ℹ️ No hay datos legacy para migrar');
            this._markMigrationCompleted();
            return false;
        }

        try {
            console.log('🚀 Iniciando migración de localStorage a IndexedDB...');
            
            // 1. Leer datos de localStorage
            const legacyData = this._readLegacyData();
            
            // 2. Crear backup por seguridad
            this._createBackup(legacyData);
            
            // 3. Transformar datos al nuevo formato
            const transformedData = this._transformLegacyData(legacyData);
            
            // 4. Importar a IndexedDB
            const db = useDB();
            await db.importData(transformedData);
            
            // 5. Marcar migración como completada
            this._markMigrationCompleted();
            
            console.log('✅ Migración completada exitosamente');
            console.log(`📊 Migrados: ${transformedData.brands.length} marcas, ${transformedData.models.length} modelos, ${transformedData.services.length} servicios, ${transformedData.history.length} entradas de historial`);
            
            return true;
        } catch (error) {
            console.error('❌ Error durante la migración:', error);
            throw new Error(`Migración fallida: ${error.message}`);
        }
    }

    /**
     * Lee los datos legacy de localStorage
     * @private
     */
    _readLegacyData() {
        try {
            const raw = localStorage.getItem(LEGACY_KEY);
            return JSON.parse(raw);
        } catch (error) {
            throw new Error(`Error al leer datos legacy: ${error.message}`);
        }
    }

    /**
     * Crea un backup de los datos antes de migrar
     * @private
     */
    _createBackup(data) {
        try {
            localStorage.setItem(BACKUP_KEY, JSON.stringify({
                data,
                backupDate: new Date().toISOString()
            }));
            console.log('💾 Backup creado en localStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo crear backup:', error);
        }
    }

    /**
     * Transforma los datos del formato legacy al nuevo formato
     * @private
     */
    _transformLegacyData(legacyData) {
        const brands = [];
        const models = [];
        
        // Transformar estructura de brands/models
        // Formato legacy: brands: [{ id, name, models: [...] }]
        // Formato nuevo: brands: [{ id, name }], models: [{ id, brandId, name, riskFactor }]
        
        if (legacyData.brands && Array.isArray(legacyData.brands)) {
            legacyData.brands.forEach(brand => {
                // Agregar marca
                brands.push({
                    id: brand.id,
                    name: brand.name
                });
                
                // Agregar modelos de esta marca
                if (brand.models && Array.isArray(brand.models)) {
                    brand.models.forEach(model => {
                        models.push({
                            id: model.id,
                            brandId: brand.id,
                            name: model.name,
                            riskFactor: model.riskFactor || 1.0
                        });
                    });
                }
            });
        }

        // Servicios - mantener igual
        const services = legacyData.services || [];

        // Config - mantener igual pero agregar ID
        const config = {
            id: 'main',
            ...legacyData.config
        };

        // History - mantener igual
        const history = legacyData.history || [];

        return {
            brands,
            models,
            services,
            config,
            history,
            version: '1.0',
            migratedAt: new Date().toISOString()
        };
    }

    /**
     * Marca la migración como completada
     * @private
     */
    _markMigrationCompleted() {
        localStorage.setItem(MIGRATION_FLAG, 'true');
    }

    /**
     * Restaura el backup (útil para debugging o rollback)
     */
    async restoreFromBackup() {
        try {
            const backupRaw = localStorage.getItem(BACKUP_KEY);
            if (!backupRaw) {
                throw new Error('No hay backup disponible');
            }

            const backup = JSON.parse(backupRaw);
            localStorage.setItem(LEGACY_KEY, JSON.stringify(backup.data));
            localStorage.removeItem(MIGRATION_FLAG);
            
            console.log('✅ Backup restaurado. Recarga la página para re-ejecutar la migración.');
            return true;
        } catch (error) {
            console.error('❌ Error al restaurar backup:', error);
            throw error;
        }
    }

    /**
     * Limpia los datos legacy después de confirmar que la migración fue exitosa
     * (Opcional - permite mantener localStorage limpio)
     */
    cleanupLegacyData() {
        try {
            localStorage.removeItem(LEGACY_KEY);
            console.log('🧹 Datos legacy eliminados de localStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo limpiar datos legacy:', error);
        }
    }
}

// Exportar instancia única
export default new MigrationService();
