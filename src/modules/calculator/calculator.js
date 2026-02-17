/**
 * Calculator Module - Lógica de Cálculo de Precios
 * 
 * Este módulo maneja toda la lógica del calculador de precios:
 * - Cálculos de precio basados en configuración
 * - Conversión de monedas
 * - Actualización de la UI del resultado
 * - Gestión del estado del cálculo actual
 */

import { getDB } from '../../services/db.js';
import { getCachedDolarPrice } from '../../services/currency.js';
import { formatARS, formatUSD } from '../../utils/formatters.js';

// Estado del módulo
let lastCalculation = null;
let displayCurrency = 'ARS';

/**
 * Obtiene el último cálculo realizado
 * @returns {Object|null}
 */
export function getLastCalculation() {
    return lastCalculation;
}

/**
 * Obtiene la moneda de visualización actual
 * @returns {string}
 */
export function getDisplayCurrency() {
    return displayCurrency;
}

/**
 * Establece la moneda de visualización
 * @param {string} currency - 'ARS' o 'USD'
 */
export function setDisplayCurrency(currency) {
    displayCurrency = currency;
}

/**
 * Calcula el precio de una reparación
 * 
 * @param {Object} params - Parámetros del cálculo
 * @param {string} params.clientName - Nombre del cliente (opcional)
 * @param {string} params.brand - Marca del dispositivo
 * @param {string} params.model - Modelo del dispositivo
 * @param {string} params.service - Tipo de servicio
 * @param {number} params.inputCost - Costo del repuesto
 * @param {string} params.inputCurrency - Moneda del costo ('ARS' | 'USD')
 * @returns {Promise<Object|null>} Resultado del cálculo o null si faltan datos
 */
export async function calculatePrice(params) {
    const { clientName, brand, model, service, inputCost, inputCurrency } = params;
    
    // Validar que todos los campos requeridos estén presentes
    if (!brand || !model || !service || inputCost === 0) {
        lastCalculation = null;
        return null;
    }

    try {
        const db = getDB();

        // Buscar marca
        const brands = await db.brands.where('name').equals(brand).toArray();
        const brandData = brands[0];
        if (!brandData) {
            lastCalculation = null;
            return null;
        }

        // Buscar modelo
        const models = await db.models
            .where('brandId').equals(brandData.id)
            .and(m => m.name === model)
            .toArray();
        const modelData = models[0];
        if (!modelData) {
            lastCalculation = null;
            return null;
        }

        // Buscar servicio
        const services = await db.services.where('name').equals(service).toArray();
        const serviceData = services[0];
        if (!serviceData) {
            lastCalculation = null;
            return null;
        }

        // Obtener configuración
        const config = await db.config.get('main');
        if (!config) {
            throw new Error('Configuración no encontrada');
        }

        // Obtener cotización del dólar (Source of Truth)
        const dolarRate = getCachedDolarPrice() || config.usdRate || 1200;
        console.log(`💵 Usando cotización: $${dolarRate}`);

        // Normalización: Convertir todo a ARS primero
        let baseCostInArs;
        if (inputCurrency === 'USD') {
            baseCostInArs = inputCost * dolarRate;
            console.log(`🔄 Conversión: ${inputCost} USD × ${dolarRate} = ${baseCostInArs.toFixed(2)} ARS`);
        } else {
            baseCostInArs = inputCost;
        }

        // Cálculo de precio
        const marginMultiplier = 1 + (config.margin / 100);
        const partCost = baseCostInArs * marginMultiplier;
        const laborCost = serviceData.hours * config.hourlyRate * modelData.riskFactor;
        
        // Redondeo comercial en ARS - Precio Final
        const finalPriceARSRaw = partCost + laborCost;
        const finalPriceARS = Math.ceil(finalPriceARSRaw / 100) * 100;
        const finalPriceUSD = finalPriceARS / dolarRate;
        const profit = finalPriceARS - baseCostInArs;
        const profitMargin = ((profit / finalPriceARS) * 100).toFixed(1);

        console.log(`✅ Cálculo Final: ${finalPriceARS} ARS (~${finalPriceUSD.toFixed(2)} USD)`);

        // Guardar resultado
        lastCalculation = {
            date: new Date().toLocaleString('es-AR'),
            clientName: clientName || '',
            brand: brandData.name,
            model: modelData.name,
            service: serviceData.name,
            cost: baseCostInArs,
            partCost: partCost,
            laborCost: laborCost,
            price: finalPriceARS,
            priceUSD: finalPriceUSD,
            profit: profit,
            profitMargin: profitMargin,
            dolarRate: dolarRate
        };

        return lastCalculation;
    } catch (error) {
        console.error('Error al calcular precio:', error);
        throw error;
    }
}

/**
 * Actualiza la visualización del resultado en la UI
 * 
 * @param {Object} calculation - Objeto con el resultado del cálculo
 */
export function updatePriceDisplay(calculation) {
    if (!calculation) {
        document.getElementById('result-container')?.classList.add('hidden');
        return;
    }

    const container = document.getElementById('result-container');
    const finalPriceElement = document.getElementById('final-price');
    const costBreakdown = document.getElementById('cost-breakdown');
    const laborBreakdown = document.getElementById('labor-breakdown');
    const profitBreakdown = document.getElementById('profit-breakdown');
    const marginBreakdown = document.getElementById('margin-breakdown');

    if (!container || !finalPriceElement) return;

    // Mostrar container
    container.classList.remove('hidden');

    // Actualizar precio principal según moneda de visualización
    if (displayCurrency === 'ARS') {
        finalPriceElement.textContent = formatARS(calculation.price);
        finalPriceElement.className = 'result-price-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 md:mb-8';
    } else {
        finalPriceElement.textContent = formatUSD(calculation.priceUSD);
        finalPriceElement.className = 'result-price-display font-extrabold text-green-400 mb-6 md:mb-8';
    }

    // Actualizar desglose (siempre en ARS)
    if (costBreakdown) costBreakdown.textContent = formatARS(calculation.partCost);
    if (laborBreakdown) laborBreakdown.textContent = formatARS(calculation.laborCost);
    if (profitBreakdown) profitBreakdown.textContent = formatARS(calculation.profit);
    if (marginBreakdown) marginBreakdown.textContent = `${calculation.profitMargin}%`;

    // Actualizar badge de moneda
    updateCurrencyBadge();
}

/**
 * Actualiza el badge indicador de moneda
 */
function updateCurrencyBadge() {
    const toggleBtn = document.getElementById('currency-toggle-btn');
    if (!toggleBtn) return;

    if (displayCurrency === 'ARS') {
        toggleBtn.innerHTML = '💵 USD';
        toggleBtn.title = 'Ver precio en dólares';
        toggleBtn.classList.remove('bg-green-700', 'text-green-300');
        toggleBtn.classList.add('bg-slate-700', 'text-cyan-400');
    } else {
        toggleBtn.innerHTML = '💰 ARS';
        toggleBtn.title = 'Ver precio en pesos';
        toggleBtn.classList.remove('bg-slate-700', 'text-cyan-400');
        toggleBtn.classList.add('bg-green-700', 'text-green-300');
    }
}

/**
 * Alterna entre ARS y USD en la visualización
 */
export function toggleDisplayCurrency() {
    if (!lastCalculation) return;
    
    displayCurrency = displayCurrency === 'ARS' ? 'USD' : 'ARS';
    updatePriceDisplay(lastCalculation);
}

/**
 * Genera el texto del presupuesto para copiar al portapapeles
 * 
 * @param {Object} calculation - Objeto con el resultado del cálculo
 * @returns {string} Texto formateado del presupuesto
 */
export function generateBudgetText(calculation) {
    if (!calculation) {
        return '';
    }

    const clientLine = calculation.clientName ? `👤 Cliente: ${calculation.clientName}\n` : '';
    
    const roundedPriceARS = Math.ceil(calculation.price / 100) * 100;
    const priceLineARS = `💰 PRECIO TOTAL: ${formatARS(roundedPriceARS)}`;
    const priceLineUSD = calculation.priceUSD 
        ? `💵 Equivalente: ${formatUSD(calculation.priceUSD)} (Cotización: $${calculation.dolarRate})` 
        : '';
    const priceSection = priceLineUSD ? `${priceLineARS}\n${priceLineUSD}` : priceLineARS;
    
    const partCostRounded = Math.ceil(calculation.partCost / 100) * 100;
    const laborCostRounded = roundedPriceARS - partCostRounded;
    
    return `🔧 PRESUPUESTO - soyNerin.tech

${clientLine}📱 Dispositivo: ${calculation.brand} ${calculation.model}
🛠️ Servicio: ${calculation.service}

${priceSection}

📋 Detalle:
  • Costo Repuesto: ${formatARS(partCostRounded)}
  • Mano de Obra: ${formatARS(laborCostRounded)}

📅 Fecha: ${calculation.date}

⚡ soyNerin.tech - Servicio Técnico`;
}
