/**
 * 🖼️ Servicio de Storage con Supabase
 * Gestión de fotos, audio y archivos multimedia
 */

class StorageService {
    constructor() {
        this.bucketName = 'cartas-media';
    }

    // 📤 Subir archivo (foto o audio)
    async subirArchivo(file, carpeta = 'general') {
        try {
            const client = await window.supabaseClient.getClient();
            
            // Generar nombre único
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const fileName = `${carpeta}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
            
            // Validar tamaño (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('El archivo es muy grande (máximo 10MB)');
            }
            
            // Validar tipo
            if (!this.esArchivoValido(file)) {
                throw new Error('Tipo de archivo no válido');
            }
            
            // Subir archivo
            const { data, error } = await client.storage
                .from(this.bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) throw error;
            
            // Obtener URL pública
            const { data: { publicUrl } } = client.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);
            
            console.log('✅ Archivo subido:', fileName);
            
            return {
                fileName: fileName,
                publicUrl: publicUrl,
                size: file.size,
                type: file.type
            };
            
        } catch (error) {
            showSupabaseError(error, 'Error subiendo archivo');
            return null;
        }
    }

    // 📤 Subir foto de carta
    async subirFotoCarta(file) {
        return await this.subirArchivo(file, 'fotos');
    }

    // 📤 Subir audio de carta
    async subirAudioCarta(file) {
        return await this.subirArchivo(file, 'audios');
    }

    // 🗑️ Eliminar archivo
    async eliminarArchivo(fileName) {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { error } = await client.storage
                .from(this.bucketName)
                .remove([fileName]);
                
            if (error) throw error;
            
            console.log('✅ Archivo eliminado:', fileName);
            return true;
            
        } catch (error) {
            showSupabaseError(error, 'Error eliminando archivo');
            return false;
        }
    }

    // 🖼️ Redimensionar imagen (cliente)
    async redimensionarImagen(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calcular nuevas dimensiones
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                // Redimensionar
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a blob
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // 🔍 Validar tipo de archivo
    esArchivoValido(file) {
        const tiposPermitidos = {
            imagen: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg']
        };
        
        return [...tiposPermitidos.imagen, ...tiposPermitidos.audio].includes(file.type);
    }

    // 📊 Obtener información del bucket
    async getInfoBucket() {
        try {
            const client = await window.supabaseClient.getClient();
            
            const { data: files, error } = await client.storage
                .from(this.bucketName)
                .list('', {
                    limit: 1000
                });
                
            if (error) throw error;
            
            // Calcular estadísticas
            const stats = {
                totalFiles: 0,
                totalSize: 0,
                porTipo: {}
            };
            
            const procesarCarpeta = async (carpeta) => {
                const { data: carpetaFiles } = await client.storage
                    .from(this.bucketName)
                    .list(carpeta);
                
                if (carpetaFiles) {
                    carpetaFiles.forEach(file => {
                        if (file.name !== '.emptyFolderPlaceholder') {
                            stats.totalFiles++;
                            stats.totalSize += file.metadata?.size || 0;
                            
                            const tipo = file.metadata?.mimetype?.split('/')[0] || 'unknown';
                            stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
                        }
                    });
                }
            };
            
            // Procesar carpetas
            await Promise.all([
                procesarCarpeta('fotos'),
                procesarCarpeta('audios')
            ]);
            
            return stats;
            
        } catch (error) {
            showSupabaseError(error, 'Error obteniendo info del bucket');
            return { totalFiles: 0, totalSize: 0, porTipo: {} };
        }
    }

    // 🔧 Utilidades de archivos
    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 🎯 Crear elemento de vista previa
    crearVistaPrevia(file, container) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.style.cssText = `
            position: relative;
            display: inline-block;
            margin: 10px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.cssText = `
                width: 100px;
                height: 100px;
                object-fit: cover;
                display: block;
            `;
            preview.appendChild(img);
        } else if (file.type.startsWith('audio/')) {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.controls = true;
            audio.style.cssText = `
                width: 200px;
                height: 40px;
            `;
            preview.appendChild(audio);
        }
        
        // Información del archivo
        const info = document.createElement('div');
        info.style.cssText = `
            padding: 8px;
            background: rgba(0,0,0,0.05);
            font-size: 12px;
            color: #666;
        `;
        info.innerHTML = `
            <div><strong>${file.name}</strong></div>
            <div>${this.formatearTamano(file.size)}</div>
        `;
        preview.appendChild(info);
        
        if (container) {
            container.appendChild(preview);
        }
        
        return preview;
    }
}

// Instancia global del servicio
window.storageService = new StorageService();