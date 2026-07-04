const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = './assets/icons/phyweb.png';
const outputDir = './assets/appx';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// La liste COMPLÈTE des assets pour une AppX Windows (incluant le fix pour le mode clair/sombre)
const sizes = [
  // --- Icônes standard ---
  { name: 'Square44x44Logo.png', width: 44, height: 44 },
  { name: 'StoreLogo.png', width: 50, height: 50 },
  { name: 'Square71x71Logo.png', width: 71, height: 71 },
  { name: 'Square150x150Logo.png', width: 150, height: 150 },
  { name: 'Wide310x150Logo.png', width: 310, height: 150 },
  { name: 'Square310x310Logo.png', width: 310, height: 310 },
  { name: 'SplashScreen.png', width: 620, height: 300 },
  { name: 'BadgeLogo.png', width: 24, height: 24 },
  
  // --- Icônes UNPLATED (Mode sombre / standard) ---
  { name: 'Square44x44Logo.targetsize-16_altform-unplated.png', width: 16, height: 16 },
  { name: 'Square44x44Logo.targetsize-24_altform-unplated.png', width: 24, height: 24 },
  { name: 'Square44x44Logo.targetsize-32_altform-unplated.png', width: 32, height: 32 },
  { name: 'Square44x44Logo.targetsize-48_altform-unplated.png', width: 48, height: 48 },
  { name: 'Square44x44Logo.targetsize-256_altform-unplated.png', width: 256, height: 256 },

  // --- Icônes LIGHTUNPLATED (Mode clair) ---
  { name: 'Square44x44Logo.targetsize-16_altform-lightunplated.png', width: 16, height: 16 },
  { name: 'Square44x44Logo.targetsize-24_altform-lightunplated.png', width: 24, height: 24 },
  { name: 'Square44x44Logo.targetsize-32_altform-lightunplated.png', width: 32, height: 32 },
  { name: 'Square44x44Logo.targetsize-48_altform-lightunplated.png', width: 48, height: 48 },
  { name: 'Square44x44Logo.targetsize-256_altform-lightunplated.png', width: 256, height: 256 }
];

console.log('Génération de TOUS les assets AppX en cours...');

const promises = sizes.map(size => {
  return sharp(inputFile)
    .resize({
      width: size.width,
      height: size.height,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } 
    })
    .toFile(path.join(outputDir, size.name))
    .then(() => console.log(`✅ Généré : ${size.name} (${size.width}x${size.height})`))
    .catch(err => console.error(`❌ Erreur sur ${size.name}:`, err));
});

Promise.all(promises).then(() => {
  console.log('Fin de la génération des assets AppX.');
});