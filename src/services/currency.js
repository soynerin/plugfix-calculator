/**
 * Currency Service - Servicio de Cotización de Dólar
 * 
 * Gestiona la obtención y cache de la cotización del Dólar Blue
 * desde la API pública DolarApi.com
 */

const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/blue';
const CACHE_KEY = 'cachedDolarPrice';
const DATE_KEY = 'lastFetchDate';

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha actual
 */
function getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Obtiene el precio del dólar desde cache o API
 * 
 * @param {boolean} forceRefresh - Forzar actualización desde API
 * @returns {Promise<{price: number, source: string, date: string}>}
 */
export async function getDolarPrice(forceRefresh = false) {
    const today = getTodayDate();
    const cachedPrice = localStorage.getItem(CACHE_KEY);
    const lastFetchDate = localStorage.getItem(DATE_KEY);

    // Si hay cache del mismo día y no es refresh forzado, usar cache
    if (!forceRefresh && lastFetchDate === today && cachedPrice) {
        console.log('📦 Usando cotización en cache:', cachedPrice);
        return {
            price: parseFloat(cachedPrice),
            source: 'cache',
            date: today
        };
    }

    try {
        console.log('🌐 Consultando API de Dólar Blue...');
        const response = await fetch(DOLAR_API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const dolarVenta = data.venta;

        if (dolarVenta && !isNaN(dolarVenta)) {
            // Guardar en cache
            localStorage.setItem(CACHE_KEY, dolarVenta);
            localStorage.setItem(DATE_KEY, today);
            
            console.log('✅ Cotización actualizada:', dolarVenta);
            
            return {
                price: parseFloat(dolarVenta),
                source: 'api',
                date: today
            };
        } else {
            throw new Error('Valor de venta inválido');
        }
    } catch (error) {
        console.error('❌ Error al obtener cotización del dólar:', error);
        
        // Si hay un valor en cache antiguo, usarlo
        if (cachedPrice) {
            return {
                price: parseFloat(cachedPrice),
                source: 'error',
                date: lastFetchDate || 'desconocida'
            };
        }
        
        // Si no hay cache, retornar null
        return {
            price: null,
            source: 'error',
            date: null
        };
    }
}

/**
 * Actualiza el cache del dólar con un valor manual
 * 
 * @param {number} price - Precio a guardar
 */
export function updateDolarCache(price) {
    const today = getTodayDate();
    localStorage.setItem(CACHE_KEY, price.toString());
    localStorage.setItem(DATE_KEY, today);
    console.log('💾 Cache del dólar actualizado:', price);
}

/**
 * Obtiene el precio del dólar desde cache (sin consultar API)
 * 
 * @returns {number|null} Precio en cache o null
 */
export function getCachedDolarPrice() {
    const cachedPrice = localStorage.getItem(CACHE_KEY);
    return cachedPrice ? parseFloat(cachedPrice) : null;
}

/**
 * Limpia el cache del dólar
 */
export function clearDolarCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(DATE_KEY);
    console.log('🗑️ Cache del dólar eliminado');
}
