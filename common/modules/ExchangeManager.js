/**
 * Module responsable de l'échange de données entre les applications (Tracker/Audio -> Grapher).
 * Il abstrait la différence entre l'environnement Web (SessionStorage) et Electron (IPC).
 */
export default class ExchangeManager {
  static STORAGE_KEY = "phyweb_transfer_data";

  /**
   * Envoie des données vers Grapher et ouvre l'application.
   * @param {object} payload - Les données à transférer (courbes, unités, etc.).
   * @param {string} relativePathToGrapher - Chemin relatif vers Grapher (utile uniquement en Web).
   */
  static sendToGrapher(payload, relativePathToGrapher = "../grapher/index.html") {
    const sizeInBytes = new Blob([payload]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
  
    console.log(`Taille du payload : ${sizeInBytes} octets (${sizeInMB.toFixed(2)} Mo)`);

    if (window.electronAPI) {
      // Mode Electron : On passe par le processus principal
      window.electronAPI.openGrapherWindow(payload);
    } else {
      // Mode Web : On utilise le SessionStorage
      try {
        sessionStorage.setItem(this.STORAGE_KEY, payload);
        // On ouvre Grapher dans un nouvel onglet
        window.open(relativePathToGrapher, '_blank');
      } catch (e) {
        console.error("Erreur lors de l'écriture dans sessionStorage", e);
        alert("Impossible de transférer les données : le stockage local est inaccessible.");
      }
    }
  }

  /**
   * Vérifie la présence de données au démarrage et exécute le callback si trouvé.
   * @param {function} callback - Fonction recevant les données importées.
   */
  static checkStartupData(callback) {
    // Cas 1 : Electron (via l'API exposée dans preload.js)
    if (window.electronAPI && window.electronAPI.onImportData) {
      window.electronAPI.onImportData((data) => {
        // Electron envoie déjà un objet JS, pas besoin de parser
        callback(data);
      });
    } 
    // Cas 2 : Web (SessionStorage)
    else {
      const storedString = sessionStorage.getItem(this.STORAGE_KEY);
      if (storedString) {
        try {
            // On parse ici pour uniformiser le format (Objet) avec Electron
            const data = storedString;
            
            // On nettoie tout de suite le storage (plus besoin de le faire dans le finally)
            sessionStorage.removeItem(this.STORAGE_KEY);
            
            callback(data);
        } catch (e) {
          console.error("ExchangeManager: Erreur de lecture JSON", e);
        }
      }
    }
  }
}