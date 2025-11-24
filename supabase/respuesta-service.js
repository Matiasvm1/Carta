/**
 * 💬 Servicio de Respuestas con Supabase
 * Gestión completa de comentarios y respuestas a cartas
 */

class RespuestaService {
    constructor() {
        this.tableName = 'respuestas';
    }

    // 📖 Obtener respuestas de una carta
    async obtenerRespuestasPorCarta(cartaId) {
        return await this.getRespuestasByCarta(cartaId);
    }

    // 📖 Obtener respuestas de una carta (método interno)
    async getRespuestasByCarta(cartaId) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data, error } = await client
                .from(this.tableName)
                .select('*')
                .eq('carta_id', cartaId)
                .order('created_at', { ascending: true });
                
            if (error) throw error;
            
            console.log(`✅ ${data.length} respuestas obtenidas para carta ${cartaId}`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error cargando respuestas');
            return [];
        }
    }

    // 📖 Obtener todas las respuestas (método alias para admin)
    async obtenerTodasLasRespuestas() {
        return await this.getAllRespuestas();
    }

    // 📖 Obtener todas las respuestas (admin)
    async getAllRespuestas() {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data, error } = await client
                .from(this.tableName)
                .select(`
                    *,
                    cartas (
                        id,
                        titulo,
                        destinatario
                    )
                `)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            console.log(`✅ ${data.length} respuestas totales obtenidas`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error cargando todas las respuestas');
            return [];
        }
    }

    // ✍️ Crear nueva respuesta
    async crearRespuesta(respuestaData) {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Preparar datos
            const newRespuesta = {
                carta_id: respuestaData.carta_id,
                mensaje: respuestaData.contenido || respuestaData.mensaje,
                autor: respuestaData.usuario || respuestaData.autor || 'Jimena',
                leido: false
            };
            
            const { data, error } = await client
                .from(this.tableName)
                .insert([newRespuesta])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Respuesta creada:', data.id);
            
            // Emitir evento para notificaciones
            this.emitirEventoNuevaRespuesta(data);
            
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error creando respuesta');
            return null;
        }
    }

    // 🗑️ Eliminar respuesta (admin)
    async eliminarRespuesta(id) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { error } = await client
                .from(this.tableName)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            console.log('✅ Respuesta eliminada:', id);
            return true;
        } catch (error) {
            showSupabaseError(error, 'Error eliminando respuesta');
            return false;
        }
    }

    // 📊 Contar respuestas por carta
    async contarRespuestasPorCarta(cartaId) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { count, error } = await client
                .from(this.tableName)
                .select('id', { count: 'exact', head: true })
                .eq('carta_id', cartaId);
                
            if (error) throw error;
            
            return count || 0;
        } catch (error) {
            showSupabaseError(error, 'Error contando respuestas');
            return 0;
        }
    }

    // 📊 Obtener estadísticas de respuestas
    async getEstadisticasRespuestas() {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Total de respuestas
            const { count: total } = await client
                .from(this.tableName)
                .select('id', { count: 'exact', head: true });
            
            // Respuestas por tipo
            const { data: porTipo } = await client
                .from(this.tableName)
                .select('tipo')
                .not('tipo', 'is', null);
            
            // Contar por tipo
            const estadisticas = {
                total: total || 0,
                porTipo: {}
            };
            
            if (porTipo) {
                porTipo.forEach(resp => {
                    estadisticas.porTipo[resp.tipo] = (estadisticas.porTipo[resp.tipo] || 0) + 1;
                });
            }
            
            return estadisticas;
        } catch (error) {
            showSupabaseError(error, 'Error obteniendo estadísticas de respuestas');
            return { total: 0, porTipo: {} };
        }
    }

    // 🔄 Configurar actualizaciones en tiempo real
    async setupRealtimeRespuestas(callback, cartaId = null) {
        return await window.supabaseClient.setupRealtime(this.tableName, (payload) => {
            console.log('📡 Cambio en respuestas:', payload);
            
            // Filtrar por carta si se especifica
            if (cartaId && payload.new?.carta_id !== cartaId) {
                return;
            }
            
            callback(payload);
        });
    }

    // 🔔 Emitir evento para nueva respuesta
    emitirEventoNuevaRespuesta(respuesta) {
        // Crear evento personalizado
        const event = new CustomEvent('nuevaRespuesta', {
            detail: {
                respuesta: respuesta,
                timestamp: new Date().toISOString()
            }
        });
        
        window.dispatchEvent(event);
        console.log('📢 Evento nueva respuesta emitido');
    }

    // 💌 Respuestas rápidas predefinidas
    getRespuestasRapidas() {
        return [
            { texto: '😍 ¡Me encanta!', tipo: 'emoji' },
            { texto: '💕 Te amo', tipo: 'emoji' },
            { texto: '🥰 Qué hermoso', tipo: 'emoji' },
            { texto: '😘 Muchos besos', tipo: 'emoji' },
            { texto: '🌹 Eres increíble', tipo: 'emoji' },
            { texto: 'Me hiciste sonreír mucho', tipo: 'texto' },
            { texto: 'Eres el amor de mi vida', tipo: 'texto' },
            { texto: 'Gracias por ser tan romántico', tipo: 'texto' },
            { texto: 'Esta carta es perfecta', tipo: 'texto' },
            { texto: 'No puedo esperar a verte', tipo: 'texto' }
        ];
    }

    // 🎯 Crear respuesta rápida
    async crearRespuestaRapida(cartaId, respuestaRapida, usuario = 'Jimena') {
        return await this.crearRespuesta({
            carta_id: cartaId,
            contenido: respuestaRapida.texto,
            tipo: respuestaRapida.tipo,
            usuario: usuario
        });
    }
}

// Instancia global del servicio
window.respuestaService = new RespuestaService();

// 🔔 Configurar listener para notificaciones de nuevas respuestas
window.addEventListener('nuevaRespuesta', (event) => {
    const { respuesta } = event.detail;
    
    // Mostrar notificación visual si existe la función
    if (typeof showMessage === 'function') {
        showMessage(`💌 Nueva respuesta de ${respuesta.usuario}`, 'success');
    }
    
    // Aquí puedes agregar más lógica de notificación
    console.log('🔔 Nueva respuesta recibida:', respuesta);
});