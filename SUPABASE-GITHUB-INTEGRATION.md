# 🚀 Configuración Supabase - GitHub Integration

## 📋 **Pasos para Configurar Supabase + GitHub**

### **1. Configurar Edge Function**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto Supabase (si no existe)
supabase init

# Deployar la función Edge
supabase functions deploy github-sync --project-ref TU_PROJECT_REF
```

### **2. Configurar Variables de Entorno en Supabase**

Ve a tu **Dashboard de Supabase** → **Settings** → **API** y configura:

```bash
# En Supabase Dashboard > Project Settings > API
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)
```

### **3. Obtener URL del Webhook**

Después del deploy, obtendrás una URL como:
```
https://tu-proyecto.supabase.co/functions/v1/github-sync
```

### **4. Configurar Webhook en GitHub**

1. Ve a tu repositorio en GitHub
2. **Settings** → **Webhooks** → **Add webhook**
3. Configurar:
   - **Payload URL**: `https://tu-proyecto.supabase.co/functions/v1/github-sync`
   - **Content type**: `application/json`
   - **Secret**: (opcional, para mayor seguridad)
   - **Events**: Seleccionar "Push events"
   - **Active**: ✅

### **5. Probar la Integración**

1. Hacer un push al repositorio:
```bash
git add .
git commit -m "Probar webhook GitHub → Supabase"
git push origin main
```

2. Verificar en **Supabase Dashboard** → **Logs** que la función se ejecutó
3. Revisar que las cartas se sincronizaron en las tablas

---

## 🔧 **Comandos Útiles**

### **Ver logs de Edge Functions**
```bash
supabase functions logs github-sync --project-ref TU_PROJECT_REF
```

### **Probar función localmente**
```bash
supabase functions serve github-sync --env-file .env
```

### **Actualizar función**
```bash
supabase functions deploy github-sync --project-ref TU_PROJECT_REF
```

---

## 🎯 **Flujo Completo**

```
GitHub Push → Webhook → Supabase Edge Function → Sincronizar BD → Tiempo Real
```

1. **Usuario hace push** a `main` branch
2. **GitHub dispara webhook** a Supabase
3. **Edge Function descarga** `data/cartas.json` actualizado
4. **Sincroniza cambios** en tablas `cartas` y `respuestas`
5. **Supabase Real-time** notifica a clientes conectados
6. **Frontend actualiza** automáticamente sin refresh

---

## ⚡ **Beneficios**

- ✅ **Sincronización automática** en cada push
- ✅ **Datos siempre actualizados** en producción
- ✅ **Zero downtime** - sin necesidad de deploy manual
- ✅ **Backup automático** en GitHub + Supabase
- ✅ **Escalable** - funciona con cualquier tamaño de repo

---

## 🚨 **Troubleshooting**

### **Error: Webhook no se ejecuta**
```bash
# Verificar logs en GitHub
Repositorio → Settings → Webhooks → Recent Deliveries

# Verificar logs en Supabase  
Dashboard → Logs → Edge Functions
```

### **Error: Función no desplegada**
```bash
# Re-deployar función
supabase functions deploy github-sync --project-ref TU_PROJECT_REF

# Verificar que existe
supabase functions list --project-ref TU_PROJECT_REF
```

### **Error: Permisos de base de datos**
```sql
-- Verificar políticas RLS en Supabase SQL Editor
SELECT * FROM cartas LIMIT 1;
SELECT * FROM respuestas LIMIT 1;
```

---

## 🎉 **¡Listo!**

Una vez configurado, tu repositorio GitHub estará **completamente sincronizado** con Supabase. 

Cada push automáticamente actualizará la base de datos y todos los usuarios verán los cambios en tiempo real.

**¡Jimena podrá ver las nuevas cartas inmediatamente después de cada push!** 💕