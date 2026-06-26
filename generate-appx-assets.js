const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = './assets/icons/phyweb.png';
const outputDir = './assets/appx';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Les assets de base
const sizes = [
  { name: 'Square44x44Logo.png', width: 44, height: 44 },
  { name: 'StoreLogo.png', width: 50, height: 50 },
  { name: 'Square71x71Logo.png', width: 71, height: 71 },
  { name: 'Square150x150Logo.png', width: 150, height: 150 },
  { name: 'Wide310x150Logo.png', width: 310, height: 150 },
  { name: 'Square310x310Logo.png', width: 310, height: 310 },
  { name: 'SplashScreen.png', width: 620, height: 300 }
];

// Ajout automatique des déclinaisons pour la barre des tâches (TargetSize + Unplated)
const targetSizes = [16, 24, 32, 44, 48, 256];
targetSizes.forEach(size => {
  // Icônes "Plated" (avec fond forcé par le système, au cas où)
  sizes.push({ name: `Square44x44Logo.targetsize-${size}.png`, width: size, height: size });
  // Icônes "Unplated" (transparence respectée dans la barre des tâches)
  sizes.push({ name: `Square44x44Logo.targetsize-${size}_altform-unplated.png`, width: size, height: size });
});

console.log('Génération de TOUS les assets AppX (avec fix de la barre des tâches) en cours...');

sizes.forEach(size => {
  sharp(inputFile)
    .resize({
      width: size.width,
      height: size.height,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } 
    })
    .toFile(path.join(outputDir, size.name))
    .then(() => console.log(`✅ Généré : ${size.name}`))
    .catch(err => console.error(`❌ Erreur sur ${size.name}:`, err));
});