export { assertValidVectorPath, flattenPath, getPathBounds, rasterizePathSelection } from './path-engine';
export { simplifyPathRDP, traceContours, vectorizeImage } from './vectorize';
export type {
  PathAnchor,
  PathAnchorType,
  PathBounds,
  PathPoint,
  PathRasterizationOptions,
  PathSegment,
  PathSegmentType,
  VectorPath,
} from './path-engine';
export type { VectorizeOptions, VectorizeResult } from './vectorize';
