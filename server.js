const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';

// ===== MIDDLEWARES DE SEGURIDAD =====
app.use(helmet({
    contentSecurityPolicy: false // Permitir inline scripts para el frontend
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP cada 15 minutos
    message: 'Demasiadas peticiones desde esta IP'
});
app.use('/api', limiter);

// CORS optimizado
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://tu-dominio.com'] 
        : ['http://localhost:8000', 'http://localhost:55283', 'http://127.0.0.1:8000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Para imágenes base64
app.use(express.static(path.join(__dirname, 'public')));

// ===== INICIALIZAR BASE DE DATOS =====
const db = new sqlite3.Database('./cartas.db', (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Usar serialize para asegurar que las operaciones sean secuenciales
    db.serialize(() => {
        // Tabla de cartas
        db.run(`CREATE TABLE IF NOT EXISTS cartas (
            id TEXT PRIMARY KEY,
            titulo TEXT NOT NULL,
            destinatario TEXT NOT NULL,
            cuerpo TEXT NOT NULL,
            foto TEXT,
            audio TEXT,
            fecha TEXT NOT NULL,
            activa BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creando tabla cartas:', err);
            else console.log('✅ Tabla cartas inicializada');
        });

        // Tabla de configuración
        db.run(`CREATE TABLE IF NOT EXISTS configuracion (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creando tabla configuracion:', err);
            else console.log('✅ Tabla configuracion inicializada');
        });

        // Tabla de respuestas
        db.run(`CREATE TABLE IF NOT EXISTS respuestas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carta_id TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            tipo TEXT DEFAULT 'texto',
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (carta_id) REFERENCES cartas (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error('Error creando tabla respuestas:', err);
            else console.log('✅ Tabla respuestas inicializada');
        });

        // Tabla de usuarios admin (simple)
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creando tabla usuarios:', err);
            else {
                console.log('✅ Tabla usuarios inicializada');
                // Crear usuario admin DESPUÉS de que la tabla esté creada
                createDefaultAdmin();
            }
        });
        
        console.log('✅ Base de datos inicializada correctamente');
    });
}

async function createDefaultAdmin() {
    const defaultPassword = 'admin123'; // CAMBIAR EN PRODUCCIÓN
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    db.run(`INSERT OR IGNORE INTO usuarios (username, password_hash) VALUES (?, ?)`, 
        ['admin', hashedPassword], 
        function(err) {
            if (err) {
                console.error('Error creando usuario admin:', err);
            } else if (this.changes > 0) {
                console.log('👤 Usuario admin creado - Username: admin, Password: admin123');
                console.log('⚠️  IMPORTANTE: Cambiar la contraseña en producción');
            }
        });
}

// ===== MIDDLEWARE DE AUTENTICACIÓN =====
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        db.get('SELECT * FROM usuarios WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error del servidor' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ 
                success: true, 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role 
                } 
            });
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ===== RUTAS DE CARTAS =====

// Obtener todas las cartas (público)
app.get('/api/cartas', (req, res) => {
    db.all('SELECT * FROM cartas ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error obteniendo cartas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        // Convertir campos boolean
        const cartas = rows.map(carta => ({
            ...carta,
            activa: Boolean(carta.activa)
        }));

        res.json({ cartas });
    });
});

// Obtener carta por ID (público)
app.get('/api/cartas/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM cartas WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error obteniendo carta:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Carta no encontrada' });
        }

        res.json({
            ...row,
            activa: Boolean(row.activa)
        });
    });
});

// Crear nueva carta (requiere autenticación)
app.post('/api/cartas', authenticateToken, (req, res) => {
    const { id, titulo, destinatario, cuerpo, foto, audio, fecha, activa } = req.body;

    if (!id || !titulo || !destinatario || !cuerpo || !fecha) {
        return res.status(400).json({ error: 'Campos requeridos: id, titulo, destinatario, cuerpo, fecha' });
    }

    // Verificar que el ID sea único
    db.get('SELECT id FROM cartas WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error verificando ID:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (row) {
            return res.status(409).json({ error: 'Ya existe una carta con ese ID' });
        }

        // Insertar nueva carta
        const stmt = db.prepare(`
            INSERT INTO cartas (id, titulo, destinatario, cuerpo, foto, audio, fecha, activa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([id, titulo, destinatario, cuerpo, foto, audio, fecha, activa ? 1 : 0], function(err) {
            if (err) {
                console.error('Error creando carta:', err);
                return res.status(500).json({ error: 'Error creando carta' });
            }

            res.status(201).json({ 
                success: true, 
                id: id,
                message: 'Carta creada exitosamente' 
            });
        });

        stmt.finalize();
    });
});

// Actualizar carta (requiere autenticación)
app.put('/api/cartas/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { titulo, destinatario, cuerpo, foto, audio, fecha, activa } = req.body;

    const stmt = db.prepare(`
        UPDATE cartas 
        SET titulo = ?, destinatario = ?, cuerpo = ?, foto = ?, audio = ?, fecha = ?, activa = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);

    stmt.run([titulo, destinatario, cuerpo, foto, audio, fecha, activa ? 1 : 0, id], function(err) {
        if (err) {
            console.error('Error actualizando carta:', err);
            return res.status(500).json({ error: 'Error actualizando carta' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Carta no encontrada' });
        }

        res.json({ 
            success: true, 
            message: 'Carta actualizada exitosamente' 
        });
    });

    stmt.finalize();
});

// Eliminar carta (requiere autenticación)
app.delete('/api/cartas/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM cartas WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error eliminando carta:', err);
            return res.status(500).json({ error: 'Error eliminando carta' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Carta no encontrada' });
        }

        res.json({ 
            success: true, 
            message: 'Carta eliminada exitosamente' 
        });
    });
});

// ===== RUTAS DE RESPUESTAS =====

// Obtener respuestas de una carta
app.get('/api/cartas/:id/respuestas', (req, res) => {
    const { id } = req.params;
    
    db.all('SELECT * FROM respuestas WHERE carta_id = ? ORDER BY fecha ASC', [id], (err, rows) => {
        if (err) {
            console.error('Error obteniendo respuestas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        res.json({ respuestas: rows });
    });
});

// Crear nueva respuesta (público - para Jimena)
app.post('/api/cartas/:id/respuestas', (req, res) => {
    const { id } = req.params;
    const { mensaje, tipo = 'texto' } = req.body;

    if (!mensaje) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const stmt = db.prepare(`
        INSERT INTO respuestas (carta_id, mensaje, tipo)
        VALUES (?, ?, ?)
    `);

    stmt.run([id, mensaje, tipo], function(err) {
        if (err) {
            console.error('Error creando respuesta:', err);
            return res.status(500).json({ error: 'Error creando respuesta' });
        }

        res.status(201).json({ 
            success: true, 
            id: this.lastID,
            message: 'Respuesta guardada exitosamente' 
        });
    });

    stmt.finalize();
});

// ===== RUTAS ESPECÍFICAS =====
// Ruta para el panel de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Ruta para archivos del admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ===== RUTA PARA SERVIR EL FRONTEND =====
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log('🚀 Servidor ejecutándose en:', `http://localhost:${PORT}`);
    console.log('📁 Frontend disponible en:', `http://localhost:${PORT}`);
    console.log('🔐 API admin en:', `http://localhost:${PORT}/api`);
    console.log('👤 Usuario admin: admin / admin123');
});

// ===== MANEJO GRACEFUL DE CIERRE =====
process.on('SIGINT', () => {
    console.log('\n💾 Cerrando base de datos...');
    db.close((err) => {
        if (err) {
            console.error('Error cerrando base de datos:', err);
        } else {
            console.log('✅ Base de datos cerrada correctamente');
        }
        process.exit(0);
    });
});

module.exports = app;