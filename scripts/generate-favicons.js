const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon.ico': [16, 32],
  'icon.png': [32, 32],
  'apple-icon.png': [180, 180]
};

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));

  for (const [filename, [width, height]] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(width, height)
      .toFile(path.join(__dirname, '../public', filename));
  }
}

generateFavicons().catch(console.error); 