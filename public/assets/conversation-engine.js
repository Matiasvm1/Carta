/**
 * CONVERSATIONAL ENGINE 2.0 - Sistema bidireccional premium
 * Arquitectura modular para conversaciones románticas
 */

class ConversationEngine {
    constructor() {
        this.currentUser = null;
        this.dataPath = '../data/cartas.json';
        this.syncInterval = null;
        this.lastSync = null;
        this.isOffline = false;
        
        // Estado de la conversación
        this.activeConversation = null;
        this.conversations = []; // Inicializar conversations array
        this.unreadMessages = [];
        
        // Sistema de persistencia híbrido
        this.storage = new ConversationStorage();
        
        this.init();
    }

    async init() {
        await this.detectUserContext();
        
        // Emitir evento inmediatamente para que la interfaz se active
        window.dispatchEvent(new CustomEvent('conversationEngineReady', {
            detail: { user: this.currentUser }
        }));
        
        await this.loadConversations();
        this.setupRealtimeSync();
        this.setupOfflineMode();
    }

    /**
     * Detecta automáticamente si es Matias (admin) o Jimena (reader)
     */
    async detectUserContext() {
        const urlParams = new URLSearchParams(window.location.search);
        const isAdmin = window.location.pathname.includes('/admin/');
        const hasAdminSession = sessionStorage.getItem('adminPassword');
        const isTestPage = window.location.pathname.includes('test-comentarios.html');
        
        if (isAdmin || hasAdminSession) {
            this.currentUser = {
                id: 'matias',
                nombre: 'Matias',
                rol: 'escritor',
                permisos: ['write', 'read', 'admin']
            };
        } else if (isTestPage) {
            this.currentUser = {
                id: 'test',
                nombre: 'Test User',
                rol: 'tester',
                permisos: ['read', 'respond', 'test']
            };
        } else {
            this.currentUser = {
                id: 'jimena',
                nombre: 'Jimena',
                rol: 'lectora',
                permisos: ['read', 'respond']
            };
        }
        
        console.log(`Usuario detectado: ${this.currentUser.nombre} (${this.currentUser.rol})`);
    }

    /**
     * Cargar conversaciones con sistema de caché inteligente
     */
    async loadConversations() {
        try {
            // Intentar cargar desde Supabase primero
            if (await this.trySupabaseConnection()) {
                // Durante la inicialización, solo cargar las cartas
                // Las respuestas se cargarán por carta específica cuando sea necesario
                console.log('📚 Cargando cartas desde Supabase...');
                const cartas = await window.cartaService.getAllCartas();
                
                if (cartas && cartas.length > 0) {
                    const formattedData = {
                        cartas: cartas,
                        respuestas: []
                    };
                    this.processConversationData(formattedData);
                } else {
                    this.conversations = [];
                    this.triggerUIUpdate();
                }
                return;
            }

            // Fallback: Intentar cargar desde caché local
            const cachedData = this.storage.getCached();
            if (cachedData && !this.isDataStale(cachedData.timestamp)) {
                this.processConversationData(cachedData.data);
                return;
            }

            // Fallback: Cargar desde servidor JSON
            const response = await fetch(this.dataPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.processConversationData(data);
            
            // Guardar en caché
            this.storage.setCache(data);
            this.lastSync = Date.now();
            
        } catch (error) {
            console.warn('Error cargando conversaciones:', error);
            this.handleOfflineMode();
        }
    }

    processConversationData(data) {
        try {
            this.conversations = this.buildConversationThreads(data) || [];
            this.updateUnreadCount();
            this.triggerUIUpdate();
        } catch (error) {
            console.error('Error procesando datos de conversación:', error);
            this.conversations = [];
            this.unreadMessages = [];
            this.triggerUIUpdate();
        }
    }

    /**
     * Procesar datos de conversaciones desde Supabase
     */
    processSupabaseConversationData(supabaseData) {
        try {
            // Verificar que supabaseData sea válido
            if (!supabaseData || !Array.isArray(supabaseData)) {
                console.log('⚠️ Datos de Supabase inválidos, usando datos vacíos');
                supabaseData = [];
            }
            
            // Convertir formato Supabase al formato interno
            const formattedData = {
                cartas: [], // Se llenará cuando se carguen las cartas
                respuestas: supabaseData.map(response => ({
                    id: response.id,
                    carta_id: response.carta_id,
                    contenido: response.mensaje || response.contenido, // Mapear mensaje a contenido
                    fecha: response.fecha,
                    leida: response.leido || false,
                    autor: response.autor || 'Anónimo'
                }))
            };

            this.conversations = this.buildConversationThreads(formattedData) || [];
            this.updateUnreadCount();
            this.triggerUIUpdate();

            // Guardar en caché local como respaldo
            this.storage.setCache(formattedData);
        } catch (error) {
            console.error('Error procesando datos de Supabase:', error);
            this.handleOfflineMode();
        }
    }

    /**
     * Construye hilos de conversación inteligentes
     */
    buildConversationThreads(data) {
        const threads = [];
        
        // Procesar cartas como conversaciones iniciales
        data.cartas?.forEach(carta => {
            const thread = {
                id: carta.id,
                tipo: 'carta',
                iniciador: carta.autor || 'matias',
                participantes: ['matias', 'jimena'],
                titulo: carta.titulo,
                fechaInicio: carta.fechaCreacion || carta.fecha,
                ultimaActividad: this.getLastActivity(carta),
                mensajes: [
                    {
                        id: `${carta.id}-original`,
                        autor: carta.autor || 'matias',
                        tipo: 'carta',
                        contenido: carta.cuerpo,
                        fecha: carta.fechaCreacion || carta.fecha,
                        multimedia: {
                            foto: carta.foto,
                            audio: carta.audio
                        },
                        estado: {
                            enviado: true,
                            entregado: true,
                            leido: carta.leida || false,
                            fechaLectura: carta.fechaLectura
                        }
                    }
                ],
                respuestas: carta.respuestas || [],
                activa: carta.activa,
                configuracion: {
                    puedeResponder: this.canUserRespond(),
                    tipoRespuesta: 'texto' // texto, emoji, audio
                }
            };
            
            // Agregar respuestas existentes
            if (carta.respuestas?.length) {
                carta.respuestas.forEach(respuesta => {
                    thread.mensajes.push({
                        id: respuesta.id,
                        autor: 'jimena',
                        tipo: 'respuesta',
                        contenido: respuesta.contenido,
                        fecha: respuesta.fecha,
                        estado: {
                            enviado: true,
                            entregado: true,
                            leido: respuesta.leida || false
                        }
                    });
                });
            }
            
            threads.push(thread);
        });
        
        return threads.sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));
    }

    getLastActivity(carta) {
        if (carta.respuestas?.length) {
            return carta.respuestas[carta.respuestas.length - 1].fecha;
        }
        return carta.fechaCreacion || carta.fecha;
    }

    canUserRespond() {
        return this.currentUser.permisos.includes('respond') || this.currentUser.permisos.includes('write');
    }

    isDataStale(timestamp) {
        if (!timestamp) return true;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutos
        return (now - timestamp) > fiveMinutes;
    }

    /**
     * Cargar respuestas para una carta específica
     */
    async loadResponsesForCarta(cartaId) {
        try {
            if (await this.trySupabaseConnection()) {
                console.log(`📨 Cargando respuestas para carta ${cartaId}...`);
                const respuestas = await window.respuestaService.obtenerRespuestasPorCarta(cartaId);
                
                // Encontrar la conversación y actualizar sus respuestas
                const conversation = this.conversations.find(c => c.id === cartaId);
                if (conversation && respuestas) {
                    // Agregar respuestas a la conversación
                    respuestas.forEach(respuesta => {
                        const mensajeExistente = conversation.mensajes.find(m => m.id === respuesta.id);
                        if (!mensajeExistente) {
                            conversation.mensajes.push({
                                id: respuesta.id,
                                autor: 'jimena',
                                tipo: 'respuesta',
                                contenido: respuesta.mensaje || respuesta.contenido,
                                fecha: respuesta.created_at || respuesta.fecha,
                                estado: {
                                    enviado: true,
                                    entregado: true,
                                    leido: respuesta.leido || false
                                }
                            });
                        }
                    });
                    
                    this.triggerUIUpdate();
                }
                
                return respuestas;
            }
        } catch (error) {
            console.error('Error cargando respuestas para carta:', error);
            return [];
        }
    }

    /**
     * Enviar respuesta - Sistema híbrido con fallback
     */
    async sendResponse(conversationId, content, type = 'texto') {
        console.log(`📤 Enviando respuesta - ID: ${conversationId}, Contenido: ${content.substring(0, 50)}...`);
        
        const response = {
            id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            autor: this.currentUser.id,
            tipo: 'respuesta',
            contenido: content,
            fecha: new Date().toISOString(),
            estado: {
                enviado: true,
                entregado: false,
                leido: false
            }
        };

        try {
            // Optimistic update - mostrar inmediatamente
            this.addMessageToConversation(conversationId, response);
            this.triggerUIUpdate();

            // Intentar persistir
            await this.persistResponse(conversationId, response);
            
            // Marcar como entregado
            response.estado.entregado = true;
            this.triggerUIUpdate();

            console.log('✅ Respuesta enviada exitosamente:', response.id);
            return response;
            
        } catch (error) {
            console.error('❌ Error enviando respuesta:', error);
            // Marcar como pendiente para reintento
            response.estado.pendiente = true;
            response.estado.error = error.message;
            throw error;
        }
    }

    /**
     * Persistencia híbrida - Supabase + localStorage + fallback
     */
    async persistResponse(conversationId, response) {
        try {
            // 🚀 1. INTENTAR SUPABASE PRIMERO
            if (window.respuestaService && await this.trySupabaseConnection()) {
                const supabaseResponse = await window.respuestaService.crearRespuesta({
                    carta_id: conversationId,
                    mensaje: response.contenido, // Enviar como 'mensaje' que es lo que espera el servicio
                    autor: response.autor || this.currentUser?.nombre || 'Jimena'
                });
                
                if (supabaseResponse) {
                    console.log('✅ Respuesta guardada en Supabase:', supabaseResponse.id);
                    this.showPersistenceNotification('✅ Respuesta guardada permanentemente');
                    return;
                }
            }
            
            // 💾 2. FALLBACK A LOCALSTORAGE
            this.storage.addResponse(conversationId, response);
            
            // 3. Log para desarrollo
            const updatedData = this.storage.getFullData();
            console.group('📝 Nueva respuesta (localStorage)');
            console.log('Conversation ID:', conversationId);
            console.log('Response:', response);
            console.groupEnd();
            
            // 4. Notificación de guardado local
            this.showPersistenceNotification('💾 Respuesta guardada localmente');
            
        } catch (error) {
            console.error('❌ Error persistiendo respuesta:', error);
            // Fallback final a localStorage
            this.storage.addResponse(conversationId, response);
            this.showPersistenceNotification('⚠️ Respuesta guardada localmente (error en servidor)');
        }
        
        return true;
    }

    // 🔗 Probar conexión a Supabase
    async trySupabaseConnection() {
        try {
            if (window.supabaseClient) {
                return await window.supabaseClient.testConnection();
            }
            return false;
        } catch (error) {
            console.log('Supabase no disponible en conversation-engine:', error);
            return false;
        }
    }

    showPersistenceNotification(message) {
        // Mostrar notificación simple
        if (typeof showMessage === 'function') {
            showMessage(message, 'success');
        } else {
            console.log(message);
        }
    }

    setupOfflineMode() {
        // Configurar modo offline para cuando no hay conexión
        console.log('📴 Configurando modo offline...');
        
        // Detectar cambios de conectividad
        window.addEventListener('online', () => {
            console.log('🌐 Conexión restaurada');
            this.isOffline = false;
            this.syncConversations();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Sin conexión - modo offline activado');
            this.isOffline = true;
        });
    }

    showPersistenceNotificationOld(data) {
        const notification = document.createElement('div');
        notification.className = 'persistence-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>💾 Nueva respuesta guardada</h3>
                <p>Los datos han sido actualizados localmente. Para sincronizar:</p>
                <div class="notification-actions">
                    <button onclick="window.downloadUpdatedJSON()" class="btn-download">
                        📥 Descargar JSON actualizado
                    </button>
                    <button onclick="window.copyUpdatedJSON()" class="btn-copy">
                        📋 Copiar al portapapeles
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-close">
                        ✕ Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove después de 15 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
        
        // Funciones globales para los botones
        window.downloadUpdatedJSON = () => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cartas-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
        
        window.copyUpdatedJSON = () => {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            alert('JSON copiado al portapapeles. Pégalo en data/cartas.json');
        };
    }

    addMessageToConversation(conversationId, message) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.mensajes.push(message);
            conversation.ultimaActividad = message.fecha;
        }
    }

    /**
     * Sistema de sincronización en tiempo real (polling inteligente)
     */
    setupRealtimeSync() {
        // Polling más frecuente para Jimena, menos frecuente para Matias
        const interval = this.currentUser.rol === 'lectora' ? 30000 : 60000; // 30s vs 1min
        
        this.syncInterval = setInterval(() => {
            this.syncConversations();
        }, interval);
    }

    async syncConversations() {
        try {
            const response = await fetch(this.dataPath + '?t=' + Date.now());
            const serverData = await response.json();
            
            // Comparar timestamps y actualizar si hay cambios
            const serverTimestamp = serverData.sistema?.ultimaActualizacion;
            if (serverTimestamp && serverTimestamp !== this.lastSync) {
                this.processConversationData(serverData);
                this.showSyncNotification('Nuevos mensajes sincronizados');
            }
            
        } catch (error) {
            console.warn('Sync failed:', error);
        }
    }

    updateUnreadCount() {
        // Actualizar conteo de mensajes no leídos
        this.unreadMessages = [];
        
        if (this.conversations) {
            this.conversations.forEach(conversation => {
                if (conversation.mensajes) {
                    const unread = conversation.mensajes.filter(msg => 
                        !msg.estado?.leido && msg.autor !== this.currentUser.id
                    );
                    this.unreadMessages.push(...unread);
                }
            });
        }
        
        console.log(`📫 ${this.unreadMessages.length} mensajes sin leer`);
    }

    handleOfflineMode() {
        console.log('📴 Modo offline activado - usando datos en caché');
        this.isOffline = true;
        
        // Cargar datos desde localStorage como fallback
        const cachedData = this.storage.getCached();
        if (cachedData) {
            this.processConversationData(cachedData.data);
        } else {
            // Datos por defecto si no hay caché
            this.conversations = [];
            this.triggerUIUpdate();
        }
    }

    triggerUIUpdate() {
        // Emitir evento customizado para que la UI se actualice
        window.dispatchEvent(new CustomEvent('conversationsUpdated', {
            detail: {
                conversations: this.conversations,
                user: this.currentUser,
                unreadCount: this.unreadMessages.length
            }
        }));
    }
}

/**
 * Sistema de almacenamiento híbrido
 */
class ConversationStorage {
    constructor() {
        this.cacheKey = 'cartas_conversations_cache';
        this.dataKey = 'cartas_local_data';
    }

    getCached() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Error reading cache:', error);
            return null;
        }
    }

    setCache(data) {
        try {
            const cacheEntry = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheEntry));
        } catch (error) {
            console.warn('Error setting cache:', error);
        }
    }

    addResponse(conversationId, response) {
        try {
            let localData = this.getLocalData();
            
            // Encontrar la carta y agregar la respuesta
            const carta = localData.cartas.find(c => c.id === conversationId);
            if (carta) {
                if (!carta.respuestas) carta.respuestas = [];
                carta.respuestas.push(response);
                
                // Actualizar timestamp
                if (!localData.sistema) localData.sistema = {};
                localData.sistema.ultimaActualizacion = new Date().toISOString();
                
                this.setLocalData(localData);
            }
            
        } catch (error) {
            console.error('Error adding response:', error);
        }
    }

    getLocalData() {
        try {
            const data = localStorage.getItem(this.dataKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            return this.getDefaultData();
        }
    }

    setLocalData(data) {
        try {
            localStorage.setItem(this.dataKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving local data:', error);
        }
    }

    getFullData() {
        return this.getLocalData();
    }

    getDefaultData() {
        return {
            cartas: [],
            conversaciones: [],
            configuracion: {},
            sistema: {
                version: '2.0.0',
                ultimaActualizacion: new Date().toISOString()
            }
        };
    }
}

// Inicializar globalmente
window.conversationEngine = null;

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🔄 Inicializando ConversationEngine...');
        window.conversationEngine = new ConversationEngine();
        console.log('✅ ConversationEngine inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando ConversationEngine:', error);
        // Inicializar una versión simplificada
        window.conversationEngine = {
            currentUser: null,
            conversations: [],
            sendResponse: async (id, content) => {
                console.log('📤 Fallback: enviando respuesta directamente');
                if (window.respuestaService) {
                    return await window.respuestaService.crearRespuesta({
                        carta_id: id,
                        mensaje: content,
                        autor: 'Jimena'
                    });
                }
                throw new Error('No hay servicio de respuestas disponible');
            }
        };
    }
});

// Exponer API para desarrollo
window.ConversationAPI = ConversationEngine;