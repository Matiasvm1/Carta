TAREA — PROMPT MAESTRO PARA COPILOT (ROL: PROGRAMADOR SENIOR)

Contexto del Proyecto:
Cuento con un archivo HTML con alto nivel de detalle visual, efectos CSS avanzados (parallax, blur, glow, motion), animaciones, estructura temática romántica y una carta renderizada dentro de un contenedor. Este archivo será la base estética del proyecto. Debes trabajar replicando fielmente su look & feel, su lógica visual y su estética emocional.

TAREA PRINCIPAL

Diseñar una plataforma web modular, editable y escalable que permita:

Convertir la carta HTML base en un sistema dinámico, donde el contenido (texto, título, imagen, audio) pueda ser modificado sin alterar el código.

Permitir que yo pueda subir o escribir nuevas cartas cuando quiera.

Generar una URL fija o URLs individuales para cada carta.

Mantener idéntico estilo visual, efectos, animaciones y experiencia del archivo original.

Optimizar código para que sea limpio, desacoplado y de nivel profesional senior.

REQUISITOS TÉCNICOS

Copilot deberá generar:

1. Backend (opciones al menos 3):

Proponer alternativas como:

JSON + GitHub Pages (estático, sin backend tradicional).

Serverless (Firebase / Supabase / Vercel Edge Functions).

Mini backend Node.js + Express con persistencia de cartas.

Debe explicar ventajas, trade-offs y cuál recomendaría para producción liviana.

2. Sistema de Cartas Dinámicas

Producir un sistema donde:

Las cartas se guarden en archivos JSON, una pequeña BD serverless, o Markdown.

Cada carta tenga:

{
  "id": "carta-2025-04-01",
  "titulo": "Para Jime",
  "cuerpo": "Texto completo de la carta…",
  "foto": "base64 o URL",
  "audio": "opcional",
  "fecha": "2025-04-01"
}


La web cargue automáticamente el contenido correspondiente según:

?carta=ID

o la carta “actual” definida en un archivo de configuración.

3. Frontend Requerido

Reescribir mi archivo HTML como template dinámico donde:

<h1> toma el “titulo”.

<p> toma el “cuerpo”.

<img> obtiene la foto desde JSON.

El resto del HTML, animaciones y estilos deben preservarse 100%.

Reemplazar el texto duro y foto del archivo original por variables cargadas desde JSON.

Mantener todas las animaciones, shaders, parallax, corazones, sobre 3D intactos.

Permitir cargar nuevas cartas sin tocar el HTML, solo subiendo un archivo o editando datos.

4. Panel de Administración Simple

Pedir a Copilot que genere opcionalmente:

Un panel ultra básico (password simple).

Formulario para crear, editar y borrar cartas.

Visualización previa de cómo se ve la carta final.

Deployable en GitHub Pages o Vercel.

5. Arquitectura del Proyecto

Copilot debe entregar:

Estructura recomendada del repo:

/public
    index.html
    carta.html
    assets/
    styles/
    scripts/
/data
    cartas.json
    actual.json
/admin
    index.html
    admin.js
README.md


Explicación de flujos:

Cómo se carga una carta.

Cómo se actualiza.

Cómo se renderiza visualmente.

Cómo se comparten los enlaces.

6. Requerimientos del Código

Pedir explícitamente:

Código optimizado, comentado, modular y escalable.

No duplicar CSS, evitar inline CSS.

Buen uso de fetch, promesas y manejo de errores.

Animaciones preservadas o mejoradas (performantes).

7. Estilo

Indicarle a Copilot que respete exactamente:

La estética del HTML base.

Efectos como:

Sobre 3D.

Parallax.

Filtros de vidrio (glassmorphism).

Corazones flotantes.

Glow effects.

Movimiento de background.

No simplificar la UI: mantener toda la magia del diseño original.

ENTREGABLES DE COPILOT

El prompt debe hacer que Copilot entregue:

Código completo del frontend dinámico.

Código del backend (o solución estática) elegido.

Scripts para lectura de cartas.

Guía paso a paso de deploy.

Documentación clara en el README.

Una solución lista para copiar/pegar en mi proyecto.

FIN DE TAREA

Si querés, te armo también la versión del prompt lista para pegar en Copilot Chat, o incluso el proyecto completo ya generado listo para deploy en GitHub Pages.