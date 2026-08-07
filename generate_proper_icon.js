import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const svg = fs.readFileSync('public/icon.svg', 'utf8');
  // Remove rounded corners just in case they are present in SVG
  const squareSvg = svg.replace(/rx="128"/g, 'rx="0"').replace(/rx="[0-9]+"/g, 'rx="0"');
  
  await sharp(Buffer.from(squareSvg))
    .resize(180, 180)
    .flatten({ background: '#ffffff' }) // Ensure white background
    .removeAlpha() // Remove alpha channel entirely
    .toFormat('png', { colors: 256 }) // Standard 8-bit PNG
    .toFile('public/apple-touch-icon-ios.png');
    
  console.log('Proper iOS icon generated.');
}

generate().catch(console.error);
