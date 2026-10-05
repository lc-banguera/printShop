import { ImageProcessor } from './src/ImageProcessor';
import path from 'path';
import fs from 'fs/promises';

async function sample() {
  const filepath = path.join(__dirname, '../../frontend/src/resources/landing_principal/designs/Virtualthreads (1).png');
  const buffer = await fs.readFile(filepath);
  
  const { image, metadata } = await ImageProcessor.load(buffer);
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });
  
  const getPixel = (x: number, y: number) => {
    const offset = (y * metadata.width + x) * metadata.channels;
    return {
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
      a: metadata.channels === 4 ? data[offset + 3] : 255
    };
  };
  
  console.log(`Dimensions: ${metadata.width} x ${metadata.height}, channels: ${metadata.channels}`);
  console.log(`Top-Left:`, getPixel(0, 0));
  console.log(`Top-Right:`, getPixel(metadata.width - 1, 0));
  console.log(`Bottom-Left:`, getPixel(0, metadata.height - 1));
  console.log(`Bottom-Right:`, getPixel(metadata.width - 1, metadata.height - 1));
  console.log(`Center:`, getPixel(Math.floor(metadata.width / 2), Math.floor(metadata.height / 2)));
}

