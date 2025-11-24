/**
 * 🚀 Cliente Supabase para Cartas Románticas
 * Configuración centralizada y funciones base
 */

// ⚠️ CONFIGURAR TUS CREDENCIALES AQUÍ
const SUPABASE_CONFIG = {
    url: 'https://kfxmjdqpnzlbgdmgkykz.supabase.co', // Ejemplo: https://xxx.supabase.co
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeG1qZHFwbnpsYmdkbWdreWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDA3MTcsImV4cCI6MjA3OTU3NjcxN30.ug1xqJy_OIhkmmASgOXd3FdsnIOsARiJRS1ULEivI5w', // Tu clave anon de Supabase
    bucketName: 'cartas-media' // Nombre del bucket para fotos/audio
};

// ✅ Credenciales configuradas correctamente
console.log('🔧 Supabase configurado para:', SUPABASE_CONFIG.url);

class SupabaseClient {
    constructor() {
        // Inicializar Supabase (se carga desde CDN)
        this.supabase = null;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        try {
            // Cargar Supabase desde CDN si no está disponible
            if (typeof window.supabase === 'undefined') {
                await this.loadSupabaseSDK();
            }
            
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            
            this.initialized = true;
            console.log('✅ Supabase conectado correctamente');
            return this.supabase;
        } catch (error) {
            console.error('❌ Error conectando Supabase:', error);
            throw error;
        }
    }

    async loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async getClient() {
        if (!this.initialized) {
            await this.initPromise;
        }
        return this.supabase;
    }

    // Verificar conexión
    async testConnection() {
        try {
            const client = await this.getClient();
            const { data, error } = await client.from('cartas').select('count').limit(1);
            
            if (error) throw error;
            
            console.log('🎯 Conexión Supabase verificada');
            return true;
        } catch (error) {
            console.error('❌ Error de conexión Supabase:', error);
            return false;
        }
    }

    // Configurar notificaciones en tiempo real
    async setupRealtime(table, callback) {
        try {
            const client = await this.getClient();
            
            const subscription = client
                .channel(`realtime-${table}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: table
                }, callback)
                .subscribe();
                
            console.log(`🔄 Realtime activado para tabla: ${table}`);
            return subscription;
        } catch (error) {
            console.error(`❌ Error configurando realtime para ${table}:`, error);
            return null;
        }
    }
}

// Instancia global del cliente
window.supabaseClient = new SupabaseClient();

// Función de utilidad para mostrar errores
function showSupabaseError(error, defaultMessage = 'Error de conexión') {
    console.error('Supabase Error:', error);
    
    // Mostrar mensaje amigable
    const message = error?.message || defaultMessage;
    
    if (typeof showMessage === 'function') {
        showMessage(`🔥 ${message}`, 'error');
    } else {
        alert(`Error: ${message}`);
    }
}