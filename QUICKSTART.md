# ⚡ Quick Start - Arquitectura de Datos

## ✅ ¿Qué se instaló?

La aplicación ahora tiene una **nueva capa de datos** usando **IndexedDB** con **Dexie.js**:

```
✅ Dexie.js incluido desde CDN (no requiere instalación)
✅ Interface IDatabaseService (contrato de métodos)
✅ LocalDBService (implementación con IndexedDB)
✅ DatabaseProvider (factory pattern)
✅ MigrationService (migración automática desde localStorage)
✅ Ejemplos completos de uso
✅ Suite de tests
✅ Documentación completa
```

## 🚀 Inicio Rápido (3 pasos)

### 1. Los archivos HTML ya están actualizados

```html
<!-- Ya incluido en index.html, database.html, config.html -->
<script src="https://unpkg.com/dexie@3.2.4/dist/dexie.js"></script>
```

### 2. La migración es automática

Al abrir la aplicación, los datos de `localStorage` se migran automáticamente a IndexedDB. **No requiere acción manual**.

### 3. Usar en cualquier archivo JS

```javascript
import { useDB } from './database/databaseProvider.js';

async function miFuncion() {
    const db = useDB();
    
    // Obtener marcas
    const brands = await db.getAllBrands();
    
    // Agregar modelo
    await db.addModel({
        brandId: 'samsung',
        name: 'Galaxy S24',
        riskFactor: 1.8
    });
    
    // Guardar reparación
    await db.addHistoryEntry({
        clientName: 'Juan Pérez',
        brand: 'Samsung',
        model: 'Galaxy A14',
        service: 'Cambio de Módulo',
        partCost: 25000,
        currency: 'ARS',
        finalPrice: 45000,
        breakdown: { /* ... */ }
    });
}
```

## 📖 Documentación

- **[DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)** - Arquitectura completa, ejemplos de uso
- **[REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)** - Guía paso a paso para refactorizar app.js
- **[database/examples.js](database/examples.js)** - Ejemplos de código listo para usar
- **[database/testSuite.js](database/testSuite.js)** - Tests automáticos

## 🧪 Probar que funciona

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver estado de la base de datos
import('./database/testSuite.js').then(m => m.inspectDatabase())

// Ejecutar todos los tests
import('./database/testSuite.js').then(m => m.runAllTests())
```

## 📱 Métodos Disponibles

### Marcas (Brands)
```javascript
const db = useDB();
await db.getAllBrands()
await db.getBrandById(id)
await db.searchBrands(query)
await db.addBrand({ name })
await db.updateBrand(id, updates)
await db.deleteBrand(id)
```

### Modelos (Models)
```javascript
await db.getAllModels()
await db.getModelsByBrand(brandId)
await db.getModelById(id)
await db.searchModels(query, brandId)
await db.addModel({ brandId, name, riskFactor })
await db.updateModel(id, updates)
await db.deleteModel(id)
```

### Servicios (Services)
```javascript
await db.getAllServices()
await db.getServiceById(id)
await db.searchServices(query)
await db.addService({ name, hours })
await db.updateService(id, updates)
await db.deleteService(id)
```

### Configuración (Config)
```javascript
await db.getConfig()
await db.updateConfig({ hourlyRate, margin, usdRate })
```

### Historial (History)
```javascript
await db.getAllHistory(limit)
await db.getHistoryById(id)
await db.searchHistory(query)
await db.addHistoryEntry({ clientName, brand, model, service, ... })
await db.deleteHistoryEntry(id)
await db.clearHistory()
```

### Operaciones Especiales
```javascript
await db.exportData()        // Backup completo
await db.importData(data)    // Restaurar backup
await db.resetDatabase()     // Resetear a valores por defecto
```

## 🔄 Próximo Paso

Refactoriza `app.js` para usar la nueva arquitectura. Sigue la guía en:
**[REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)**

Patrón básico:

```javascript
// ❌ ANTES (localStorage)
const data = JSON.parse(localStorage.getItem('plugfixData'));
const brands = data.brands;

// ✅ DESPUÉS (IndexedDB)
const db = useDB();
const brands = await db.getAllBrands();
```

## 🔥 Migrar a Firebase en el Futuro

1. Crea `database/FirestoreService.js` implementando `IDatabaseService`
2. En `databaseProvider.js`, cambia **1 línea**:
   ```javascript
   this.service = new FirestoreService(config);
   ```
3. ¡Listo! Toda la app usa Firebase sin más cambios.

## 🐛 Debugging

### Inspeccionar IndexedDB en Chrome:
1. DevTools (F12)
2. Application → Storage → IndexedDB
3. Busca `PlugFixDB`

### Ver logs de migración:
```javascript
localStorage.getItem('plugfix_migration_completed') // 'true' si migró
localStorage.getItem('plugfix_data_backup')         // Backup de seguridad
```

## 📦 Archivos Creados

```
database/
├── IDatabaseService.js      # Interface (contrato)
├── LocalDBService.js        # Implementación Dexie.js
├── databaseProvider.js      # Factory (punto único de acceso)
├── migrationService.js      # Migración localStorage → IndexedDB
├── examples.js              # Ejemplos completos
└── testSuite.js             # Tests automáticos

DATABASE_ARCHITECTURE.md      # Documentación completa
REFACTORING_GUIDE.md         # Guía de refactorización
QUICKSTART.md                # Este archivo
```

## ⚡ Resumen de Ventajas

✅ **Mayor capacidad**: IndexedDB soporta mucho más que localStorage (GB vs KB)  
✅ **Mejor rendimiento**: Búsquedas indexadas, operaciones asíncronas  
✅ **Desacoplado**: Cambiar de backend sin reescribir componentes  
✅ **Offline-first**: Funciona 100% sin conexión  
✅ **Future-proof**: Migrar a Firebase/Supabase es cambiar 1 archivo  
✅ **Testeable**: Fácil crear mocks para testing  

---

**¡Todo listo! Ahora puedes empezar a refactorizar `app.js` siguiendo [REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)** 🚀
