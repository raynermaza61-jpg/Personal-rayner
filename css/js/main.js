/**
 * GESTOR PRINCIPAL DE LA APLICACIÓN
 * ================================
 * Coordina toda la aplicación y la navegación
 */

class AppManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = ['dashboard', 'finanzas', 'horario', 'notas'];
        this.initialize();
    }

    /**
     * INICIALIZAR APLICACIÓN
     */
    initialize() {
        // Verificar autenticación
        if (!auth.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }

        console.log('🚀 Aplicación iniciada');
        this.setupEventListeners();
        this.loadDashboard();
    }

    /**
     * CONFIGURAR LISTENERS DE EVENTOS
     */
    setupEventListeners() {
        // Botones de navegación
        const btnFinanzas = document.getElementById('btn-finanzas');
        const btnHorario = document.getElementById('btn-horario');
        const btnNotas = document.getElementById('btn-notas');
        const logoutBtn = document.querySelector('.logout-btn');

        if (btnFinanzas) btnFinanzas.addEventListener('click', () => this.navigateTo('finanzas'));
        if (btnHorario) btnHorario.addEventListener('click', () => this.navigateTo('horario'));
        if (btnNotas) btnNotas.addEventListener('click', () => this.navigateTo('notas'));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    }

    /**
     * NAVEGAR A UNA PÁGINA
     */
    navigateTo(page) {
        if (this.pages.includes(page)) {
            this.currentPage = page;
            console.log(`📄 Navegando a: ${page}`);
            window.location.href = `${page}.html`;
        }
    }

    /**
     * CARGAR DASHBOARD
     */
    loadDashboard() {
        const container = document.querySelector('.dashboard-container');
        if (container) {
            console.log('📊 Dashboard cargado');
        }
    }

    /**
     * LOGOUT
     */
    logout() {
        if (confirm('¿Estás seguro de que quieres salir?')) {
            auth.logout();
        }
    }
}

// Instancia global del App Manager
let app;

/**
 * INICIAR CUANDO EL DOM ESTÉ LISTO
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    
    // Solo inicializar AppManager en páginas del dashboard
    if (!currentPage.includes('index.html') && currentPage !== '/') {
        app = new AppManager();
    }
});

/**
 * UTILIDADES GLOBALES
 */

/**
 * MOSTRAR NOTIFICACIÓN
 */
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00ff88' : '#ff4757'};
        color: #000;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * FORMATEAR FECHA
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * FORMATEAR HORA
 */
function formatTime(time) {
    return time.substring(0, 5);
}

/**
 * OBTENER FECHA ACTUAL
 */
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * OBTENER FECHA DE INICIO DE SEMANA
 */
function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

/**
 * OBTENER FECHA DE INICIO DE MES
 */
function getMonthStart(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * OBTENER FECHA DE INICIO DE AÑO
 */
function getYearStart(date = new Date()) {
    return new Date(date.getFullYear(), 0, 1);
}

/**
 * VALIDAR EMAIL
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * VALIDAR NÚMERO
 */
function isValidNumber(value) {
    return !isNaN(value) && value !== '';
}

/**
 * GENERAR ID ÚNICO
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
