import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const svg = fs.readFileSync('public/icon.svg', 'utf8');
  const squareSvg = svg.replace(/rx="128"/g, 'rx="0"').replace(/rx="[0-9]+"/g, 'rx="0"');
  
  await sharp(Buffer.from(squareSvg))
    .resize(180, 180)
    .flatten({ background: '#ffffff' })
    .removeAlpha()
    .toFormat('png') // Standard 24-bit RGB
    .toFile('public/apple-icon-v5.png');
}

generate().catch(console.error);
