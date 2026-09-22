/**
 * Vérifie si un fichier vidéo est supporté par Tracker (.mp4, .m4v).
 * Supporte la détection par type MIME (video/mp4, video/x-m4v, video/m4v)
 * et par extension (.mp4, .m4v) notamment pour Windows où le type MIME
 * des fichiers .m4v peut être absent ("") ou valoir "video/x-m4v".
 *
 * @param {File|Blob|{name?: string, type?: string}|null|undefined} file
 * @returns {boolean}
 */
export function isSupportedVideoFile(file) {
  if (!file) return false;
  const validMimes = ['video/mp4', 'video/x-m4v', 'video/m4v'];
  const hasValidMime = typeof file.type === 'string' && validMimes.includes(file.type.toLowerCase());
  const hasValidExt = typeof file.name === 'string' && /\.(mp4|m4v)$/i.test(file.name);
  return Boolean(hasValidMime || hasValidExt);
}

