import { supabase } from './supabaseClient';

export const StorageApi = {
    /**
     * Obtiene el uso total de almacenamiento en todos los buckets accesibles.
     * @returns {Promise<{totalBytes: number, percentage: number, limitGB: number}>}
     */
    async getStorageUsage() {
        try {
            if (!supabase) return { totalBytes: 0, percentage: 0, limitGB: 1 };

            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            if (bucketsError) throw bucketsError;

            let totalBytes = 0;
            const limitGB = 1;
            const limitBytes = limitGB * 1024 * 1024 * 1024;

            for (const bucket of buckets) {
                // Listar todos los archivos en el bucket recursivamente (aproximación)
                // Nota: list() tiene un límite de 100 archivos por defecto, pero para estadísticas rápidas o buckets pequeños sirve.
                // En una implementación real, se necesitaría recursión completa.
                const { data: files, error: listError } = await supabase.storage.from(bucket.id).list('', {
                    limit: 1000,
                    offset: 0
                });

                if (!listError && files) {
                    totalBytes += files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
                }
            }

            return {
                totalBytes,
                percentage: (totalBytes / limitBytes) * 100,
                limitGB
            };
        } catch (err) {

            return { totalBytes: 0, percentage: 0, limitGB: 1 };
        }
    },

    /**
     * Elimina archivos antiguos (más de X días) de los buckets de cotizaciones.
     * @param {number} days - Antigüedad máxima en días.
     */
    async cleanupOldFiles(days = 45) {
        try {
            if (!supabase) return { ok: true, deletedCount: 0 };

            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            if (bucketsError) throw bucketsError;

            const now = new Date();
            const threshold = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
            let deletedCount = 0;

            // Buckets a limpiar - podemos ser específicos o limpiar todos excepto logos
            const bucketsToClean = buckets.filter(b => b.id !== 'company-logos');

            for (const bucket of bucketsToClean) {
                const { data: files, error: listError } = await supabase.storage.from(bucket.id).list('', {
                    limit: 1000
                });

                if (listError || !files) continue;

                const filesToDelete = files.filter(f => {
                    const created = new Date(f.created_at);
                    return created < threshold;
                }).map(f => f.name);

                if (filesToDelete.length > 0) {
                    const { error: deleteError } = await supabase.storage.from(bucket.id).remove(filesToDelete);
                    if (!deleteError) {
                        deletedCount += filesToDelete.length;
                    }
                }
            }

            return { ok: true, deletedCount };
        } catch (err) {

            return { ok: false, error: err.message };
        }
    }
};
