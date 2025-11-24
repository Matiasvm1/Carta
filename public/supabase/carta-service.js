/**
 * 📝 Servicio de Cartas con Supabase
 * CRUD completo para gestión de cartas románticas
 */

class CartaService {
    constructor() {
        this.tableName = 'cartas';
    }

    // 📖 Obtener todas las cartas activas
    async getCartasActivas() {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data, error } = await client
                .from(this.tableName)
                .select('*')
                .eq('activa', true)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            console.log(`✅ ${data.length} cartas activas obtenidas`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error cargando cartas');
            return [];
        }
    }

    // 📖 Obtener todas las cartas (admin)
    async getAllCartas() {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data, error } = await client
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            console.log(`✅ ${data.length} cartas totales obtenidas`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error cargando cartas');
            return [];
        }
    }

    // 📖 Obtener carta por ID
    async getCartaById(id) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data, error } = await client
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            
            console.log(`✅ Carta ${id} obtenida`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error obteniendo carta');
            return null;
        }
    }

    // ✍️ Crear nueva carta
    async crearCarta(cartaData) {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Preparar datos
            const newCarta = {
                titulo: cartaData.titulo,
                destinatario: cartaData.destinatario || 'Jimena',
                cuerpo: cartaData.cuerpo,
                foto: cartaData.foto || null,
                audio: cartaData.audio || null,
                fecha: cartaData.fecha,
                activa: cartaData.activa || false,
                favorita: cartaData.favorita || false
            };
            
            const { data, error } = await client
                .from(this.tableName)
                .insert([newCarta])
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Carta creada:', data.id);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error creando carta');
            return null;
        }
    }

    // ✏️ Actualizar carta existente
    async actualizarCarta(id, updateData) {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Agregar timestamp de actualización
            updateData.updated_at = new Date().toISOString();
            
            const { data, error } = await client
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log('✅ Carta actualizada:', id);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error actualizando carta');
            return null;
        }
    }

    // 🗑️ Eliminar carta
    async eliminarCarta(id) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { error } = await client
                .from(this.tableName)
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            
            console.log('✅ Carta eliminada:', id);
            return true;
        } catch (error) {
            showSupabaseError(error, 'Error eliminando carta');
            return false;
        }
    }

    // ⭐ Marcar/desmarcar como favorita
    async toggleFavorita(id) {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Obtener estado actual
            const carta = await this.getCartaById(id);
            if (!carta) return false;
            
            // Cambiar estado
            const nuevoEstado = !carta.favorita;
            
            const { data, error } = await client
                .from(this.tableName)
                .update({ favorita: nuevoEstado })
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log(`✅ Carta ${nuevoEstado ? 'marcada' : 'desmarcada'} como favorita`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error actualizando favorita');
            return false;
        }
    }

    // 🔄 Activar/desactivar carta
    async toggleActiva(id) {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Obtener estado actual
            const carta = await this.getCartaById(id);
            if (!carta) return false;
            
            // Cambiar estado
            const nuevoEstado = !carta.activa;
            
            const { data, error } = await client
                .from(this.tableName)
                .update({ activa: nuevoEstado })
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            
            console.log(`✅ Carta ${nuevoEstado ? 'activada' : 'desactivada'}`);
            return data;
        } catch (error) {
            showSupabaseError(error, 'Error cambiando estado de carta');
            return false;
        }
    }

    // 📊 Obtener estadísticas
    async getEstadisticas() {
        try {
            const client = await window.supabaseClient.getClient();
            
            const [totalResult, activasResult, favoritasResult] = await Promise.all([
                client.from(this.tableName).select('id', { count: 'exact', head: true }),
                client.from(this.tableName).select('id', { count: 'exact', head: true }).eq('activa', true),
                client.from(this.tableName).select('id', { count: 'exact', head: true }).eq('favorita', true)
            ]);
            
            return {
                total: totalResult.count || 0,
                activas: activasResult.count || 0,
                favoritas: favoritasResult.count || 0
            };
        } catch (error) {
            showSupabaseError(error, 'Error obteniendo estadísticas');
            return { total: 0, activas: 0, favoritas: 0 };
        }
    }

    // 🔄 Configurar actualizaciones en tiempo real
    async setupRealtimeCartas(callback) {
        return await window.supabaseClient.setupRealtime(this.tableName, (payload) => {
            console.log('📡 Cambio en cartas:', payload);
            callback(payload);
        });
    }
}

// Instancia global del servicio
window.cartaService = new CartaService();