const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertIcons() {
    const sizes = [192, 512];
    const svgBuffer = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'));
    
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, 'icons', `icon-${size}x${size}.png`));
        console.log(`Created icon-${size}x${size}.png`);
    }
}

convertIcons().catch(console.error);
