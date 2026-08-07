import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const svgPath = path.resolve('public/icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found!');
    return;
  }
  const svg = fs.readFileSync(svgPath, 'utf8');
  // Remove rounded corners just in case they are present in SVG
  const squareSvg = svg.replace(/rx="128"/g, 'rx="0"').replace(/rx="[0-9]+"/g, 'rx="0"');
  
  await sharp(Buffer.from(squareSvg))
    .resize(180, 180)
    .flatten({ background: '#ffffff' }) // Ensure white background
    .removeAlpha() // Remove alpha channel entirely
    .toFormat('png') // Standard RGB
    .toFile(path.resolve('public/apple-touch-icon-180.png'));
    
  console.log('Successfully generated public/apple-touch-icon-180.png');
}

generate().catch(console.error);
