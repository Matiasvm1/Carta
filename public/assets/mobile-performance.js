/**
 * MOBILE PERFORMANCE OPTIMIZER
 * Ultra Mobile-First optimizations
 */

class MobilePerformanceOptimizer {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isLowEnd = navigator.hardwareConcurrency <= 4;
        this.isSlowConnection = navigator.connection?.effectiveType === 'slow-2g' || navigator.connection?.effectiveType === '2g';
        
        this.init();
    }

    init() {
        // Lazy loading para imágenes
        this.setupLazyLoading();
        
        // Reduce animaciones en dispositivos lentos
        if (this.isLowEnd || this.isSlowConnection) {
            this.reduceAnimations();
        }
        
        // Optimiza parallax para móvil
        if (this.isMobile) {
            this.optimizeParallaxForMobile();
        }
        
        // Preload crítico
        this.preloadCritical();
        
        // Touch optimizations
        this.setupTouchOptimizations();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback para navegadores sin IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    reduceAnimations() {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
        
        // Deshabilitar animaciones costosas
        const heavyAnimations = document.querySelectorAll('.constellation, .perfume, .confetti');
        heavyAnimations.forEach(el => {
            el.style.display = 'none';
        });
    }

    optimizeParallaxForMobile() {
        // Reducir intensidad del parallax en móvil
        document.documentElement.style.setProperty('--parallax-intensity', '0.3');
        
        // Usar requestAnimationFrame para suavizar
        let ticking = false;
        
        const updateParallax = (clientX, clientY) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Lógica de parallax optimizada
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Solo para touch events en móvil
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                updateParallax(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
    }

    preloadCritical() {
        // Preload fonts críticas
        const fontUrls = [
            'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap'
        ];
        
        fontUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = url;
            document.head.appendChild(link);
        });
        
        // Prefetch próxima página probable
        if (window.location.pathname.includes('galeria')) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = './index.html';
            document.head.appendChild(link);
        }
    }

    setupTouchOptimizations() {
        // Mejorar scroll momentum en iOS
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Optimizar touch delay
        document.body.style.touchAction = 'manipulation';
        
        // FastClick alternativo para botones
        const buttons = document.querySelectorAll('button, .btn, [role="button"]');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', () => {}, { passive: true });
        });

        // Vibración táctil para feedback (si está disponible)
        const hapticFeedback = (intensity = 'light') => {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [50]
                };
                navigator.vibrate(patterns[intensity]);
            }
        };

        // Agregar feedback a botones importantes
        document.querySelectorAll('.response-trigger, .read-btn, .favorite-btn').forEach(btn => {
            btn.addEventListener('touchstart', () => hapticFeedback('light'), { passive: true });
        });
    }

    // Detectar orientación y ajustar layout
    handleOrientationChange() {
        const handleResize = () => {
            // Ajustar altura del viewport en móvil
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Reajustar interface de respuesta
            const responseInterface = document.querySelector('.response-interface');
            if (responseInterface) {
                responseInterface.style.maxHeight = `${window.innerHeight * 0.85}px`;
            }
        };

        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100);
        });
        
        window.addEventListener('resize', handleResize, { passive: true });
        handleResize(); // Ejecutar inicialmente
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobilePerformanceOptimizer();
    });
} else {
    new MobilePerformanceOptimizer();
}

// Exportar para uso global
window.MobilePerformanceOptimizer = MobilePerformanceOptimizer;