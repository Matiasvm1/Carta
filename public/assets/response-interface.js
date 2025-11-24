/**
 * RESPONSE INTERFACE MANAGER
 * Maneja la interfaz de respuestas de Jimena con elegancia
 */

class ResponseInterface {
    constructor(conversationEngine) {
        this.engine = conversationEngine;
        this.isOpen = false;
        this.currentLetter = null;
        this.draftText = '';
        
        this.init();
    }

    init() {
        this.createInterface();
        this.setupEventListeners();
        this.setupAutoSave();
        
        // Mostrar botón para cualquier usuario que no esté en admin
        // (asumimos que si no es admin, es Jimena)
        const isAdmin = window.location.pathname.includes('/admin/') || sessionStorage.getItem('adminPassword');
        
        if (!isAdmin) {
            console.log('Detectado como Jimena - Activando botón de respuesta');
            this.showResponseTrigger();
        } else {
            console.log('Detectado como Matias - Sin botón de respuesta');
        }
    }

    createInterface() {
        // Crear botón flotante
        this.createTriggerButton();
        
        // Crear interfaz completa
        this.createResponsePanel();
    }

    createTriggerButton() {
        this.triggerButton = document.createElement('button');
        this.triggerButton.className = 'response-trigger';
        this.triggerButton.innerHTML = '♡';
        this.triggerButton.title = 'Responder carta';
        
        document.body.appendChild(this.triggerButton);
    }

    createResponsePanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'response-interface';
        this.panel.innerHTML = this.getResponseHTML();
        
        document.body.appendChild(this.panel);
        
        // Referencias a elementos
        this.textarea = this.panel.querySelector('.response-textarea');
        this.sendButton = this.panel.querySelector('.response-send');
        this.closeButton = this.panel.querySelector('.response-close');
        this.statusIndicator = this.panel.querySelector('.response-status');
        this.quickButtons = this.panel.querySelectorAll('.quick-response-btn');
    }

    getResponseHTML() {
        const quickResponses = this.engine.currentUser?.configuracion?.respuestasRapidas || [
            "Me encanta",
            "Esto es hermoso", 
            "Gracias mi amor",
            "Perfecto",
            "♡ Te amo",
            "Me haces feliz"
        ];

        return `
            <div class="response-header">
                <h3 class="response-title">
                    <span class="response-icon"></span>
                    Responder a Matias
                </h3>
                <button class="response-close" title="Cerrar">✕</button>
                <div class="response-status"></div>
            </div>
            <div class="response-content">
                <div class="quick-responses">
                    <div class="quick-responses-label">
                        <span>⚡</span>
                        Respuestas rápidas
                    </div>
                    <div class="quick-responses-grid">
                        ${quickResponses.map(response => `
                            <button class="quick-response-btn" data-response="${response}">
                                ${response}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="custom-response-section">
                    <div class="custom-response-label">
                        <span></span>
                        Mensajito para Matu
                    </div>
                    <textarea 
                        class="response-textarea" 
                        placeholder="Solo por si tenes ganas bebita"
                        maxlength="1000"
                    ></textarea>
                    
                    <div class="typing-indicator">
                        <span>Escribiendo</span>
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                    
                    <div class="response-controls">
                        <div class="response-info">
                            <span class="char-count">0/1000 caracteres</span>
                        </div>
                        <div class="response-actions">
                            <button class="response-draft">Guardar</button>
                            <button class="response-send" disabled>
                                <span></span>
                                Enviar con amor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Botón flotante
        this.triggerButton.addEventListener('click', () => {
            this.toggle();
        });

        // Cerrar panel
        this.closeButton.addEventListener('click', () => {
            this.close();
        });

        // Respuestas rápidas
        this.quickButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectQuickResponse(button.dataset.response);
            });
        });

        // Área de texto
        this.textarea.addEventListener('input', () => {
            this.handleTextInput();
        });

        this.textarea.addEventListener('focus', () => {
            this.showTypingIndicator();
        });

        this.textarea.addEventListener('blur', () => {
            this.hideTypingIndicator();
        });

        // Enviar respuesta
        this.sendButton.addEventListener('click', () => {
            this.sendResponse();
        });

        // Guardar borrador
        this.panel.querySelector('.response-draft').addEventListener('click', () => {
            this.saveDraft();
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Enviar con Ctrl+Enter
        this.textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.sendButton.disabled) {
                    this.sendResponse();
                }
            }
        });
    }

    setupAutoSave() {
        // Auto-guardar borrador cada 30 segundos
        setInterval(() => {
            if (this.textarea.value.trim() && this.textarea.value !== this.draftText) {
                this.saveDraft(true); // Silencioso
            }
        }, 30000);
    }

    showResponseTrigger() {
        // Mostrar inmediatamente sin demora
        setTimeout(() => {
            this.triggerButton.classList.add('visible');
            console.log('Botón de respuesta activado para Jimena');
        }, 500); // Reducido de 1000ms a 500ms para que aparezca más rápido
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        this.triggerButton.classList.add('active');
        
        // Cargar borrador si existe
        this.loadDraft();
        
        // Enfocar textarea después de la animación
        setTimeout(() => {
            this.textarea.focus();
        }, 300);

        // Analítica simple
        console.log('📊 Interfaz de respuesta abierta');
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        this.triggerButton.classList.remove('active');
        
        // Auto-guardar al cerrar
        if (this.textarea.value.trim()) {
            this.saveDraft(true);
        }
    }

    selectQuickResponse(response) {
        // Animación visual
        const button = this.panel.querySelector(`[data-response="${response}"]`);
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        // Agregar al textarea
        const currentText = this.textarea.value;
        const newText = currentText ? `${currentText}\n\n${response}` : response;
        
        this.textarea.value = newText;
        this.handleTextInput();
        
        // Enfocar y posicionar cursor al final
        this.textarea.focus();
        this.textarea.setSelectionRange(newText.length, newText.length);

        // Efecto visual
        this.showTemporaryEffect('Respuesta agregada ✨');
    }

    handleTextInput() {
        const text = this.textarea.value;
        const charCount = text.length;
        
        // Actualizar contador
        const counter = this.panel.querySelector('.char-count');
        counter.textContent = `${charCount}/1000 caracteres`;
        
        // Habilitar/deshabilitar botón de envío
        this.sendButton.disabled = text.trim().length === 0;
        
        // Cambiar color del contador cerca del límite
        if (charCount > 900) {
            counter.style.color = '#ffc107';
        } else if (charCount > 950) {
            counter.style.color = '#dc3545';
        } else {
            counter.style.color = '';
        }
    }

    showTypingIndicator() {
        const indicator = this.panel.querySelector('.typing-indicator');
        indicator.classList.add('active');
    }

    hideTypingIndicator() {
        const indicator = this.panel.querySelector('.typing-indicator');
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1000);
    }

    async sendResponse() {
        const text = this.textarea.value.trim();
        if (!text) return;

        // Deshabilitar botón y mostrar estado
        this.sendButton.disabled = true;
        this.showStatus('sending', 'Enviando...');

        try {
            // Obtener ID de la carta actual
            const currentLetterId = this.getCurrentLetterId();
            
            // Enviar respuesta a través del engine
            const response = await this.engine.sendResponse(currentLetterId, text, 'texto');
            
            if (response) {
                this.showStatus('sent', '¡Enviado! 💕');
                
                // Limpiar y cerrar
                this.textarea.value = '';
                this.clearDraft();
                
                // Mostrar notificación de éxito
                this.showSuccessNotification();
                
                // Cerrar después de un momento
                setTimeout(() => {
                    this.close();
                }, 2000);
                
            } else {
                throw new Error('No se pudo enviar la respuesta');
            }
            
        } catch (error) {
            console.error('Error enviando respuesta:', error);
            this.showStatus('error', 'Error al enviar');
            
            // Re-habilitar botón
            setTimeout(() => {
                this.sendButton.disabled = false;
            }, 2000);
        }
    }

    getCurrentLetterId() {
        // Obtener ID de la carta actual desde la configuración o URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('carta') || 
               this.engine.conversations?.[0]?.id || 
               'carta-jime-2025';
    }

    showStatus(type, message) {
        this.statusIndicator.textContent = message;
        this.statusIndicator.className = `response-status visible ${type}`;
        
        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            this.statusIndicator.classList.remove('visible');
        }, 3000);
    }

    showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="success-icon"></div>
                <div class="success-text">
                    <h4>¡Respuesta enviada!</h4>
                    <p>Gracias bebita mia!</p>
                </div>
            </div>
        `;
        
        // Estilos inline para la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.95), rgba(34, 139, 58, 0.95))',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(40, 167, 69, 0.3)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
        });
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 500);
        }, 4000);
    }

    saveDraft(silent = false) {
        const text = this.textarea.value.trim();
        if (text) {
            localStorage.setItem('response_draft', text);
            this.draftText = text;
            
            if (!silent) {
                this.showTemporaryEffect('Borrador guardado 💾');
            }
        }
    }

    loadDraft() {
        const draft = localStorage.getItem('response_draft');
        if (draft) {
            this.textarea.value = draft;
            this.draftText = draft;
            this.handleTextInput();
        }
    }

    clearDraft() {
        localStorage.removeItem('response_draft');
        this.draftText = '';
    }

    showTemporaryEffect(message) {
        const effect = document.createElement('div');
        effect.textContent = message;
        effect.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(212, 175, 55, 0.9);
            color: #2c2c2c;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10001;
            backdrop-filter: blur(10px);
            animation: fadeInOut 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentElement) {
                effect.remove();
            }
        }, 2000);
    }
}

// CSS para animaciones adicionales
const additionalStyles = `
    @keyframes fadeInOut {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        20%, 80% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
    
    .success-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .success-notification .success-icon {
        font-size: 2rem;
        animation: pulse 2s infinite;
    }
    
    .success-notification h4 {
        margin: 0 0 5px 0;
        font-size: 1.1rem;
    }
    
    .success-notification p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicialización automática cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar inmediatamente, sin esperar el conversation engine
    const mockEngine = {
        currentUser: {
            id: 'jimena',
            nombre: 'Jimena',
            rol: 'lectora',
            permisos: ['read', 'respond'],
            configuracion: {
                "respuestasRapidas": [
                    "♡ Me encanta",
                    "Esto es hermoso", 
                    "Gracias mi amor",
                    "Perfecto",
                    "Te amo",
                    "Me haces feliz"
                ]
            }
        },
        sendResponse: async function(conversationId, content, type) {
            // Simulación de envío de respuesta
            const response = {
                id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                autor: 'jimena',
                contenido: content,
                fecha: new Date().toISOString(),
                estado: { enviada: true, entregada: true, leida: false }
            };
            
            // Guardar en localStorage
            const localData = JSON.parse(localStorage.getItem('cartas_local_data') || '{}');
            if (!localData.cartas) localData.cartas = [];
            
            // Buscar la carta y agregar respuesta
            let carta = localData.cartas.find(c => c.id === conversationId);
            if (!carta) {
                // Crear carta básica si no existe
                carta = {
                    id: conversationId,
                    titulo: 'Carta de Matias',
                    autor: 'matias',
                    destinatario: 'jimena',
                    respuestas: []
                };
                localData.cartas.push(carta);
            }
            
            if (!carta.respuestas) carta.respuestas = [];
            carta.respuestas.push(response);
            
            // Guardar en localStorage
            localStorage.setItem('cartas_local_data', JSON.stringify(localData));
            
            // Mostrar JSON actualizado para copy/paste
            console.group('💌 Nueva respuesta de Jimena');
            console.log('Conversación ID:', conversationId);
            console.log('Respuesta:', response);
            console.log('\nJSON actualizado para data/cartas.json:');
            console.log(JSON.stringify(localData, null, 2));
            console.groupEnd();
            
            return response;
        }
    };
    
    window.responseInterface = new ResponseInterface(mockEngine);
    
    console.log('🎉 Sistema de respuestas inicializado para Jimena');
});

// Cuando el conversation engine esté listo, actualizarlo
window.addEventListener('conversationEngineReady', () => {
    if (window.conversationEngine && window.responseInterface) {
        window.responseInterface.engine = window.conversationEngine;
        console.log('🔄 Engine actualizado con datos reales');
    }
});