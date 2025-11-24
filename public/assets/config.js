/**
 * CONFIGURACIÓN GLOBAL DEL SISTEMA DE CARTAS
 * Personaliza aquí los aspectos visuales y comportamientos del sistema
 */

window.LETTER_CONFIG = {
  // === CONFIGURACIÓN VISUAL ===
  theme: {
    // Colores principales del tema
    primaryColor: '#ff5fa5',
    secondaryColor: '#ff9ad0',
    accentColor: '#ff76ae',
    
    // Gradientes de fondo
    backgroundGradient: [
      '#ffe0ef',  // Rosa claro
      '#ffc8da',  // Rosa medio
      '#ffb4d1',  // Rosa
      '#f7a3c9'   // Rosa oscuro
    ],
    
    // Colores de corazones flotantes
    heartColors: ['♡','♥','☾','✧','◦'],
    
    // Colores de confetti
    confettiColors: ['#ff9acb','#ffc7e1','#fff1f7','#ff7db1','#ffb6c8']
  },

  // === ANIMACIONES ===
  animations: {
    // Velocidad de animación del fondo (segundos)
    backgroundFlowDuration: 18,
    
    // Intensidad del parallax (0.1 = sutil, 1.0 = intenso)
    parallaxIntensity: 0.6,
    
    // Duración de transición al abrir carta (milisegundos)
    openTransitionDuration: 1300,
    
    // Intervalo de corazones flotantes (milisegundos)
    heartsInterval: 900,
    
    // Duración del glow del título (segundos)
    titleGlowDuration: 3,
    
    // Zoom de la foto (segundos)
    photoZoomDuration: 16
  },

  // === EFECTOS VISUALES ===
  effects: {
    // Habilitar/deshabilitar efectos específicos
    enableParallax: true,
    enableConstellation: true,
    enablePerfumeEffect: true,
    enableFloatingHearts: true,
    enableConfetti: true,
    enableMusic: true,
    enablePhotoZoom: true,
    
    // Intensidad del blur de profundidad de campo
    depthOfFieldBlur: 14,
    
    // Cantidad de estrellas en la constelación
    constellationStars: 26,
    
    // Cantidad de partículas de confetti
    confettiParticles: 22,
    
    // Cantidad de efectos de perfume
    perfumeEffects: 4
  },

  // === COMPORTAMIENTO ===
  behavior: {
    // Auto-reproducir música (puede ser bloqueado por el navegador)
    autoplayMusic: true,
    
    // Volumen de la música (0.0 - 1.0)
    musicVolume: 0.3,
    
    // Habilitar controles móviles (giroscopio)
    enableMobileControls: true,
    
    // Tiempo de carga mínimo (milisegundos)
    minLoadingTime: 1500,
    
    // Timeout para mostrar error (milisegundos)
    errorTimeout: 10000
  },

  // === RESPONSIVE ===
  responsive: {
    // Breakpoint para móvil (px)
    mobileBreakpoint: 768,
    
    // Ajustes específicos para móvil
    mobile: {
      // Reducir efectos en móvil para mejor performance
      reducedEffects: true,
      
      // Parallax más sutil en móvil
      parallaxIntensity: 0.3,
      
      // Menos partículas en móvil
      confettiParticles: 12,
      constellationStars: 16
    }
  },

  // === TEXTOS PERSONALIZABLES ===
  texts: {
    loading: 'Cargando tu carta...',
    errorTitle: '¡Ups! Algo salió mal 💔',
    errorMessage: 'No pudimos cargar la carta. Por favor, intenta de nuevo.',
    retryButton: 'Reintentar',
    closeButton: 'Cerrar y volver al sobre'
  },

  // === CONFIGURACIÓN DE DESARROLLO ===
  debug: {
    // Mostrar logs en consola
    enableLogging: false,
    
    // Mostrar información de performance
    showPerformanceInfo: false,
    
    // Deshabilitar transiciones para testing
    disableAnimations: false
  }
};

/**
 * FUNCIONES UTILITARIAS DE CONFIGURACIÓN
 */

// Aplicar configuración personalizada
window.applyCustomConfig = function(customConfig) {
  window.LETTER_CONFIG = {
    ...window.LETTER_CONFIG,
    ...customConfig
  };
  
  // Aplicar cambios de tema inmediatamente
  if (customConfig.theme) {
    applyThemeChanges(customConfig.theme);
  }
};

// Aplicar cambios de tema en tiempo real
function applyThemeChanges(theme) {
  if (theme.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
  }
  
  if (theme.backgroundGradient && theme.backgroundGradient.length >= 4) {
    const gradient = `radial-gradient(circle at 20% 30%, ${theme.backgroundGradient.join(', ')})`;
    document.body.style.background = gradient;
  }
}

// Configuración para diferentes ocasiones
window.OCCASION_PRESETS = {
  valentine: {
    theme: {
      primaryColor: '#e91e63',
      heartColors: ['♡','♥','☾','✧','◦']
    }
  },
  
  anniversary: {
    theme: {
      primaryColor: '#9c27b0',
      backgroundGradient: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8']
    }
  },
  
  birthday: {
    theme: {
      primaryColor: '#ff5722',
      heartColors: ['🎂','🎉','🎁','🎈','✨'],
      confettiColors: ['#ff9800', '#ffc107', '#ffeb3b', '#cddc39', '#4caf50']
    }
  },
  
  proposal: {
    theme: {
      primaryColor: '#ffd700',
      heartColors: ['💍','💎','👑','💖','✨']
    },
    effects: {
      confettiParticles: 50,
      constellationStars: 50
    }
  }
};

// Aplicar preset de ocasión
window.applyOccasionPreset = function(occasion) {
  const preset = window.OCCASION_PRESETS[occasion];
  if (preset) {
    window.applyCustomConfig(preset);
    console.log(`Preset aplicado: ${occasion}`);
  }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.LETTER_CONFIG;
}