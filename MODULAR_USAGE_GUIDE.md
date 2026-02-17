# 🚀 Guía Rápida - Uso de la Nueva Arquitectura Modular

## 📦 Importar y Usar Módulos

### Ejemplo 1: Usar el Servicio de Base de Datos

```javascript
// En cualquier módulo nuevo que crees
import { getDB } from './services/db.js';

async function getMarcas() {
    const db = getDB();
    const brands = await db.brands.toArray();
    console.log('Marcas disponibles:', brands);
}
```

### Ejemplo 2: Formatear Valores Monetarios

```javascript
import { formatARS, formatUSD, formatCurrency } from './utils/formatters.js';

const precio = 45000;
console.log(formatARS(precio));  // Output: "$ 45.000"
console.log(formatUSD(37.5));    // Output: "US$ 37.50"
console.log(formatCurrency(precio, 'ARS')); // Output: "$ 45.000"
```

### Ejemplo 3: Mostrar Notificaciones

```javascript
import { showToast, showSuccess, showError } from './utils/toast.js';

showSuccess('¡Operación exitosa!');
showError('Algo salió mal');
showToast('Mensaje informativo', 'info', 5000); // 5 segundos
```

### Ejemplo 4: Usar el Calculador

```javascript
import { calculatePrice, updatePriceDisplay } from './modules/calculator/calculator.js';

const params = {
    clientName: 'Juan Pérez',
    brand: 'Samsung',
    model: 'Galaxy S24',
    service: 'Cambio de Módulo',
    inputCost: 50000,
    inputCurrency: 'ARS'
};

const result = await calculatePrice(params);
updatePriceDisplay(result);

console.log('Precio calculado:', result.price); // Precio en ARS
console.log('Precio en USD:', result.priceUSD);
```

### Ejemplo 5: Trabajar con el Historial

```javascript
import { 
    saveToHistory, 
    renderHistory, 
    confirmClearHistory 
} from './modules/history/history.js';

// Guardar cálculo actual en historial
await saveToHistory();

// Re-renderizar tabla de historial
await renderHistory();

// Mostrar confirmación para limpiar
confirmClearHistory();
```

## 🧰 Crear un Módulo Nuevo desde Cero

### Paso 1: Crear archivo del módulo

```javascript
// src/modules/miModulo/miModulo.js

import { getDB } from '../../services/db.js';
import { showToast } from '../../utils/toast.js';

// Estado privado del módulo
let estadoLocal = null;

/**
 * Función principal del módulo
 */
export async function funcionPrincipal() {
    try {
        const db = getDB();
        // ... tu lógica aquí
        showToast('¡Éxito!');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al ejecutar función', 'error');
    }
}

/**
 * Inicializa el módulo
 */
export function initMiModulo() {
    // Configurar event listeners
    setupEventListeners();
    console.log('✅ Mi módulo inicializado');
}

/**
 * Configura event listeners (privada)
 */
function setupEventListeners() {
    // ... configuración de eventos
}
```

### Paso 2: Importar en app.js

```javascript
// src/app.js

import { initMiModulo } from './modules/miModulo/miModulo.js';

async function initApp() {
    // ... otras inicializaciones
    
    // Inicializar tu módulo
    initMiModulo();
    
    // ... resto del código
}
```

### Paso 3: Exponer funciones globales (si es necesario)

```javascript
// src/app.js

import { funcionPrincipal } from './modules/miModulo/miModulo.js';

// Al final de initApp()
window.funcionPrincipal = funcionPrincipal;
```

## 🎨 Patrones Comunes

### Patrón 1: Módulo con Estado

```javascript
// Estado privado (closure)
let currentPage = 1;
let itemsPerPage = 10;

// Exportar getters/setters
export function getCurrentPage() {
    return currentPage;
}

export function setCurrentPage(page) {
    currentPage = page;
}

// Exportar acciones
export async function nextPage() {
    currentPage++;
    await render();
}
```

### Patrón 2: Módulo de Servicio (sin DOM)

```javascript
// Servicio puro sin interacción con DOM
export class MiServicio {
    async getData() {
        const response = await fetch('/api/data');
        return response.json();
    }
    
    processData(data) {
        return data.map(item => ({
            ...item,
            processed: true
        }));
    }
}

export const miServicio = new MiServicio();
```

### Patrón 3: Módulo de UI (solo DOM)

```javascript
// Módulo que solo maneja UI
export function renderComponent(container, data) {
    container.innerHTML = `
        <div class="component">
            ${data.map(item => `
                <div class="item">${item.name}</div>
            `).join('')}
        </div>
    `;
}

export function setupListeners(container) {
    container.addEventListener('click', handleClick);
}

function handleClick(e) {
    // ... manejar click
}
```

## 🔧 Casos de Uso Específicos

### Agregar una Nueva Moneda

```javascript
// 1. Actualizar utils/formatters.js
export function formatEUR(value) {
    return `€ ${value.toFixed(2)}`;
}

export function formatCurrency(amount, currency) {
    switch(currency) {
        case 'ARS': return formatARS(amount);
        case 'USD': return formatUSD(amount);
        case 'EUR': return formatEUR(amount); // ← Nuevo
        default: return formatARS(amount);
    }
}

// 2. Actualizar calculator.js para soportar EUR
// 3. Actualizar UI para mostrar selector de EUR
```

### Agregar Validación de Formulario

```javascript
// src/utils/validators.js
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validatePhone(phone) {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone);
}

export function validateForm(formData) {
    const errors = [];
    
    if (!formData.name) {
        errors.push('El nombre es requerido');
    }
    
    if (!validateEmail(formData.email)) {
        errors.push('Email inválido');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Uso en un módulo:
import { validateForm } from '../../utils/validators.js';

const formData = {
    name: 'Juan',
    email: 'juan@example.com'
};

const { valid, errors } = validateForm(formData);
if (!valid) {
    console.error('Errores:', errors);
}
```

### Crear un Hook Personalizado

```javascript
// src/utils/hooks.js

/**
 * Hook para debounce de inputs
 */
export function useDebounce(callback, delay = 300) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}

// Uso:
import { useDebounce } from './utils/hooks.js';

const searchInput = document.getElementById('search');
const debouncedSearch = useDebounce(async (value) => {
    const results = await searchDatabase(value);
    renderResults(results);
}, 500);

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});
```

## 📊 Testing (Preparación para Futuros Tests)

La nueva arquitectura está lista para tests unitarios:

```javascript
// tests/calculator.test.js (ejemplo conceptual)

import { calculatePrice } from '../src/modules/calculator/calculator.js';

describe('calculatePrice', () => {
    it('debe calcular precio correctamente', async () => {
        const params = {
            brand: 'Samsung',
            model: 'Galaxy S24',
            service: 'Cambio de Módulo',
            inputCost: 50000,
            inputCurrency: 'ARS'
        };
        
        const result = await calculatePrice(params);
        
        expect(result.price).toBeGreaterThan(0);
        expect(result.cost).toBe(50000);
    });
});
```

## 🎯 Checklist para Agregar Funcionalidad

- [ ] ¿La funcionalidad nueva pertenece a un módulo existente?
  - Sí → Agregar función al módulo existente
  - No → Crear nuevo módulo

- [ ] ¿La función manipula el DOM?
  - Sí → Debe ir en un archivo `*UI.js`
  - No → Puede ir en lógica pura

- [ ] ¿La función es reutilizable en otros módulos?
  - Sí → Debe ir en `utils/` o `services/`
  - No → Puede quedarse privada en el módulo

- [ ] ¿Necesita acceso a la base de datos?
  - Sí → Importar `getDB()` de `services/db.js`

- [ ] ¿Necesita formatear moneda?
  - Sí → Importar de `utils/formatters.js`

- [ ] ¿Necesita mostrar notificaciones?
  - Sí → Importar de `utils/toast.js`

- [ ] ¿La función debe ser accesible desde HTML onclick?
  - Sí → Exponerla en `window` desde `app.js`

## 🚨 Errores Comunes y Soluciones

### Error: "getDB is not a function"
```javascript
// ❌ Mal
import getDB from './services/db.js';

// ✅ Bien
import { getDB } from './services/db.js';
```

### Error: "Cannot read property of undefined"
```javascript
// ❌ Mal - No verificar si el elemento existe
document.getElementById('miElemento').classList.add('active');

// ✅ Bien - Verificar existencia
const elemento = document.getElementById('miElemento');
if (elemento) {
    elemento.classList.add('active');
}
```

### Error: "Module not found"
```javascript
// ❌ Mal - Ruta absoluta
import { getDB } from '/services/db.js';

// ✅ Bien - Ruta relativa
import { getDB } from './services/db.js';
import { getDB } from '../services/db.js'; // Si estás en un subdirectorio
import { getDB } from '../../services/db.js'; // Si estás dos niveles abajo
```

## 🎓 Próximos Pasos Recomendados

1. **Familiarízate con los módulos**: Lee cada archivo en `src/` para entender su propósito
2. **Experimenta**: Crea un módulo de prueba siguiendo los ejemplos
3. **Refactoriza otras páginas**: Aplica la misma arquitectura a `database.html` y `config.html`
4. **Agrega tests**: Configura Jest o Vitest para tests unitarios
5. **Documenta**: Agrega comentarios JSDoc a tus funciones

---

**¿Tienes dudas?** Consulta la [Guía Completa de Arquitectura](./MODULAR_ARCHITECTURE_GUIDE.md) para más detalles.
