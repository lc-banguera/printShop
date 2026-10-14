import { PipelineStage, CropOptions, PipelineContext } from './types';
import { ImageProcessor } from './ImageProcessor';

export class AutoCropStage implements PipelineStage {
  name = 'AutoCrop';
  private options: CropOptions;

  constructor(options: CropOptions) {
    this.options = options;
  }

  async execute(inputBuffer: Buffer, context: PipelineContext): Promise<Buffer> {
    const { metadata } = await ImageProcessor.load(inputBuffer);
    
    // 1. Detect the tight content bounding box (no margin)
    const contentBox = await ImageProcessor.detectContentBoundingBox(inputBuffer, this.options);
    
    // 2. Add safety margin to get a safe crop region (guards against detection edge-cases)
    const safeBox = ImageProcessor.addMarginToBoundingBox(
      contentBox, 
      this.options.margin, 
      metadata.width, 
      metadata.height
    );
    
    // 3. Write context — NormalizeStage reads contentBox.width/height for scale computation.
    //    The crop safety margin must NOT influence normalization.
    if (context) {
      context.originalSize = { width: metadata.width, height: metadata.height };
      context.contentBox   = contentBox;
      context.safeBox      = safeBox;
      context.croppedSize  = { width: safeBox.width,   height: safeBox.height };
    }
    
    // 4. Crop to safeBox (preserves the safety ring, prevents over-tight cuts)
    return await ImageProcessor.crop(inputBuffer, safeBox);
  }
}
