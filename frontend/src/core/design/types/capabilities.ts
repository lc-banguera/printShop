export type DesignerId = 'personalizer' | 'builder' | 'editor';

export type DesignerCapability =
  | 'selection'
  | 'transform'
  | 'multiSelection'
  | 'layers'
  | 'undoRedo'
  | 'text'
  | 'imageUpload'
  | 'designLibrary'
  | 'productViewer3d'
  | 'productBuilder'
  | 'productColor'
  | 'productZoneSelection'
  | 'productSizeSelection'
  | 'printMethodSelection'
  | 'productionAction'
  | 'cssVisualFilters'
  | 'imageProcessing'
  | 'backgroundRemoval'
  | 'halftone'
  | 'removeSemiTransparency'
  | 'colorCorrection'
  | 'advancedImageEditing'
  | 'aiGenerate'
  | 'saveDesign'
  | 'downloadDesign'
  | 'productionExport'
  | 'printPreflight';

export interface DesignerCapabilities {
  designer: DesignerId;
  enabled: readonly DesignerCapability[];
}
