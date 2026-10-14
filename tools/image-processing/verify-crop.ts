import { ImageProcessor } from './src/ImageProcessor';
import { getActiveProfile } from './src/config';
import fs from 'fs/promises';
import path from 'path';

async function verify() {
  const profile = getActiveProfile();
  
  // Pick a specific file to test
  const filename = 'Virtualthreads (1).png';
  const originalPath = path.join(profile.inputDir, filename);
  const croppedPath = path.join(profile.outputDir, filename);
  
  console.log(`Verifying: ${filename}`);
  console.log(`Original Path: ${originalPath}`);
  
  try {
    const originalBuffer = await fs.readFile(originalPath);
    const { metadata: origMeta } = await ImageProcessor.load(originalBuffer);
    
    console.log(`Original Dimensions: ${origMeta.width} x ${origMeta.height}`);
    
    const boundingBox = await ImageProcessor.detectContentBoundingBox(originalBuffer, profile.crop);
    console.log(`Detected Bounding Box: x=${boundingBox.left}, y=${boundingBox.top}, width=${boundingBox.width}, height=${boundingBox.height}`);
    
    const safeBox = ImageProcessor.addMarginToBoundingBox(boundingBox, profile.crop.margin, origMeta.width, origMeta.height);
    console.log(`Margin: ${profile.crop.margin}`);
    console.log(`Safe Box (with margin): x=${safeBox.left}, y=${safeBox.top}, width=${safeBox.width}, height=${safeBox.height}`);
    
    const croppedBuffer = await fs.readFile(croppedPath);
    const { metadata: cropMeta } = await ImageProcessor.load(croppedBuffer);
    
    console.log(`Output Dimensions: ${cropMeta.width} x ${cropMeta.height}`);
    
    const origArea = origMeta.width * origMeta.height;
    const cropArea = cropMeta.width * cropMeta.height;
    const savedPercentage = ((origArea - cropArea) / origArea) * 100;
    
    console.log(`Crop Percentage Removed: ${savedPercentage.toFixed(2)}%`);
    
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

verify();
