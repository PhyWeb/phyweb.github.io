import '../helpers/setup.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

/**
 * Fonction miroir du handler enregistré sur 'will-download' dans main.js.
 */
function handleWillDownload(item) {
  const filename = item.getFilename();
  const ext = path.extname(filename).replace('.', '').toLowerCase();

  const filters = [];
  if (ext === 'pw') {
    filters.push({ name: 'Fichiers PhyWeb (*.pw)', extensions: ['pw'] });
  } else if (ext === 'csv') {
    filters.push({ name: 'Fichiers CSV (*.csv)', extensions: ['csv'] });
  } else if (ext === 'rw3') {
    filters.push({ name: 'Fichiers Regressi (*.rw3)', extensions: ['rw3'] });
  } else if (ext === 'wav') {
    filters.push({ name: 'Fichiers Audio WAV (*.wav)', extensions: ['wav'] });
  } else if (ext === 'png') {
    filters.push({ name: 'Images PNG (*.png)', extensions: ['png'] });
  } else if (ext === 'svg') {
    filters.push({ name: 'Images vectorielles SVG (*.svg)', extensions: ['svg'] });
  } else if (ext === 'pdf') {
    filters.push({ name: 'Documents PDF (*.pdf)', extensions: ['pdf'] });
  }
  filters.push({ name: 'Tous les fichiers (*.*)', extensions: ['*'] });

  item.setSaveDialogOptions({
    title: 'Enregistrer sous...',
    defaultPath: filename,
    filters: filters
  });
}

describe('Electron - Gestion des téléchargements (Enregistrer sous...)', () => {
  const createMockDownloadItem = (filename) => {
    let saveDialogOptions = null;
    return {
      getFilename: () => filename,
      setSaveDialogOptions: (options) => {
        saveDialogOptions = options;
      },
      get options() {
        return saveDialogOptions;
      }
    };
  };

  it('doit configurer le dialogue pour les fichiers PhyWeb (.pw)', () => {
    const item = createMockDownloadItem('experience.pw');
    handleWillDownload(item);

    assert.ok(item.options);
    assert.equal(item.options.title, 'Enregistrer sous...');
    assert.equal(item.options.defaultPath, 'experience.pw');
    assert.deepEqual(item.options.filters[0], { name: 'Fichiers PhyWeb (*.pw)', extensions: ['pw'] });
    assert.deepEqual(item.options.filters[1], { name: 'Tous les fichiers (*.*)', extensions: ['*'] });
  });

  it('doit configurer le dialogue pour les fichiers CSV (.csv)', () => {
    const item = createMockDownloadItem('donnees.csv');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'donnees.csv');
    assert.deepEqual(item.options.filters[0], { name: 'Fichiers CSV (*.csv)', extensions: ['csv'] });
  });

  it('doit configurer le dialogue pour les fichiers Regressi (.rw3)', () => {
    const item = createMockDownloadItem('regressi_export.rw3');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'regressi_export.rw3');
    assert.deepEqual(item.options.filters[0], { name: 'Fichiers Regressi (*.rw3)', extensions: ['rw3'] });
  });

  it('doit configurer le dialogue pour les fichiers Audio (.wav)', () => {
    const item = createMockDownloadItem('signal_sonore.wav');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'signal_sonore.wav');
    assert.deepEqual(item.options.filters[0], { name: 'Fichiers Audio WAV (*.wav)', extensions: ['wav'] });
  });

  it('doit configurer le dialogue pour les images PNG (.png)', () => {
    const item = createMockDownloadItem('schema_optique.png');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'schema_optique.png');
    assert.deepEqual(item.options.filters[0], { name: 'Images PNG (*.png)', extensions: ['png'] });
  });

  it('doit gérer les extensions en majuscules (.PW, .CSV)', () => {
    const item = createMockDownloadItem('MESURES.PW');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'MESURES.PW');
    assert.deepEqual(item.options.filters[0], { name: 'Fichiers PhyWeb (*.pw)', extensions: ['pw'] });
  });

  it('doit proposer le filtre générique pour les extensions inconnues', () => {
    const item = createMockDownloadItem('archive.tar.gz');
    handleWillDownload(item);

    assert.equal(item.options.defaultPath, 'archive.tar.gz');
    assert.equal(item.options.filters.length, 1);
    assert.deepEqual(item.options.filters[0], { name: 'Tous les fichiers (*.*)', extensions: ['*'] });
  });
});

