import fs from 'fs/promises';
import path from 'path';
import { ScanResult } from './types';

export class Scanner {
  /**
   * Scans a directory recursively and returns all files matching the supported extensions.
   */
  static async scanDirectory(dir: string, supportedFormats: string[]): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subResults = await this.scanDirectory(fullPath, supportedFormats);
          results.push(...subResults);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (supportedFormats.includes(ext)) {
            results.push({
              filepath: fullPath,
              filename: entry.name,
              extension: ext
            });
          }
        }
      }
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.warn(`[Scanner] Directory not found: ${dir}`);
      } else {
        console.error(`[Scanner] Error reading directory ${dir}:`, err);
      }
    }
    
    return results;
  }
}
