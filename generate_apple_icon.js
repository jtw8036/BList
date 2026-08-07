import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const svg = fs.readFileSync('public/icon.svg', 'utf8');
  // iOS Apple Touch Icon MUST NOT have rounded corners or transparency.
  // iOS applies its own rounded corner mask.
  const squareSvg = svg.replace(/rx="128"/g, 'rx="0"');
  
  await sharp(Buffer.from(squareSvg))
    .resize(180, 180)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile('public/apple-touch-icon.png');
    
  console.log('Apple touch icon generated.');
}

generate().catch(console.error);
