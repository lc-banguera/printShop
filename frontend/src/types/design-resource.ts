export interface DesignResource {
  id: string;
  name: string;
  image: string;
  category: string;
}

export interface DesignDragPayload {
  type: 'design-resource';
  resource: DesignResource;
}

export const DESIGN_DRAG_MIME_TYPE = 'application/printshop-design-resource';
