// Inicialización de datos
const DEFAULT_DATA = {
    config: {
        hourlyRate: 13000,
        margin: 40,
        usdRate: 1200
    },
    brands: [
        {
            id: 'samsung',
            name: 'Samsung',
            models: [
                { id: 'a14', name: 'Galaxy A14', riskFactor: 1.0 },
                { id: 's23', name: 'Galaxy S23', riskFactor: 1.5 }
            ]
        },
        {
            id: 'apple',
            name: 'Apple',
            models: [
                { id: 'iphone11', name: 'iPhone 11', riskFactor: 1.5 },
                { id: 'iphone14', name: 'iPhone 14', riskFactor: 2.0 }
            ]
        }
    ],
    services: [
        { id: 'screen', name: 'Cambio de Módulo', hours: 1.0 },
        { id: 'battery', name: 'Cambio de Batería', hours: 0.5 },
        { id: 'charging', name: 'Pin de Carga', hours: 1.5 },
        { id: 'software', name: 'Limpieza/Software', hours: 0.5 }
    ],
    history: []
};

// Cargar o inicializar datos
function loadData() {
    const saved = localStorage.getItem('plugfixData');
    if (!saved) {
        localStorage.setItem('plugfixData', JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    }
    return JSON.parse(saved);
}

function saveData(data) {
    localStorage.setItem('plugfixData', JSON.stringify(data));
}

let appData = loadData();

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast glass-card rounded-lg p-4 ${type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`;
    toast.innerHTML = `
        <p class="text-white font-medium">${message}</p>
    `;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Marcar tab activo en la navegación
function setActiveTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('tab-active');
    }
}
