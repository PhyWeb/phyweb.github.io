/**
 * Vérifie si un fichier vidéo est supporté par Tracker (.mp4, .webm, .mkv, .avi, .mov, .flv).
 * Supporte la détection par type MIME
 * et par extension notamment pour Windows où le type MIME
 * des fichiers peut être absent ("").
 *
 * @param {File|Blob|{name?: string, type?: string}|null|undefined} file
 * @returns {boolean}
 */
export function isSupportedVideoFile(file) {
  if (!file) return false;
  const validMimes = ['video/mp4', 'video/x-m4v', 'video/m4v', 'video/webm', 'video/x-matroska', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-flv'];
  const hasValidMime = typeof file.type === 'string' && validMimes.includes(file.type.toLowerCase());
  const hasValidExt = typeof file.name === 'string' && /\.(mp4|m4v|webm|mkv|avi|mov|flv)$/i.test(file.name);
  return Boolean(hasValidMime || hasValidExt);
}

