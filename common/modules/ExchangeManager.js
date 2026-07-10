/**
 * Module responsable de l'échange de données entre les applications (Tracker/Audio -> Grapher).
 * Il abstrait la différence entre l'environnement Web (IndexedDB) et Electron (IPC).
 */
export default class ExchangeManager {
  static STORAGE_KEY = "phyweb_transfer_data";
  static DB_NAME = "PhyWebExchangeDB";
  static STORE_NAME = "TransferStore";

  /**
   * Utilitaire pour ouvrir/créer la base de données IndexedDB
   */
  static async _getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      // S'exécute lors de la création ou du changement de version
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Envoie des données vers Grapher et ouvre l'application.
   * @param {string} payload - Les données à transférer (chaîne de caractères .pw).
   * @param {string} relativePathToGrapher - Chemin relatif vers Grapher.
   */
  static async sendToGrapher(payload, relativePathToGrapher = "../grapher/index.html") {
    const sizeInBytes = new Blob([payload]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
  
    console.log(`Taille du payload : ${sizeInBytes} octets (${sizeInMB.toFixed(2)} Mo)`);

    if (window.electronAPI) {
      // Mode Electron : On passe par le processus principal
      window.electronAPI.openGrapherWindow(payload);
    } else {
      // Mode Web : On utilise IndexedDB pour supporter les gros volumes
      try {
        const db = await this._getDB();
        
        await new Promise((resolve, reject) => {
          const tx = db.transaction([this.STORE_NAME], 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          const request = store.put(payload, this.STORAGE_KEY);
          
          request.onsuccess = resolve;
          request.onerror = reject;
        });

        // On ouvre Grapher dans un nouvel onglet une fois l'écriture terminée
        window.open(relativePathToGrapher, '_blank');
      } catch (e) {
        console.error("Erreur lors de l'écriture dans IndexedDB", e);
        alert("Impossible de transférer les données : le stockage local est inaccessible.");
      }
    }
  }

  /**
   * Vérifie la présence de données au démarrage et exécute le callback si trouvé.
   * @param {function} callback - Fonction recevant les données importées.
   */
  static async checkStartupData(callback) {
    // Cas 1 : Electron (via l'API exposée dans preload.js)
    if (window.electronAPI && window.electronAPI.onImportData) {
      window.electronAPI.onImportData((data) => {
        callback(data);
      });
    } 
    // Cas 2 : Web (IndexedDB)
    else {
      try {
        const db = await this._getDB();
        
        const data = await new Promise((resolve, reject) => {
          const tx = db.transaction([this.STORE_NAME], 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          const request = store.get(this.STORAGE_KEY);
          
          request.onsuccess = () => {
            if (request.result) {
              // On nettoie tout de suite le storage pour ne pas recharger ces données au prochain F5
              store.delete(this.STORAGE_KEY);
            }
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        });

        // Si des données étaient en attente, on lance le callback
        if (data) {
          callback(data);
        }
      } catch (e) {
        console.error("ExchangeManager: Erreur de lecture IndexedDB", e);
      }
    }
  }
}