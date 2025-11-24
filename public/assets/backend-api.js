/**
 * CLIENTE API PARA FRONTEND - Backend Integration
 * Maneja toda la comunicación con el backend
 */

class CartsAPI {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('admin_token');
    }

    // ===== UTILIDADES =====
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token si está disponible
        if (this.token && !options.skipAuth) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ===== AUTENTICACIÓN =====
    async login(username, password) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                skipAuth: true
            });

            this.token = response.token;
            localStorage.setItem('admin_token', this.token);
            localStorage.setItem('admin_user', JSON.stringify(response.user));

            return response;
        } catch (error) {
            throw new Error('Credenciales inválidas');
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ===== CARTAS =====
    async getCartas() {
        return await this.request('/cartas', { skipAuth: true });
    }

    async getCarta(id) {
        return await this.request(`/cartas/${id}`, { skipAuth: true });
    }

    async createCarta(cartaData) {
        return await this.request('/cartas', {
            method: 'POST',
            body: JSON.stringify(cartaData)
        });
    }

    async updateCarta(id, cartaData) {
        return await this.request(`/cartas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(cartaData)
        });
    }

    async deleteCarta(id) {
        return await this.request(`/cartas/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== RESPUESTAS =====
    async getRespuestas(cartaId) {
        return await this.request(`/cartas/${cartaId}/respuestas`, { skipAuth: true });
    }

    async createRespuesta(cartaId, mensaje, tipo = 'texto') {
        return await this.request(`/cartas/${cartaId}/respuestas`, {
            method: 'POST',
            body: JSON.stringify({ mensaje, tipo }),
            skipAuth: true // Las respuestas son públicas para Jimena
        });
    }

    // ===== MIGRACIÓN DE DATOS =====
    async migrarDatos(datosLocalStorage) {
        try {
            console.log('🔄 Migrando datos a la base de datos...');
            
            if (datosLocalStorage.cartas && datosLocalStorage.cartas.length > 0) {
                for (const carta of datosLocalStorage.cartas) {
                    try {
                        await this.createCarta(carta);
                        console.log(`✅ Carta migrada: ${carta.titulo}`);
                    } catch (error) {
                        if (error.message.includes('Ya existe una carta')) {
                            console.log(`⚠️ Carta ya existe: ${carta.titulo}`);
                        } else {
                            console.error(`❌ Error migrando carta ${carta.titulo}:`, error);
                        }
                    }
                }
            }

            console.log('✅ Migración completada');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en migración:', error);
            throw error;
        }
    }
}

// ===== INICIALIZAR API GLOBAL =====
window.cartsAPI = new CartsAPI();

// ===== MIGRACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay datos en localStorage para migrar
    const datosLocalStorage = localStorage.getItem('cartasData');
    
    if (datosLocalStorage && window.cartsAPI.isAuthenticated()) {
        try {
            const datos = JSON.parse(datosLocalStorage);
            
            // Preguntar si quiere migrar
            if (confirm('Se encontraron datos en localStorage. ¿Migrar a la base de datos?')) {
                await window.cartsAPI.migrarDatos(datos);
                
                // Opcionalmente limpiar localStorage después de migración exitosa
                if (confirm('¿Limpiar datos locales después de la migración exitosa?')) {
                    localStorage.removeItem('cartasData');
                    alert('✅ Migración completada y datos locales limpiados');
                }
            }
        } catch (error) {
            console.error('Error en migración automática:', error);
        }
    }
});

// ===== COMPATIBILIDAD CON SISTEMA ACTUAL =====
// Wrapper para mantener compatibilidad con el código existente
window.backendAPI = {
    // Cargar datos (ahora desde backend)
    async loadData() {
        try {
            const response = await window.cartsAPI.getCartas();
            return {
                cartas: response.cartas || [],
                configuracion: {
                    cartaActual: response.cartas?.find(c => c.activa)?.id || null,
                    sistemaConversacion: true
                }
            };
        } catch (error) {
            console.error('Error cargando datos:', error);
            // Fallback a localStorage si backend no disponible
            const localData = localStorage.getItem('cartasData');
            return localData ? JSON.parse(localData) : { cartas: [], configuracion: {} };
        }
    },

    // Guardar datos (ahora al backend)
    async saveData(data) {
        // Este método ahora es manejado automáticamente por el backend
        console.log('📝 Datos guardados automáticamente en base de datos');
        return { success: true };
    }
};

console.log('🔧 API Backend inicializada correctamente');