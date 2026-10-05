export interface DesignPack {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
}

/**
 * Source reserved for the public marketplace catalog.
 * The project does not currently expose approved design-pack data for sale,
 * so this remains empty until its backend or repository provides it.
 */
export const designPacks: DesignPack[] = [];
