import fs from 'fs/promises';
import path from 'path';
import { PipelineStage, ProcessResult, ScanResult } from './types';

export class Pipeline {
  private stages: PipelineStage[] = [];
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  addStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  async process(file: ScanResult): Promise<ProcessResult> {
    try {
      let buffer: Buffer = await fs.readFile(file.filepath);
      const context: any = {};
      
      for (const stage of this.stages) {
        buffer = await stage.execute(buffer, context);
      }
      
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });
      
      const outputPath = path.join(this.outputDir, file.filename);
      await fs.writeFile(outputPath, new Uint8Array(buffer));
      
      return {
        success: true,
        filepath: file.filepath,
        outputPath,
        originalSize: context.originalSize,
        croppedSize: context.croppedSize,
        normalizedOccupancy: context.normalized?.occupancy
      };
    } catch (error: any) {
      return {
        success: false,
        filepath: file.filepath,
        error
      };
    }
  }
}
