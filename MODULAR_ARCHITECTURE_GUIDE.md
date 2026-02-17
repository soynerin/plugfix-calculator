# Refactorización a Arquitectura Modular - Guía Completa

## 📁 Nueva Estructura de Archivos

```
plugfix-calculator/
├── index.html                      # HTML limpio (solo imports del módulo principal)
├── styles.css                      # Estilos globales
├── database/                       # Sistema de base de datos (arquitectura existente)
│   ├── databaseProvider.js
│   ├── LocalDBService.js
│   ├── IDatabaseService.js
│   └── migrationService.js
└── src/                           # 🆕 Nueva arquitectura modular
    ├── app.js                     # 🎯 ORQUESTADOR PRINCIPAL
    ├── services/                  # Servicios de negocio
    │   ├── db.js                 # Configuración Dexie.js + Seeding
    │   └── currency.js           # API de cotización del dólar
    ├── utils/                     # Utilidades reutilizables
    │   ├── formatters.js         # Formateo de monedas
    │   ├── toast.js              # Sistema de notificaciones
    │   └── modal.js              # Sistema de modales
    └── modules/                   # Módulos funcionales
        ├── calculator/
        │   ├── calculator.js     # Lógica de cálculo de precios
        │   └── calculatorUI.js   # Interfaz y event listeners
        ├── history/
        │   └── history.js        # Gestión de historial
        └── navigation/
            └── navigation.js     # Gestión de navegación entre tabs
```

## 🎯 Filosofía de la Arquitectura

### Separación de Responsabilidades

Cada archivo tiene **una única responsabilidad** clara:

- **Servicios**: Lógica de negocio pura (sin DOM)
- **Módulos**: Lógica de funcionalidad específica
- **Utilidades**: Funciones auxiliares reutilizables
- **Orquestador**: Coordina la inicialización de todos los módulos

### Ventajas del Diseño Modular

✅ **Mantenibilidad**: Cada módulo es independiente y fácil de modificar
✅ **Testabilidad**: Funciones puras que pueden ser testeadas aisladamente
✅ **Escalabilidad**: Agregar nuevas funcionalidades sin tocar código existente
✅ **Reutilización**: Utilidades y servicios pueden usarse en múltiples módulos
✅ **Claridad**: El código es autodocumentado y fácil de entender

## 📚 Guía de Archivos Clave

### 1. `src/app.js` - El Orquestador

**Responsabilidad**: Punto de entrada principal que inicializa todos los módulos.

```javascript
import { initDB } from './services/db.js';
import { initCalculator } from './modules/calculator/calculatorUI.js';
import { initHistory } from './modules/history/history.js';
import { initNavigation } from './modules/navigation/navigation.js';

// Inicializa la aplicación en orden:
// 1. Base de datos
// 2. Sistema de modales
// 3. Módulos principales
// 4. Expone funciones globales necesarias
```

**Cuándo modificar**: Solo cuando agregues un nuevo módulo principal.

---

### 2. `src/services/db.js` - Base de Datos

**Responsabilidad**: Configuración de Dexie.js y seeding de datos iniciales.

```javascript
export async function initDB()        // Inicializa IndexedDB
export function getDB()               // Obtiene instancia de la DB
export async function seedDatabase()  // Puebla con datos iniciales
```

**Cuándo modificar**: 
- Cambiar esquema de la base de datos
- Agregar/modificar datos de seeding
- Cambiar versión del schema

---

### 3. `src/services/currency.js` - Cotización de Dólar

**Responsabilidad**: Obtener y cachear cotización del dólar desde DolarApi.

```javascript
export async function getDolarPrice(forceRefresh)  // Obtiene precio (cache o API)
export function updateDolarCache(price)            // Actualiza cache manualmente
export function getCachedDolarPrice()              // Lee precio del cache
```

**Cuándo modificar**: 
- Cambiar API de cotización
- Modificar estrategia de cache
- Agregar soporte para otras monedas

---

### 4. `src/utils/formatters.js` - Formateo de Valores

**Responsabilidad**: Formatear valores monetarios con reglas específicas.

```javascript
export function formatARS(value)               // Formatea en pesos (redondeado)
export function formatUSD(value)               // Formatea en dólares (2 decimales)
export function formatCurrency(amount, currency) // Formatea según moneda
```

**Características**:
- ARS: Redondeo comercial al 100 más cercano (hacia arriba)
- USD: Siempre 2 decimales, sin redondeo agresivo

**Cuándo modificar**: Cambiar reglas de formateo o agregar nuevas monedas.

---

### 5. `src/modules/calculator/calculator.js` - Lógica de Cálculo

**Responsabilidad**: Toda la lógica matemática del calculador (sin manipulación de DOM).

```javascript
export async function calculatePrice(params)   // Calcula precio de reparación
export function updatePriceDisplay(calculation) // Actualiza UI con resultado
export function toggleDisplayCurrency()        // Alterna entre ARS/USD
export function generateBudgetText()           // Genera texto del presupuesto
```

**Flujo de cálculo**:
1. Obtener cotización del dólar (source of truth)
2. Normalizar costo a ARS
3. Aplicar fórmula: `(Costo × Margen) + (Horas × ValorHora × FactorRiesgo)`
4. Redondeo comercial en ARS
5. Calcular equivalente en USD

**Cuándo modificar**: Cambiar fórmulas de cálculo o agregar nuevos conceptos.

---

### 6. `src/modules/calculator/calculatorUI.js` - Interfaz del Calculador

**Responsabilidad**: Manejo de event listeners e interacción con la UI.

```javascript
export async function initCalculator()          // Inicializa módulo
export async function copyBudgetToClipboard()   // Copia presupuesto
export function resetCalculator()               // Limpia formulario
```

**Funcionalidades**:
- Cascading selects (marca → modelo)
- Validación en tiempo real
- Alertas de seguridad (USD > 1000)
- Sugerencia de último costo usado

**Cuándo modificar**: Agregar nuevos campos o cambiar comportamiento de la UI.

---

### 7. `src/modules/history/history.js` - Historial

**Responsabilidad**: Gestión del historial de presupuestos.

```javascript
export async function saveToHistory()     // Guarda cálculo actual
export async function renderHistory()     // Renderiza tabla con paginación
export function confirmClearHistory()     // Elimina todo el historial
```

**Características**:
- Paginación (5 items por página)
- Métricas mensuales (reparaciones, facturación, ganancia)
- Diseño responsive (tabla en desktop, cards en móvil)

**Cuándo modificar**: Cambiar lógica de almacenamiento o presentación del historial.

---

### 8. `src/modules/navigation/navigation.js` - Navegación

**Responsabilidad**: Gestión de navegación entre tabs y advertencias.

```javascript
export function setActiveTab(tabName)          // Marca tab activo
export function setupNavigationWarning()       // Advierte de cambios sin guardar
```

**Cuándo modificar**: Agregar nuevas páginas o cambiar comportamiento de navegación.

---

## 🔄 Diagrama de Flujo de Inicialización

```
index.html
    └─> <script type="module" src="./src/app.js">
            │
            ├─> Migración (localStorage → IndexedDB)
            ├─> initDB()
            ├─> initModal()
            ├─> getDolarPrice() [background]
            ├─> initCalculator()
            ├─> initHistory()
            ├─> initNavigation()
            └─> Exponer funciones globales (window.*)
```

## 🧩 Dependencias entre Módulos

```
app.js (orquestador)
  ├── services/db.js
  │     └── (usa) Dexie.js
  ├── services/currency.js
  │     └── (usa) DolarApi
  ├── utils/formatters.js
  ├── utils/toast.js
  ├── utils/modal.js
  └── modules/
        ├── calculator/
        │     ├── calculator.js
        │     │     ├── (usa) services/db.js
        │     │     ├── (usa) services/currency.js
        │     │     └── (usa) utils/formatters.js
        │     └── calculatorUI.js
        │           ├── (usa) calculator.js
        │           ├── (usa) services/db.js
        │           └── (usa) utils/toast.js
        ├── history/
        │     └── history.js
        │           ├── (usa) services/db.js
        │           ├── (usa) utils/formatters.js
        │           ├── (usa) utils/toast.js
        │           └── (usa) utils/modal.js
        └── navigation/
              └── navigation.js
                    ├── (usa) utils/modal.js
                    └── (usa) calculator/calculatorUI.js
```

## 📝 Cómo Agregar una Nueva Funcionalidad

### Ejemplo: Agregar módulo de "Estadísticas Avanzadas"

1. **Crear el módulo**:
```bash
src/modules/statistics/
  └── statistics.js
```

2. **Implementar lógica**:
```javascript
// src/modules/statistics/statistics.js
import { getDB } from '../../services/db.js';
import { formatARS } from '../../utils/formatters.js';

export async function calculateYearlyStats() {
    const db = getDB();
    // ... lógica
}

export function initStatistics() {
    console.log('✅ Módulo estadísticas inicializado');
}
```

3. **Importar en app.js**:
```javascript
import { initStatistics } from './modules/statistics/statistics.js';

// En initApp():
initStatistics();
```

4. **Exponer funciones si es necesario**:
```javascript
window.calculateYearlyStats = calculateYearlyStats;
```

## ⚡ Mejores Prácticas

### 1. **Naming Conventions**
- Archivos: `camelCase.js`
- Funciones exportadas: `camelCase()`
- Constantes: `UPPER_SNAKE_CASE`

### 2. **Imports**
- Siempre usar rutas **relativas** desde el archivo actual
- Ordenar imports: Servicios → Utilidades → Módulos

### 3. **Exports**
- Preferir **named exports** sobre default exports
- Exportar solo lo que se necesita externamente

### 4. **Comentarios**
- Documentar responsabilidad del módulo al inicio
- JSDoc para funciones públicas

### 5. **Estado**
- Mantener estado local en cada módulo
- Evitar variables globales (usar closures)

## 🚀 Migración Gradual (Si necesitas compatibilidad temporal)

Si necesitas mantener el código anterior funcionando mientras migras:

1. Mantén ambos scripts:
```html
<script src="app.js"></script>           <!-- Código viejo -->
<script type="module" src="./src/app.js"></script>  <!-- Código nuevo -->
```

2. Migra funcionalidad por funcionalidad
3. Elimina el código viejo cuando todo esté migrado

## 🔍 Troubleshooting

### Error: "Cannot find module"
- Verifica que la ruta relativa sea correcta
- Asegúrate de que el archivo tenga extensión `.js`

### Error: "DB is not initialized"
- Verifica que `initDB()` se llame antes de usar `getDB()`
- Usa `await initDB()` en funciones async

### Funciones no disponibles en `window`
- Verifica que estén expuestas en `app.js`:
```javascript
window.nombreFuncion = nombreFuncion;
```

## 📖 Recursos Adicionales

- [ES Modules MDN](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [Dexie.js Documentation](https://dexie.org/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**¡Felicidades!** 🎉 Tu aplicación ahora tiene una arquitectura modular profesional, fácil de mantener y expandir.
