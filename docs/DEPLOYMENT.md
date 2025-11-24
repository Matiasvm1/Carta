# 🚀 Guía de Deployment - Cartas Románticas

## Opciones de Deployment

### 1. GitHub Pages (Recomendado - Gratis)

#### Pasos:
1. **Sube tu proyecto a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sistema de cartas románticas"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/cartas-romanticas.git
   git push -u origin main
   ```

2. **Activa GitHub Pages:**
   - Ve a tu repositorio → Settings
   - Scroll hasta "Pages"
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **Tu sitio estará en:**
   - `https://TU-USUARIO.github.io/cartas-romanticas/public/`
   - Admin: `https://TU-USUARIO.github.io/cartas-romanticas/admin/`

#### Configuración para GitHub Pages:
```json
// En cartas.json, ajusta las rutas:
{
  "configuracion": {
    "baseURL": "https://TU-USUARIO.github.io/cartas-romanticas/"
  }
}
```

### 2. Netlify (Gratis)

#### Deploy desde Git:
1. Conecta tu repo de GitHub a Netlify
2. Build settings:
   - Build command: `echo "Static site ready"`
   - Publish directory: `public`
3. Deploy automático en cada push

#### Deploy con Drag & Drop:
1. Zip la carpeta `public/`
2. Arrastra el zip a netlify.com/drop
3. Listo en segundos

### 3. Vercel (Gratis)

#### Desde GitHub:
1. Importa tu repositorio en vercel.com
2. Framework: Other
3. Root Directory: `public`
4. Deploy automático

#### Configuración vercel.json:
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/admin/index.html"
    }
  ]
}
```

### 4. Firebase Hosting (Gratis)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init hosting

# Configurar:
# - Public directory: public
# - Single-page app: No
# - Overwrite index.html: No

# Deploy
firebase deploy
```

### 5. Servidor Propio (VPS/Shared Hosting)

#### Via FTP/SFTP:
1. Sube todos los archivos al directorio web
2. Mantén la estructura de carpetas
3. Configura permisos de lectura para todos los archivos

#### Via SSH:
```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/cartas-romanticas.git

# Configurar servidor web (Apache/Nginx)
# Apuntar document root a la carpeta 'public'
```

## Post-Deployment

### 1. Configurar Dominio Personalizado
```
# En GitHub Pages → Settings → Pages → Custom domain
misamorosas.com

# En Netlify → Domain settings → Add custom domain
misamorosas.com

# En Vercel → Project → Domains → Add
misamorosas.com
```

### 2. HTTPS Automático
Todas las plataformas mencionadas incluyen HTTPS automático y gratuito.

### 3. Actualizar Configuración
```json
// En data/cartas.json después del deploy:
{
  "configuracion": {
    "cartaActual": "tu-primera-carta",
    "siteName": "Mis Cartas de Amor",
    "password": "CAMBIAR-ESTA-CONTRASEÑA",
    "siteURL": "https://tu-dominio.com"
  }
}
```

## Tips de Optimización

### Performance:
- Las imágenes se convierten a Base64 automáticamente
- Usa imágenes optimizadas (< 500KB recomendado)
- El CSS y JS están minificados para producción

### SEO:
```html
<!-- Agregar en public/index.html -->
<meta name="description" content="Cartas románticas interactivas">
<meta property="og:title" content="Mi Carta Especial">
<meta property="og:description" content="Una carta especial para ti">
<meta property="og:image" content="https://tu-sitio.com/preview.jpg">
```

### Analytics:
```html
<!-- Google Analytics en public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## Troubleshooting

### Problema: Rutas no funcionan
**Solución:** Ajusta las rutas en `letter-engine.js`:
```javascript
// Cambiar de relativas a absolutas
this.dataPath = '/data/cartas.json'; // En lugar de '../data/cartas.json'
```

### Problema: CORS errors en local
**Solución:** Usa un servidor web local:
```bash
npx http-server public/ -p 8000 --cors
```

### Problema: Admin no guarda cambios
**En producción:** Necesitas implementar un backend real o usar:
- Firebase Firestore
- Supabase
- Airtable como backend
- GitHub API para commits automáticos

## Monitoreo

### Uptime Monitoring:
- [UptimeRobot](https://uptimerobot.com/) - Gratis
- [StatusCake](https://www.statuscake.com/) - Gratis

### Error Monitoring:
```javascript
// Agregar en letter-engine.js
window.onerror = function(msg, url, line) {
  console.error('Error:', msg, 'at', url, line);
  // Enviar a servicio de monitoring
};
```

## Backup y Versionado

### Auto-backup de cartas.json:
```javascript
// Función para descargar backup
function downloadBackup() {
  const data = JSON.stringify(currentData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cartas-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
```

---

**¡Tu sistema de cartas románticas está listo para conquistar la web! 💕**