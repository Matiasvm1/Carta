/**
 * LETTER ENGINE - Sistema dinámico de cartas románticas
 * Mantiene todas las animaciones y efectos originales
 */

class LetterEngine {
    constructor() {
        this.currentLetter = null;
        this.dataPath = '../data/cartas.json';
        this.transitioning = false;
        this.hearts = ["❤️","💕","💗","💞","💖"];
        
        // Elementos del DOM
        this.elements = {};
        this.initElements();
        
        // Inicializar el sistema
        this.init();
    }

    initElements() {
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            errorScreen: document.getElementById('errorScreen'),
            openWrapper: document.getElementById('openLetter'),
            envParallax: document.getElementById('envParallax'),
            cardParallax: document.getElementById('cardParallax'),
            envelope: document.getElementById('envelope'),
            content: document.getElementById('content'),
            dof: document.getElementById('dof'),
            closeBtn: document.getElementById('closeBtn'),
            heartSeal: document.getElementById('heartSeal'),
            bgMusic: document.getElementById('bgMusic'),
            constellation: document.getElementById('constellation'),
            letterTitle: document.getElementById('letterTitle'),
            letterContent: document.getElementById('letterContent'),
            photoBox: document.getElementById('photoBox'),
            letterPhoto: document.getElementById('letterPhoto'),
            pageTitle: document.getElementById('pageTitle')
        };
    }

    async init() {
        try {
            // Cargar datos de las cartas
            await this.loadLetterData();
            
            // Configurar eventos
            this.setupEvents();
            
            // Inicializar efectos visuales
            this.initVisualEffects();
            
            // Ocultar pantalla de carga
            setTimeout(() => {
                this.elements.loadingScreen.classList.add('hidden');
            }, 1500);
            
        } catch (error) {
            console.error('Error inicializando Letter Engine:', error);
            this.showError();
        }
    }

    async loadLetterData() {
        try {
            const response = await fetch(this.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Determinar qué carta cargar
            const urlParams = new URLSearchParams(window.location.search);
            const letterId = urlParams.get('carta') || data.configuracion.cartaActual;
            
            // Buscar la carta
            this.currentLetter = data.cartas.find(carta => carta.id === letterId);
            
            if (!this.currentLetter) {
                throw new Error(`Carta no encontrada: ${letterId}`);
            }
            
            // Renderizar la carta
            this.renderLetter();
            
        } catch (error) {
            console.error('Error cargando datos de carta:', error);
            throw error;
        }
    }

    renderLetter() {
        const letter = this.currentLetter;
        
        // Actualizar título de la página
        this.elements.pageTitle.textContent = `Para ${letter.destinatario} 💖`;
        
        // Actualizar título de la carta
        this.elements.letterTitle.textContent = letter.titulo;
        
        // Actualizar contenido (convertir \n a <br> si es necesario)
        this.elements.letterContent.innerHTML = `<p>${letter.cuerpo}</p>`;
        
        // Manejar foto
        if (letter.foto) {
            this.elements.letterPhoto.src = letter.foto;
            this.elements.photoBox.style.display = 'flex';
        } else {
            this.elements.photoBox.style.display = 'none';
        }
        
        // Manejar audio
        if (letter.audio) {
            this.elements.bgMusic.src = letter.audio;
        }
        
        console.log(`Carta renderizada: ${letter.titulo}`);
    }

    setupEvents() {
        // Evento abrir carta
        this.elements.openWrapper.addEventListener('click', () => {
            this.openLetter();
        });

        // Evento cerrar carta
        this.elements.closeBtn.addEventListener('click', () => {
            this.closeLetter();
        });

        // Parallax events
        this.setupParallax();
        
        // Scroll lighting effect
        window.addEventListener('scroll', () => this.updateLight());
        this.updateLight();
    }

    openLetter() {
        if (this.transitioning || this.elements.envelope.classList.contains('open')) return;
        this.transitioning = true;

        this.elements.envelope.classList.add('open');
        this.elements.heartSeal.classList.add('burst');
        this.sealConfetti();
        this.launchPerfume();
        this.drawConstellation();
        this.elements.constellation.classList.add('show');

        // Reproducir música suave
        try { 
            this.elements.bgMusic.play().catch(() => {});
        } catch(e) {}

        setTimeout(() => {
            this.elements.openWrapper.style.opacity = "0";
            this.elements.openWrapper.style.transform = "scale(0.98) translateY(10px)";
            this.elements.dof.classList.add("show");

            setTimeout(() => {
                this.elements.openWrapper.style.display = "none";
                this.elements.content.style.display = "block";
                setTimeout(() => {
                    this.elements.content.style.opacity = "1";
                    this.elements.content.style.transform = "translateY(0) scale(1)";
                    this.transitioning = false;
                }, 40);
            }, 500);
        }, 1300);
    }

    closeLetter() {
        if (this.transitioning) return;
        this.transitioning = true;

        this.elements.content.style.opacity = "0";
        this.elements.content.style.transform = "translateY(40px) scale(0.96)";
        this.elements.dof.classList.remove("show");
        this.elements.constellation.classList.remove("show");
        
        try { 
            this.elements.bgMusic.pause();
        } catch(e) {}

        setTimeout(() => {
            this.elements.content.style.display = "none";
            this.elements.openWrapper.style.display = "block";
            setTimeout(() => {
                this.elements.openWrapper.style.opacity = "1";
                this.elements.openWrapper.style.transform = "scale(1) translateY(0)";
                this.elements.envelope.classList.remove("open");
                this.elements.heartSeal.classList.remove("burst");
                this.transitioning = false;
            }, 40);
        }, 600);
    }

    initVisualEffects() {
        // Corazones flotantes de fondo
        this.startFloatingHearts();
        
        // Configurar canvas de constelación
        this.setupConstellation();
    }

    startFloatingHearts() {
        setInterval(() => {
            const h = document.createElement("div");
            h.className = "heart";
            h.innerHTML = this.hearts[Math.floor(Math.random() * this.hearts.length)];
            h.style.left = Math.random() * 90 + "vw";
            h.style.fontSize = (Math.random() * 12 + 18) + "px";
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 7000);
        }, 900);
    }

    setupConstellation() {
        const canvas = this.elements.constellation;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Guardar contexto para uso posterior
        this.constellationCtx = ctx;
    }

    drawConstellation() {
        const ctx = this.constellationCtx;
        const canvas = this.elements.constellation;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const stars = [];
        const count = 26;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h * 0.7;
            stars.push({x, y});
        }

        // Dibujar estrellas
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Conectar estrellas
        ctx.strokeStyle = "rgba(255,235,250,0.45)";
        ctx.lineWidth = 0.7;
        stars.forEach((s, i) => {
            const distances = stars.map((o, j) => ({
                j, 
                d: Math.hypot(o.x - s.x, o.y - s.y)
            }))
            .filter(o => o.j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, 2);
            
            distances.forEach(n => {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(stars[n.j].x, stars[n.j].y);
                ctx.stroke();
            });
        });
    }

    launchPerfume() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2 + 10;

        for (let i = 0; i < 4; i++) {
            const p = document.createElement("div");
            p.className = "perfume";
            const offsetX = (Math.random() * 100 - 50);
            p.style.left = (centerX + offsetX) + "px";
            p.style.top = (centerY + 40 + Math.random() * 20) + "px";
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 3800);
        }
    }

    sealConfetti() {
        const rect = this.elements.heartSeal.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const colors = ["#ff9acb","#ffc7e1","#fff1f7","#ff7db1","#ffb6c8"];
        const count = 22;

        for (let i = 0; i < count; i++) {
            const c = document.createElement("div");
            const isHeart = Math.random() > 0.55;
            
            if (isHeart) {
                c.className = "confetti heart-shape";
                c.innerHTML = "❤";
                c.style.color = colors[Math.floor(Math.random() * colors.length)];
            } else {
                c.className = "confetti";
                c.style.background = colors[Math.floor(Math.random() * colors.length)];
            }

            c.style.left = originX + "px";
            c.style.top = originY + "px";

            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 120;
            const xMove = Math.cos(angle) * distance + "px";
            const yMove = Math.sin(angle) * distance + "px";
            c.style.setProperty("--x-move", xMove);
            c.style.setProperty("--y-move", yMove);

            const duration = 900 + Math.random() * 500;
            c.style.animation = `confettiFall ${duration}ms ease-out forwards`;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), duration + 200);
        }
    }

    setupParallax() {
        const applyParallax = (clientX, clientY) => {
            const xNorm = clientX / window.innerWidth - 0.5;
            const yNorm = clientY / window.innerHeight - 0.5;

            const tx = xNorm * -16;
            const ty = yNorm * -10;
            const rx = yNorm * 10;
            const ry = xNorm * -10;

            [this.elements.envParallax, this.elements.cardParallax].forEach(layer => {
                if (!layer) return;
                layer.style.setProperty("--px", tx + "px");
                layer.style.setProperty("--py", ty + "px");
                layer.style.setProperty("--prx", rx + "deg");
                layer.style.setProperty("--pry", ry + "deg");
            });
        };

        // Mouse parallax
        window.addEventListener("mousemove", (e) => {
            applyParallax(e.clientX, e.clientY);
        });

        // Mobile parallax (giroscopio)
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", (e) => {
                const beta = (e.beta || 0);   // -180..180
                const gamma = (e.gamma || 0); // -90..90
                const x = (gamma / 60 + 0.5) * window.innerWidth;
                const y = (beta / 90 + 0.5) * window.innerHeight;
                applyParallax(x, y);
            });
        }
    }

    updateLight() {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const intensity = 0.05 + ratio * 0.55;  // 0.05 a ~0.6
        document.documentElement.style.setProperty("--light-intensity", intensity.toFixed(2));
    }

    showError() {
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.errorScreen.style.display = 'flex';
    }

    // API pública para el panel de administración
    static async getAllLetters() {
        try {
            const response = await fetch('../data/cartas.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error obteniendo cartas:', error);
            return null;
        }
    }

    static async saveLetter(letterData) {
        // En un entorno estático como GitHub Pages, esto requeriría una API externa
        // Por ahora, devuelve la estructura que se debería guardar
        console.log('Datos de carta para guardar:', letterData);
        return letterData;
    }
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.letterEngine = new LetterEngine();
});

// Exponer API global para administración
window.LetterAPI = LetterEngine;