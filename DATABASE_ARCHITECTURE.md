# 🚀 Plug & Fix - Nueva Arquitectura de Datos

## 📋 Resumen de la Migración

La aplicación ha sido refactorizada para migrar de **localStorage** a **IndexedDB** usando **Dexie.js**, implementando un **patrón Repository** que permite cambiar fácilmente a Firebase, Supabase u otro backend en el futuro.

---

## 🎯 Objetivos Alcanzados

✅ **Migración a IndexedDB**: Mayor capacidad y rendimiento  
✅ **Arquitectura Desacoplada**: Cambiar de backend sin reescribir componentes  
✅ **Offline-First**: 100% funcional sin conexión  
✅ **Migración Automática**: Los datos de localStorage se migran automáticamente  
✅ **Future-Proof**: Preparado para Firebase/Firestore/Supabase  

---

## 📁 Estructura de Archivos

```
plugfix-calculator/
├── database/
│   ├── IDatabaseService.js        # Interface/Contrato (define los métodos)
│   ├── LocalDBService.js          # Implementación con Dexie.js (IndexedDB)
│   ├── databaseProvider.js        # Factory Pattern (punto único de acceso)
│   ├── migrationService.js        # Migración automática desde localStorage
│   └── examples.js                # Ejemplos de uso completos
├── app.js                         # Lógica de la aplicación (a refactorizar)
├── index.html                     # ✨ Actualizado con Dexie.js
├── database.html                  # ✨ Actualizado con Dexie.js
└── config.html                    # ✨ Actualizado con Dexie.js
```

---

## 🔧 Instalación

### Opción 1: CDN (Actual - Ya Implementado)

Los archivos HTML ya incluyen Dexie.js desde CDN:

```html
<script src="https://unpkg.com/dexie@3.2.4/dist/dexie.js"></script>
```

**✅ No necesitas instalar nada adicional**. Los archivos ya están listos para usar.

### Opción 2: NPM (Si prefieres usar un bundler)

```bash
npm install dexie
```

---

## 🚀 Uso Básico

### 1. Importar el servicio

```javascript
import { useDB } from './database/databaseProvider.js';

const db = useDB();
```

### 2. Operaciones CRUD

#### Marcas (Brands)

```javascript
// Obtener todas las marcas
const brands = await db.getAllBrands();

// Agregar marca
const brandId = await db.addBrand({ 
    name: 'Xiaomi' 
});

// Buscar marcas
const results = await db.searchBrands('Sam');

// Eliminar marca (y sus modelos)
await db.deleteBrand('samsung');
```

#### Modelos (Models)

```javascript
// Obtener modelos de una marca
const models = await db.getModelsByBrand('samsung');

// Agregar modelo
const modelId = await db.addModel({
    brandId: 'samsung',
    name: 'Galaxy S24',
    riskFactor: 1.8
});

// Actualizar modelo
await db.updateModel('s24', { riskFactor: 2.0 });
```

#### Servicios (Services)

```javascript
// Obtener todos los servicios
const services = await db.getAllServices();

// Agregar servicio
const serviceId = await db.addService({
    name: 'Cambio de Cámara',
    hours: 1.5
});
```

#### Configuración (Config)

```javascript
// Obtener configuración
const config = await db.getConfig();

// Actualizar configuración
await db.updateConfig({
    hourlyRate: 15000,
    margin: 45,
    usdRate: 1300
});
```

#### Historial (History) - ⭐ Caso de Uso Principal

```javascript
// Guardar una reparación
const entryId = await db.addHistoryEntry({
    clientName: 'Juan Pérez',
    brand: 'Samsung',
    model: 'Galaxy A14',
    service: 'Cambio de Módulo',
    partCost: 25000,
    currency: 'ARS',
    finalPrice: 45000,
    breakdown: {
        laborCost: 13000,
        partCostInARS: 25000,
        subtotal: 38000,
        margin: 7000
    }
});

// Obtener historial (últimas 50 entradas)
const history = await db.getAllHistory(50);

// Buscar en historial
const results = await db.searchHistory('Juan');

// Eliminar entrada
await db.deleteHistoryEntry('1234567890');
```

---

## 💡 Ejemplo Completo: Guardar una Reparación

```javascript
import { useDB } from './database/databaseProvider.js';

async function calculateAndSaveRepair() {
    const db = useDB();
    
    try {
        // 1. Obtener valores del formulario
        const formData = {
            clientName: document.getElementById('calc-client-name').value,
            brand: document.getElementById('calc-brand').value,
            model: document.getElementById('calc-model').value,
            service: document.getElementById('calc-service').value,
            partCost: parseFloat(document.getElementById('calc-cost').value),
            currency: document.getElementById('calc-currency').value
        };
        
        // 2. Obtener configuración
        const config = await db.getConfig();
        
        // 3. Calcular precio (tu lógica existente)
        const finalPrice = calculatePrice(formData, config);
        
        // 4. Guardar en historial
        await db.addHistoryEntry({
            ...formData,
            finalPrice,
            breakdown: {
                // ... desglose de costos
            }
        });
        
        // 5. Mostrar confirmación
        showToast('✅ Reparación guardada correctamente', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error al guardar la reparación', 'error');
    }
}
```

---

## 🔄 Migración Automática

La migración desde localStorage es **completamente automática**:

1. Al cargar la aplicación, se detecta si hay datos en `localStorage`
2. Los datos se leen y transforman al nuevo formato
3. Se importan a IndexedDB
4. Se crea un backup en `localStorage` por seguridad
5. Se marca la migración como completada

**No necesitas hacer nada**. La primera vez que un usuario abra la aplicación, sus datos se migrarán automáticamente.

### Verificar Migración

```javascript
import migrationService from './database/migrationService.js';

// Verificar si ya se migró
const completed = migrationService.isMigrationCompleted();

// Verificar si hay datos legacy
const hasLegacy = migrationService.hasLegacyData();

// Restaurar backup (si algo sale mal)
await migrationService.restoreFromBackup();
```

---

## 🔥 Migración Futura a Firebase/Supabase

Esta es la **gran ventaja** de la arquitectura implementada. Para migrar a otro backend:

### Paso 1: Crear el nuevo servicio

Crea `database/FirestoreService.js`:

```javascript
import IDatabaseService from './IDatabaseService.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

class FirestoreService extends IDatabaseService {
    constructor(firebaseConfig) {
        super();
        const app = initializeApp(firebaseConfig);
        this.db = getFirestore(app);
    }

    async getAllBrands() {
        const snapshot = await getDocs(collection(this.db, 'brands'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addBrand(brand) {
        const docRef = await addDoc(collection(this.db, 'brands'), brand);
        return docRef.id;
    }

    // ... implementar todos los métodos de IDatabaseService
}

export default FirestoreService;
```

### Paso 2: Cambiar el provider

En `database/databaseProvider.js`, cambia **UNA SOLA LÍNEA**:

```javascript
// ANTES:
// this.service = new LocalDBService();

// DESPUÉS:
this.service = new FirestoreService({
    apiKey: "tu-api-key",
    authDomain: "tu-app.firebaseapp.com",
    projectId: "tu-proyecto"
});
```

### Paso 3: ¡Listo!

**Todos tus componentes siguen funcionando sin cambios**. Esa es la magia del patrón Repository.

---

## 📚 Esquema de Datos

### Brands (Marcas)
```typescript
{
    id: string,           // ID único
    name: string          // Nombre de la marca
}
```

### Models (Modelos)
```typescript
{
    id: string,           // ID único
    brandId: string,      // ID de la marca
    name: string,         // Nombre del modelo
    riskFactor: number    // Factor de riesgo (1.0 - 2.0)
}
```

### Services (Servicios)
```typescript
{
    id: string,           // ID único
    name: string,         // Nombre del servicio
    hours: number         // Horas estimadas
}
```

### Config (Configuración)
```typescript
{
    id: 'main',           // Siempre 'main'
    hourlyRate: number,   // Tarifa por hora
    margin: number,       // Margen en %
    usdRate: number       // Tasa de cambio USD
}
```

### History (Historial)
```typescript
{
    id: string,           // Timestamp único
    clientName: string,   // Nombre del cliente (opcional)
    brand: string,        // Marca del dispositivo
    model: string,        // Modelo del dispositivo
    service: string,      // Servicio realizado
    partCost: number,     // Costo del repuesto
    currency: string,     // 'ARS' o 'USD'
    finalPrice: number,   // Precio final
    date: string,         // ISO timestamp
    breakdown: object     // Desglose de costos
}
```

---

## 🛠️ Operaciones Especiales

### Exportar Datos (Backup)

```javascript
const db = useDB();
const data = await db.exportData();

// Descargar como JSON
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'plugfix-backup.json';
a.click();
```

### Importar Datos

```javascript
const db = useDB();
await db.importData(jsonData);
```

### Resetear Base de Datos

```javascript
const db = useDB();
await db.resetDatabase(); // Restaura valores por defecto
```

---

## 🎓 Conceptos Clave de Arquitectura

### 1. Interface/Contrato (`IDatabaseService`)
Define **QUÉ** métodos debe tener cualquier implementación, pero no **CÓMO** funcionan.

### 2. Implementación (`LocalDBService`)
Define **CÓMO** se ejecutan los métodos usando una tecnología específica (Dexie/IndexedDB).

### 3. Factory Pattern (`databaseProvider`)
Crea y proporciona la instancia correcta del servicio. Es el **único punto de cambio**.

### 4. Dependency Injection
Los componentes **no crean** instancias directamente, las **reciben** a través de `useDB()`.

---

## ✅ Ventajas de esta Arquitectura

✅ **Desacoplamiento**: Componentes no dependen de implementaciones específicas  
✅ **Testeable**: Fácil crear mocks para testing  
✅ **Mantenible**: Cambios en almacenamiento no afectan lógica de negocio  
✅ **Escalable**: Agregar nuevos métodos es trivial  
✅ **Future-Proof**: Migrar a cloud es cambiar 1 archivo  

---

## 📝 Próximos Pasos

### 1. Refactorizar `app.js`
Reemplazar todas las llamadas a `localStorage` por `useDB()`:

```javascript
// ANTES:
const data = JSON.parse(localStorage.getItem('plugfixData'));

// DESPUÉS:
import { useDB } from './database/databaseProvider.js';
const db = useDB();
const brands = await db.getAllBrands();
```

### 2. Actualizar Componentes
Ver `database/examples.js` para ejemplos completos de cada operación.

### 3. Testing
Crear pruebas para verificar que la migración funciona correctamente.

---

## 🐛 Debugging

### Inspeccionar IndexedDB

1. Abre Chrome DevTools (F12)
2. Ve a **Application** → **Storage** → **IndexedDB**
3. Busca `PlugFixDB`
4. Explora las tablas: brands, models, services, config, history

### Verificar Migración

```javascript
// En la consola del navegador
localStorage.getItem('plugfix_migration_completed'); // Debe ser 'true'
```

### Forzar Re-migración (para testing)

```javascript
localStorage.removeItem('plugfix_migration_completed');
location.reload();
```

---

## 📞 Soporte

Si tienes algún problema o pregunta sobre la arquitectura implementada, revisa:

1. **`database/examples.js`**: Ejemplos completos de todos los casos de uso
2. **`database/IDatabaseService.js`**: Documentación de todos los métodos disponibles
3. **Chrome DevTools**: Inspecciona IndexedDB para ver los datos almacenados

---

## 📄 Licencia

Este proyecto y su arquitectura fueron diseñados específicamente para Plug & Fix.

---

**🎉 ¡La nueva arquitectura está lista para usar!**

Los archivos HTML ya incluyen Dexie.js. El próximo paso es refactorizar `app.js` para usar `useDB()` en lugar de `localStorage`.
