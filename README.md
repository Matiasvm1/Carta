# 💕 Sistema de Cartas Románticas Dinámico

Un sistema web modular y elegante para crear, gestionar y compartir cartas románticas con efectos visuales avanzados y animaciones cinematográficas.

## ✨ Características

- **🎨 Diseño Cinematográfico**: Efectos 3D, parallax, glassmorphism, y animaciones suaves
- **📝 Gestión Dinámica**: Sistema completo de administración de cartas
- **🔗 URLs Compartibles**: Cada carta tiene su propia URL única
- **📱 Totalmente Responsive**: Optimizado para móvil y escritorio
- **🎵 Experiencia Inmersiva**: Soporte para música de fondo y efectos visuales
- **🛡️ Panel Administrativo**: Interfaz segura para crear, editar y eliminar cartas

## 🚀 Demo Rápido

1. Abre `public/index.html` en tu navegador
2. Ve al panel de administración en `admin/index.html`
3. Contraseña por defecto: `miamor123`

## 📁 Estructura del Proyecto

```
Carta/
├── public/                    # Aplicación principal
│   ├── index.html            # Página principal de cartas
│   └── assets/
│       └── letter-engine.js  # Motor JavaScript
├── data/
│   └── cartas.json           # Base de datos de cartas
├── admin/
│   └── index.html            # Panel de administración
├── ejemplo/                  # Archivos de ejemplo originales
└── README.md                 # Esta documentación
```

## 🛠️ Instalación y Configuración

### Opción 1: Desarrollo Local Simple

1. **Clona o descarga el proyecto**
2. **Abre con Live Server** (recomendado para VS Code)
3. **Navega a** `http://localhost:5500/public/`

### Opción 2: Servidor Web Local

```bash
# Con Python 3
cd Carta/public
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server public/ -p 8000

# Con PHP
php -S localhost:8000 -t public/
```

### Opción 3: GitHub Pages (Recomendado)

1. **Sube tu proyecto a GitHub**
2. **Ve a Settings → Pages**
3. **Selecciona la rama main** y carpeta `/` (root)
4. **Tu sitio estará disponible en**: `https://tu-usuario.github.io/nombre-repo/public/`

## 📝 Cómo Usar

### Crear una Nueva Carta

1. Ve al panel de administración: `admin/index.html`
2. Ingresa la contraseña (por defecto: `miamor123`)
3. Haz clic en "Nueva Carta"
4. Completa el formulario:
   - **ID único**: Identificador para la URL (ej: `carta-navidad-2025`)
   - **Título**: Lo que aparecerá como encabezado
   - **Destinatario**: Para quién es la carta
   - **Contenido**: Tu mensaje romántico (usa `<br><br>` para párrafos)
   - **Foto**: Opcional, se convierte automáticamente a Base64
   - **Fecha**: Para organización

### Ver una Carta

- **URL directa**: `public/index.html?carta=ID_DE_LA_CARTA`
- **Carta por defecto**: `public/index.html` (usa la configurada como predeterminada)

### Compartir Cartas

Las URLs son completamente compartibles:
- `https://tu-sitio.com/public/index.html?carta=mi-carta-especial`
- Cada carta mantiene todos los efectos visuales y animaciones

## ⚙️ Configuración Avanzada

### Cambiar Contraseña de Administrador

1. Ve al panel de administración
2. Pestaña "Configuración"
3. Ingresa la nueva contraseña
4. Guarda los cambios

### Configurar Carta por Defecto

1. En "Configuración" → "Carta por Defecto"
2. Selecciona la carta que aparecerá cuando se visite la URL sin parámetros

### Agregar Música de Fondo

En el archivo `data/cartas.json`, agrega la propiedad `audio`:

```json
{
  "id": "mi-carta",
  "titulo": "Para Ti",
  "audio": "assets/mi-musica.mp3",
  ...
}
```

## 🎨 Personalización Visual

### Cambiar Colores del Tema

En `public/index.html`, modifica las variables CSS:

```css
:root {
  --light-intensity: 0.1;
  /* Agrega tus variables personalizadas */
  --primary-color: #ff5fa5;
  --gradient-start: #ffe0ef;
  --gradient-end: #ffc8da;
}
```

### Personalizar Animaciones

Las animaciones están en el CSS del `index.html`. Puedes modificar:
- `@keyframes bgflow` - Movimiento de fondo
- `@keyframes softGlow` - Brillo del título
- `@keyframes floatHearts` - Corazones flotantes

## 📊 Formato de Datos

### Estructura del archivo `cartas.json`

```json
{
  "cartas": [
    {
      "id": "carta-unica-2025",
      "titulo": "Para Mi Amor",
      "destinatario": "María",
      "cuerpo": "Tu mensaje aquí...<br><br>Con párrafos separados",
      "foto": "data:image/jpeg;base64,/9j/4AAQ...",
      "audio": "assets/musica.mp3",
      "fecha": "2025-01-01",
      "activa": true
    }
  ],
  "configuracion": {
    "cartaActual": "carta-unica-2025",
    "siteName": "Cartas Románticas",
    "password": "tu-contraseña"
  }
}
```

### Propiedades de una Carta

- **id**: Identificador único (URL-friendly)
- **titulo**: Título que aparece en la carta
- **destinatario**: Para quién es la carta
- **cuerpo**: Contenido HTML (usa `<br>` para saltos de línea)
- **foto**: URL o Base64 de imagen (opcional)
- **audio**: Ruta a archivo de audio (opcional)
- **fecha**: Fecha en formato YYYY-MM-DD
- **activa**: Si la carta está disponible para ver

## 🚀 Opciones de Deploy

### 1. GitHub Pages (Gratis)
- ✅ Fácil de configurar
- ✅ HTTPS automático
- ✅ Perfecto para sitios estáticos
- ❌ Solo archivos estáticos (no backend real)

### 2. Netlify (Gratis)
- ✅ Deploy automático desde Git
- ✅ Formularios integrados
- ✅ CDN global
- ✅ HTTPS automático

### 3. Vercel (Gratis)
- ✅ Deploy súper rápido
- ✅ Funciones serverless disponibles
- ✅ Perfecto rendimiento

### 4. Firebase Hosting (Gratis)
- ✅ Hosting estático
- ✅ Backend opcional con Firestore
- ✅ Buena integración con Google

## 🔧 Desarrollo y Personalización

### Agregar Nuevos Efectos Visuales

El motor de efectos está en `assets/letter-engine.js`. Puedes agregar:

```javascript
// Nuevo efecto personalizado
addCustomEffect() {
    // Tu código aquí
    const effect = document.createElement('div');
    effect.className = 'mi-efecto';
    document.body.appendChild(effect);
}
```

### Integrar con Backend Real

Para un backend real (Node.js, PHP, etc.), modifica las funciones:

```javascript
// En letter-engine.js
async loadLetterData() {
    const response = await fetch('/api/cartas');
    // Tu lógica de backend aquí
}
```

### Agregar Validación de Formularios

En `admin/index.html`, puedes agregar validaciones:

```javascript
function validateLetter(letterData) {
    if (!letterData.titulo.trim()) {
        throw new Error('El título es requerido');
    }
    // Más validaciones...
}
```

## 📱 Optimización Mobile

El sistema está completamente optimizado para móvil:
- **Responsive Design**: Se adapta a cualquier pantalla
- **Touch Gestures**: Parallax funciona con giroscopio
- **Performance**: Animaciones optimizadas para 60fps
- **Loading**: Pantalla de carga para conexiones lentas

## 🎯 Casos de Uso

- **💕 Cartas de Amor**: Para parejas y relaciones románticas
- **💐 Aniversarios**: Conmemoraciones especiales
- **💍 Propuestas**: Pedidas de matrimonio memorables
- **🎂 Cumpleaños**: Mensajes personalizados únicos
- **💌 Cartas Familiares**: Mensajes emotivos para familia

## 🐛 Resolución de Problemas

### La carta no carga
1. Verifica que el archivo `cartas.json` esté accesible
2. Revisa la consola del navegador para errores
3. Confirma que el ID de la carta existe

### El panel de administración no abre
1. Verifica la contraseña en `cartas.json`
2. Usa la contraseña por defecto: `miamor123`
3. Borra el localStorage del navegador si hay problemas

### Las animaciones van lentas
1. Cierra otras pestañas del navegador
2. Verifica que no hay extensiones que bloqueen JavaScript
3. Prueba en modo incógnito

### Los cambios no se guardan
- **En desarrollo local**: Los cambios se guardan en localStorage
- **En producción**: Necesitas copiar manualmente el JSON generado al archivo
- **Para persistencia real**: Configura un backend con base de datos

## 📄 Licencia y Créditos

Este proyecto está inspirado en el diseño original de carta romántica y expandido con funcionalidad completa de administración.

### Tecnologías Utilizadas
- **HTML5 & CSS3**: Estructura y estilos avanzados
- **Vanilla JavaScript**: Sin dependencias externas
- **Canvas API**: Para efectos de constelación
- **Web APIs**: DeviceOrientation, FileReader, LocalStorage

### Efectos Visuales Incluidos
- ✨ Parallax 3D con mouse y giroscopio
- 🌟 Constelaciones dinámicas
- 💨 Efectos de perfume/niebla
- 🎊 Confetti romántico
- 💖 Corazones flotantes animados
- 🔮 Glassmorphism y blur effects
- 🌈 Gradientes dinámicos animados

---

## 💡 Próximas Mejoras

- [ ] **Sistema de comentarios** para las cartas
- [ ] **Galería de plantillas** prediseñadas
- [ ] **Editor visual** tipo drag & drop
- [ ] **Integración con redes sociales**
- [ ] **Modo oscuro** automático
- [ ] **PWA** (Progressive Web App)
- [ ] **Notificaciones push** para fechas especiales

---

**¿Necesitas ayuda?** Crea un issue en el repositorio o revisa la documentación completa.

**¡Que disfrutes creando momentos especiales! 💕**