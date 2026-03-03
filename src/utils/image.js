/**
 * Utilidad para optimización de imágenes
 * Destinos P&P - Ahorro de almacenamiento
 */

export const IMAGE_CONFIG = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.5,
    format: 'image/jpeg'
};

export const IMAGE_RECOMMENDATIONS = {
    standard: "Recomendación: JPG/PNG, horizontal, máx 2MB. El sistema optimizará el espacio automáticamente.",
    logo: "Recomendación: Logo con fondo transparente (PNG) o blanco, máx 1MB.",
    gallery: "Recomendación: Fotos nítidas del destino, horizontales, máx 2MB cada una."
};

/**
 * Comprime una imagen desde un File o DataURL
 * @param {File|string} source - Archivo o base64
 * @returns {Promise<string>} - Base64 comprimido
 */
export const compressImage = (source, options = IMAGE_CONFIG) => {
    return new Promise((resolve, reject) => {
        const process = (dataUrl) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const maxWidth = options.maxWidth || IMAGE_CONFIG.maxWidth;
                const maxHeight = options.maxHeight || IMAGE_CONFIG.maxHeight;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Fondo blanco para JPEGs (evita fondos negros en PNGs transparentes)
                if (options.format === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(options.format || IMAGE_CONFIG.format, options.quality || IMAGE_CONFIG.quality));
            };
            img.onerror = (err) => reject(err);
        };

        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => process(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(source);
        } else {
            process(source);
        }
    });
};

/**
 * Procesa un evento de input file y devuelve la imagen comprimida
 * @param {Event} e - Evento de cambio del input
 * @returns {Promise<string|null>}
 */
export const processImageUpload = async (e, options = IMAGE_CONFIG) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    try {
        return await compressImage(file, options);
    } catch (error) {

        return null;
    }
};
/**
 * Convierte un DataURL a Blob
 * @param {string} dataurl 
 * @returns {Blob}
 */
export const dataURLToBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
