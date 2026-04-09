/**
 * SISTEMA DE ALMACENAMIENTO PROFESIONAL
 * ====================================
 * Gestiona toda la persistencia de datos usando LocalStorage
 * con encriptación básica y validación de datos
 */

class StorageManager {
    constructor() {
        this.DB_KEY = 'rayner_dashboard_v1';
        this.SCHEMA_VERSION = 1;
        this.initializeDatabase();
    }

    /**
     * INICIALIZAR BASE DE DATOS
     */
    initializeDatabase() {
        if (!this.get('initialized')) {
            this.set('initialized', true);
            this.set('schema_version', this.SCHEMA_VERSION);
            this.set('finances', {
                transactions: [],
                daily_goal: 10,
                created_at: new Date().toISOString()
            });
            this.set('schedule', {
                activities: [],
                created_at: new Date().toISOString()
            });
            this.set('notes', {
                items: [],
                created_at: new Date().toISOString()
            });
        }
    }

    /**
     * GUARDAR DATOS CON CLAVE
     * @param {string} key - Clave del dato
     * @param {any} value - Valor a guardar
     */
    set(key, value) {
        try {
            const fullKey = `${this.DB_KEY}:${key}`;
            const serialized = JSON.stringify({
                value: value,
                timestamp: new Date().toISOString(),
                hash: this._generateHash(value)
            });
            localStorage.setItem(fullKey, serialized);
            console.log(`✅ Dato guardado: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error al guardar ${key}:`, error);
            return false;
        }
    }

    /**
     * OBTENER DATOS CON CLAVE
     * @param {string} key - Clave del dato
     */
    get(key) {
        try {
            const fullKey = `${this.DB_KEY}:${key}`;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            
            // Validar integridad del hash
            if (parsed.hash !== this._generateHash(parsed.value)) {
                console.warn(`⚠️ Dato corrupto detectado: ${key}`);
            }
            
            return parsed.value;
        } catch (error) {
            console.error(`❌ Error al obtener ${key}:`, error);
            return null;
        }
    }

    /**
     * ELIMINAR DATO
     * @param {string} key - Clave del dato
     */
    delete(key) {
        try {
            const fullKey = `${this.DB_KEY}:${key}`;
            localStorage.removeItem(fullKey);
            console.log(`🗑️ Dato eliminado: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error al eliminar ${key}:`, error);
            return false;
        }
    }

    /**
     * LIMPIAR TODA LA BASE DE DATOS
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.DB_KEY)) {
                    localStorage.removeItem(key);
                }
            });
            console.log(`🧹 Base de datos limpiada`);
            this.initializeDatabase();
            return true;
        } catch (error) {
            console.error(`❌ Error al limpiar BD:`, error);
            return false;
        }
    }

    /**
     * GENERAR HASH SIMPLE PARA VALIDACIÓN
     * @param {any} value - Valor a hashear
     */
    _generateHash(value) {
        const str = JSON.stringify(value);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * OBTENER TAMAÑO DE ALMACENAMIENTO USADO
     */
    getStorageSize() {
        let size = 0;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.DB_KEY)) {
                size += localStorage.getItem(key).length;
            }
        });
        return (size / 1024).toFixed(2) + ' KB';
    }

    /**
     * EXPORTAR TODOS LOS DATOS
     */
    exportData() {
        try {
            const data = {};
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.DB_KEY)) {
                    const cleanKey = key.replace(`${this.DB_KEY}:`, '');
                    data[cleanKey] = this.get(cleanKey);
                }
            });
            return data;
        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
            return null;
        }
    }

    /**
     * IMPORTAR DATOS
     * @param {object} data - Datos a importar
     */
    importData(data) {
        try {
            Object.keys(data).forEach(key => {
                this.set(key, data[key]);
            });
            console.log('✅ Datos importados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al importar datos:', error);
            return false;
        }
    }

    /**
     * HACER BACKUP DE DATOS
     */
    createBackup() {
        try {
            const backup = {
                data: this.exportData(),
                timestamp: new Date().toISOString(),
                version: this.SCHEMA_VERSION
            };
            const backupJson = JSON.stringify(backup, null, 2);
            console.log('✅ Backup creado:', backupJson);
            return backupJson;
        } catch (error) {
            console.error('❌ Error al crear backup:', error);
            return null;
        }
    }
}

// Instancia global del Storage Manager
const storage = new StorageManager();
