/**
 * 🔧 SCRIPT DE VERIFICACIÓN MANUAL
 * Ejecuta esto en la consola del navegador para diagnosticar problemas
 */

async function verificacionCompleta() {
    console.group('🔧 VERIFICACIÓN COMPLETA DE SUPABASE');
    
    try {
        // 1. Verificar que los scripts estén cargados
        console.log('1. ✅ Scripts disponibles:');
        console.log('   - supabaseClient:', typeof window.supabaseClient);
        console.log('   - cartaService:', typeof window.cartaService);
        console.log('   - respuestaService:', typeof window.respuestaService);
        
        // 2. Verificar configuración
        console.log('\n2. 🔧 Configuración:');
        if (window.supabaseClient) {
            console.log('   - URL:', window.supabaseClient.constructor.name);
            console.log('   - Inicializado:', window.supabaseClient.initialized);
        }
        
        // 3. Intentar inicializar si no está inicializado
        if (window.supabaseClient && !window.supabaseClient.initialized) {
            console.log('\n3. ⏳ Inicializando cliente...');
            await window.supabaseClient.init();
        }
        
        // 4. Probar conexión
        console.log('\n4. 🌐 Probando conexión...');
        if (window.supabaseClient) {
            const success = await window.supabaseClient.testConnection();
            console.log('   - Resultado:', success ? '✅ ÉXITO' : '❌ FALLO');
        }
        
        // 5. Probar consulta básica
        console.log('\n5. 📊 Probando consulta directa...');
        if (window.supabaseClient && window.supabaseClient.initialized) {
            const client = await window.supabaseClient.getClient();
            
            // Consulta muy básica
            const { data, error } = await client
                .from('cartas')
                .select('id, titulo')
                .limit(3);
                
            if (error) {
                console.error('   - ❌ Error:', error);
            } else {
                console.log('   - ✅ Datos obtenidos:', data?.length || 0, 'cartas');
                if (data && data.length > 0) {
                    console.log('   - Primera carta:', data[0]);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
    
    console.groupEnd();
}

// También crear función simple para probar inserción
async function probarCreacionCarta() {
    console.group('📝 PRUEBA DE CREACIÓN DE CARTA');
    
    try {
        if (!window.cartaService) {
            throw new Error('cartaService no disponible');
        }
        
        const cartaPrueba = {
            titulo: 'Carta de Prueba - ' + new Date().toLocaleTimeString(),
            cuerpo: 'Esta es una carta de prueba para verificar que la inserción funciona correctamente.',
            destinatario: 'Jimena',
            remitente: 'Matías (Test)',
            fecha_programada: new Date().toISOString(),
            activa: false, // No activar para que no interfiera
            favorita: false,
            foto_url: null,
            tema_color: 'beige'
        };
        
        console.log('📤 Enviando carta de prueba:', cartaPrueba);
        
        const resultado = await window.cartaService.crearCarta(cartaPrueba);
        
        if (resultado && resultado.id) {
            console.log('✅ ¡Carta creada exitosamente!');
            console.log('   - ID:', resultado.id);
            console.log('   - Título:', resultado.titulo);
            
            // Intentar eliminarla para limpiar
            console.log('🗑️ Eliminando carta de prueba...');
            await window.cartaService.eliminarCarta(resultado.id);
            console.log('✅ Carta de prueba eliminada');
            
        } else {
            console.error('❌ No se recibió respuesta válida:', resultado);
        }
        
    } catch (error) {
        console.error('❌ Error en prueba de creación:', error);
    }
    
    console.groupEnd();
}

console.log('🔧 Funciones de verificación cargadas:');
console.log('   - verificacionCompleta() - Diagnóstico completo');
console.log('   - probarCreacionCarta() - Probar inserción de carta');
console.log('');
console.log('💡 Ejecuta verificacionCompleta() para empezar');