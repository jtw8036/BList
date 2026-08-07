import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const svg = fs.readFileSync('public/icon.svg', 'utf8');
  const squareSvg = svg.replace(/rx="128"/g, 'rx="0"');
  
  await sharp(Buffer.from(squareSvg))
    .resize(180, 180)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .removeAlpha()
    .toFormat('png')
    .toFile('public/apple-icon-final.png');
    
  console.log('Done');
}
generate().catch(console.error);
