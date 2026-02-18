const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

const inputPath = path.join(__dirname, '../public/logo.PNG');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    console.log('Generating favicons from logo.PNG...');
    
    for (const { name, size } of sizes) {
      const outputPath = path.join(outputDir, name);
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }
    
    // Generate favicon.ico (32x32)
    const icoPath = path.join(outputDir, 'favicon.ico');
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath);
    console.log('✓ Generated favicon.ico (32x32)');
    
    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
