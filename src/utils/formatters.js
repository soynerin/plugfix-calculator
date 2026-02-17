/**
 * Formateadores de Moneda - Utilidades para formateo de valores monetarios
 * 
 * Este módulo centraliza toda la lógica de formateo de moneda,
 * aplicando reglas distintivas para ARS y USD.
 */

/**
 * Formatea valores en Pesos Argentinos (ARS)
 * - Aplica redondeo comercial: siempre hacia arriba al 100 más cercano
 * - Sin decimales
 * - Separador de miles con punto
 * 
 * @param {number} value - Valor numérico a formatear
 * @returns {string} - Valor formateado (ej: "$ 45.000")
 */
export function formatARS(value) {
    const roundedValue = Math.ceil(value / 100) * 100;
    return `$ ${roundedValue.toLocaleString('es-AR')}`;
}

/**
 * Formatea valores en Dólares Estadounidenses (USD)
 * - Redondeo hacia arriba sin decimales
 * - Separador de miles con coma
 * 
 * @param {number} value - Valor numérico a formatear
 * @returns {string} - Valor formateado (ej: "US$ 50")
 */
export function formatUSD(value) {
    const roundedValue = Math.ceil(value);
    return `US$ ${roundedValue.toLocaleString('en-US')}`;
}

/**
 * Formatea un valor según la moneda especificada
 * 
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda ('ARS' o 'USD')
 * @returns {string} - Valor formateado
 */
export function formatCurrency(amount, currency) {
    if (currency === 'USD') {
        return formatUSD(amount);
    }
    return formatARS(amount);
}

/**
 * Parsea un valor de string a número, eliminando símbolos de moneda
 * 
 * @param {string} value - String con valor monetario
 * @returns {number} - Valor numérico parseado
 */
export function parseCurrency(value) {
    if (typeof value === 'number') return value;
    
    // Eliminar símbolos de moneda y espacios
    const cleaned = value.replace(/[$\s]/g, '').replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
}
