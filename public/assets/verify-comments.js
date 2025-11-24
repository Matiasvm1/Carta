/**
 * SCRIPT DE VERIFICACIÓN RÁPIDA - SISTEMA DE COMENTARIOS
 * Este script verifica que todos los componentes estén conectados correctamente
 */

console.log('🔍 VERIFICANDO SISTEMA DE COMENTARIOS...');

// 1. Verificar carga de scripts
const checkScript = (name, obj) => {
    const status = obj ? '✅' : '❌';
    console.log(`${status} ${name}:`, obj ? 'Cargado' : 'No encontrado');
    return !!obj;
};

console.log('\n📦 VERIFICANDO SCRIPTS:');
const scriptsOk = [
    checkScript('supabaseClient', window.supabaseClient),
    checkScript('cartaService', window.cartaService),
    checkScript('respuestaService', window.respuestaService),
    checkScript('conversationEngine', window.conversationEngine),
    checkScript('ResponseInterface', window.ResponseInterface),
    checkScript('responseInterface (instancia)', window.responseInterface)
].every(Boolean);

// 2. Verificar usuario detectado
console.log('\n👤 USUARIO DETECTADO:');
if (window.conversationEngine?.currentUser) {
    const user = window.conversationEngine.currentUser;
    console.log('✅ Usuario:', user.nombre, '(' + user.rol + ')');
    console.log('✅ Permisos:', user.permisos.join(', '));
} else {
    console.log('⚠️ No se detectó usuario (conversation engine puede no estar listo)');
    // Detectar usuario manualmente para la página de test
    if (window.location.pathname.includes('test-comentarios.html')) {
        console.log('📝 Detectado contexto de test - configurando usuario test');
    }
}

// 3. Verificar conexión Supabase
console.log('\n🔗 PROBANDO CONEXIÓN SUPABASE:');
if (window.supabaseClient) {
    window.supabaseClient.testConnection()
        .then(isConnected => {
            const status = isConnected ? '✅' : '❌';
            console.log(`${status} Conexión Supabase:`, isConnected ? 'Exitosa' : 'Fallida');
        })
        .catch(error => {
            console.log('❌ Error conectando Supabase:', error.message);
        });
} else {
    console.log('❌ supabaseClient no disponible');
}

// 4. Verificar cartas disponibles
console.log('\n📝 CARGANDO CARTAS:');
if (window.cartaService) {
    window.cartaService.getAllCartas()
        .then(cartas => {
            console.log(`✅ ${cartas.length} cartas disponibles`);
            if (cartas.length > 0) {
                console.log('📋 Primera carta:', cartas[0].titulo, `(ID: ${cartas[0].id})`);
                
                // 5. Probar creación de respuesta de prueba
                if (window.respuestaService) {
                    console.log('\n💬 PROBANDO CREACIÓN DE RESPUESTA:');
                    const testResponse = {
                        carta_id: cartas[0].id,
                        mensaje: 'Respuesta de prueba - ' + new Date().toLocaleTimeString(),
                        autor: 'Test Script'
                    };
                    
                    window.respuestaService.crearRespuesta(testResponse)
                        .then(respuesta => {
                            console.log('✅ Respuesta creada exitosamente:', respuesta.id);
                            
                            // Verificar que se guardó
                            setTimeout(() => {
                                window.respuestaService.obtenerRespuestasPorCarta(cartas[0].id)
                                    .then(respuestas => {
                                        console.log(`✅ Verificación: ${respuestas.length} respuesta(s) guardadas para carta ${cartas[0].id}`);
                                    })
                                    .catch(e => console.log('❌ Error verificando respuestas:', e.message));
                            }, 500);
                        })
                        .catch(error => {
                            console.log('❌ Error creando respuesta de prueba:', error.message);
                        });
                }
            }
        })
        .catch(error => {
            console.log('❌ Error cargando cartas:', error.message);
        });
} else {
    console.log('❌ cartaService no disponible');
}

// 6. Función para testing manual
window.testComment = (cartaId, mensaje) => {
    console.log('🧪 Enviando comentario de prueba...');
    
    // Intentar usar conversation engine primero
    if (window.conversationEngine && typeof window.conversationEngine.sendResponse === 'function') {
        return window.conversationEngine.sendResponse(cartaId, mensaje, 'texto')
            .then(result => {
                console.log('✅ Comentario enviado vía conversation engine:', result);
                return result;
            })
            .catch(error => {
                console.log('❌ Error con conversation engine:', error);
                throw error;
            });
    }
    
    // Fallback directo a respuestaService
    if (window.respuestaService) {
        console.log('📤 Usando respuestaService directamente...');
        return window.respuestaService.crearRespuesta({
            carta_id: cartaId,
            mensaje: mensaje,
            autor: 'Test User'
        }).then(result => {
            console.log('✅ Comentario enviado directamente:', result);
            return result;
        }).catch(error => {
            console.log('❌ Error enviando directamente:', error);
            throw error;
        });
    }
    
    console.log('❌ No hay servicios disponibles para enviar comentarios');
    return Promise.reject('No hay servicios disponibles');
};

// Resumen final
setTimeout(() => {
    console.log('\n📊 RESUMEN:');
    console.log(scriptsOk ? '✅ Todos los scripts cargados' : '❌ Faltan scripts');
    console.log('\n💡 PARA PROBAR MANUALMENTE:');
    console.log('- Usa testComment(cartaId, "Mi mensaje") en la consola');
    console.log('- O ve a /test-comentarios.html para interfaz visual');
}, 2000);