/**
 * SISTEMA DE AUTENTICACIÓN
 * ======================
 * Gestiona el login y la sesión del usuario
 */

class AuthManager {
    constructor() {
        this.CORRECT_PASSWORD = 'Ryan22012817';
        this.SESSION_KEY = 'rayner_session_active';
        this.MAX_ATTEMPTS = 5;
        this.LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos
        this.initializeAuth();
    }

    /**
     * INICIALIZAR AUTENTICACIÓN
     */
    initializeAuth() {
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('passwordInput');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (passwordInput) {
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        // Mostrar pantalla de login si no hay sesión
        this.checkSession();
    }

    /**
     * MANEJAR INTENTO DE LOGIN
     */
    async handleLogin(e) {
        if (e) e.preventDefault();

        const passwordInput = document.getElementById('passwordInput');
        const password = passwordInput.value;
        const errorElement = document.getElementById('loginError');

        // Validar intento de fuerza bruta
        if (this.isLockedOut()) {
            errorElement.textContent = '❌ Demasiados intentos. Espera 5 minutos.';
            return;
        }

        // Validar contraseña
        if (this.validatePassword(password)) {
            this.loginSuccess();
        } else {
            this.loginFailed();
            errorElement.textContent = '❌ Contraseña incorrecta';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    /**
     * VALIDAR CONTRASEÑA
     */
    validatePassword(password) {
        return password === this.CORRECT_PASSWORD;
    }

    /**
     * LOGIN EXITOSO
     */
    async loginSuccess() {
        console.log('✅ Login exitoso');
        
        // Crear sesión
        storage.set(this.SESSION_KEY, {
            authenticated: true,
            login_time: new Date().toISOString(),
            attempts: 0
        });

        // Mostrar pantalla de galaxia
        this.showLoadingScreen();

        // Después de 7 segundos, mostrar bienvenida épica
        setTimeout(() => {
            this.showWelcomeScreen();
        }, 7000);

        // Después de 10 segundos más, ir al dashboard
        setTimeout(() => {
            this.goToDashboard();
        }, 17000);
    }

    /**
     * LOGIN FALLIDO
     */
    loginFailed() {
        console.log('❌ Intento de login fallido');
        
        let attempts = this.getAttempts();
        attempts++;
        
        if (attempts >= this.MAX_ATTEMPTS) {
            storage.set('login_lockout', {
                locked: true,
                lockout_time: new Date().toISOString()
            });
            console.log('🔒 Cuenta bloqueada por seguridad');
        } else {
            storage.set('login_attempts', attempts);
        }
    }

    /**
     * OBTENER NÚMERO DE INTENTOS
     */
    getAttempts() {
        return storage.get('login_attempts') || 0;
    }

    /**
     * VERIFICAR SI ESTÁ BLOQUEADO
     */
    isLockedOut() {
        const lockout = storage.get('login_lockout');
        
        if (!lockout || !lockout.locked) {
            return false;
        }

        const lockoutTime = new Date(lockout.lockout_time).getTime();
        const currentTime = new Date().getTime();
        const timePassed = currentTime - lockoutTime;

        if (timePassed > this.LOCKOUT_TIME) {
            storage.delete('login_lockout');
            storage.set('login_attempts', 0);
            return false;
        }

        return true;
    }

    /**
     * MOSTRAR PANTALLA DE CARGA (GALAXIA)
     */
    showLoadingScreen() {
        const loginContainer = document.getElementById('loginContainer');
        const loadingScreen = document.getElementById('loadingScreen');

        if (loginContainer) loginContainer.classList.add('hidden');
        if (loadingScreen) loadingScreen.classList.remove('hidden');
    }

    /**
     * MOSTRAR PANTALLA DE BIENVENIDA
     */
    showWelcomeScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const welcomeScreen = document.getElementById('welcomeScreen');

        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');

        // Animar partículas del logo
        this.animateLogoParticles();
    }

    /**
     * ANIMAR PARTÍCULAS DEL LOGO
     */
    animateLogoParticles() {
        const particles = document.querySelectorAll('.logo-particles span');
        const angleSlice = (Math.PI * 2) / particles.length;

        particles.forEach((particle, index) => {
            const angle = angleSlice * index;
            const distance = 200;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            particle.style.setProperty('--tx', `${x}px`);
            particle.style.setProperty('--ty', `${y}px`);
        });
    }

    /**
     * IR AL DASHBOARD
     */
    goToDashboard() {
        window.location.href = 'pages/dashboard.html';
    }

    /**
     * VERIFICAR SESIÓN
     */
    checkSession() {
        const session = storage.get(this.SESSION_KEY);

        if (session && session.authenticated) {
            // Si ya hay sesión activa, ir al dashboard
            const currentPage = window.location.pathname;
            if (currentPage.includes('index.html') || currentPage === '/') {
                setTimeout(() => {
                    this.goToDashboard();
                }, 500);
            }
        }
    }

    /**
     * LOGOUT
     */
    logout() {
        storage.delete(this.SESSION_KEY);
        storage.delete('login_attempts');
        window.location.href = '../index.html';
    }

    /**
     * VERIFICAR SI ESTÁ AUTENTICADO
     */
    isAuthenticated() {
        return !!storage.get(this.SESSION_KEY);
    }
}

/**
 * TOGGLE VISIBILIDAD DE CONTRASEÑA
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.querySelector('.eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

// Instancia global del Auth Manager
const auth = new AuthManager();
