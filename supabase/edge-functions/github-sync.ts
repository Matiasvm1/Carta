// Edge Function para sincronizar con GitHub Repository
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar que es un webhook de GitHub
    const signature = req.headers.get('x-hub-signature-256');
    const githubEvent = req.headers.get('x-github-event');
    
    if (!signature || !githubEvent) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    // Solo procesar push events en la rama main
    if (githubEvent === 'push' && body.ref === 'refs/heads/main') {
      console.log('📡 GitHub Push detectado en main branch');
      
      // Obtener la URL del archivo cartas.json actualizado
      const repoUrl = body.repository.html_url;
      const cartasJsonUrl = `${repoUrl.replace('github.com', 'raw.githubusercontent.com')}/main/data/cartas.json`;
      
      console.log('🔗 Descargando cartas desde:', cartasJsonUrl);
      
      // Descargar el archivo JSON actualizado
      const jsonResponse = await fetch(cartasJsonUrl);
      if (!jsonResponse.ok) {
        throw new Error(`Error descargando JSON: ${jsonResponse.statusText}`);
      }
      
      const cartasData = await jsonResponse.json();
      console.log('📋 Cartas descargadas:', cartasData.cartas?.length || 0);
      
      // Sincronizar cartas con Supabase
      if (cartasData.cartas && Array.isArray(cartasData.cartas)) {
        for (const carta of cartasData.cartas) {
          // Verificar si la carta ya existe
          const { data: existing } = await supabase
            .from('cartas')
            .select('id')
            .eq('id', carta.id)
            .single();
          
          if (existing) {
            // Actualizar carta existente
            const { error } = await supabase
              .from('cartas')
              .update({
                titulo: carta.titulo,
                cuerpo: carta.cuerpo,
                fecha: carta.fecha,
                activa: carta.activa,
                foto: carta.foto,
                updated_at: new Date().toISOString()
              })
              .eq('id', carta.id);
              
            if (error) {
              console.error('❌ Error actualizando carta:', carta.id, error);
            } else {
              console.log('✅ Carta actualizada:', carta.id);
            }
          } else {
            // Insertar nueva carta
            const { error } = await supabase
              .from('cartas')
              .insert({
                id: carta.id,
                titulo: carta.titulo,
                cuerpo: carta.cuerpo,
                fecha: carta.fecha,
                activa: carta.activa,
                foto: carta.foto,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (error) {
              console.error('❌ Error insertando carta:', carta.id, error);
            } else {
              console.log('✅ Nueva carta insertada:', carta.id);
            }
          }
          
          // Sincronizar respuestas si existen
          if (carta.respuestas && Array.isArray(carta.respuestas)) {
            for (const respuesta of carta.respuestas) {
              const { data: existingResp } = await supabase
                .from('respuestas')
                .select('id')
                .eq('id', respuesta.id)
                .single();
                
              if (!existingResp) {
                const { error } = await supabase
                  .from('respuestas')
                  .insert({
                    id: respuesta.id,
                    carta_id: carta.id,
                    autor: respuesta.autor,
                    contenido: respuesta.contenido,
                    fecha: respuesta.fecha,
                    leida: respuesta.estado?.leida || false,
                    created_at: new Date().toISOString()
                  });
                  
                if (error) {
                  console.error('❌ Error insertando respuesta:', respuesta.id, error);
                } else {
                  console.log('✅ Nueva respuesta insertada:', respuesta.id);
                }
              }
            }
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sincronización completada',
          cartasProcessed: cartasData.cartas?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Para otros eventos, solo confirmar recepción
    return new Response(
      JSON.stringify({ message: 'Event received but not processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('❌ Error en GitHub sync:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});