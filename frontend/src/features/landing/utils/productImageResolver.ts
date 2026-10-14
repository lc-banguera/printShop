// Vite glob import dynamically discovering all design images
const designImagesMap = import.meta.glob<{ default: string }>(
  '/src/resources/landing_principal/designs-cropped/*.png',
  { eager: true }
);

/**
 * Resolves a product image path from its filename (e.g., "Virtualthreads (1).png").
 * If the exact image is not found, returns a safe fallback design image.
 */
export function getProductImageUrl(imageName: string): string {
  const matchingKey = Object.keys(designImagesMap).find((key) =>
    key.endsWith(`/${imageName}`) || key.endsWith(imageName)
  );

  if (matchingKey && designImagesMap[matchingKey]) {
    return designImagesMap[matchingKey].default;
  }

  // Fallback to the first discovered design image if available
  const firstKey = Object.keys(designImagesMap)[0];
  return firstKey ? designImagesMap[firstKey].default : '';
}

/**
 * Returns a list of all discovered image filenames in the designs folder.
 */
export function getAllDiscoveredImageNames(): string[] {
  return Object.keys(designImagesMap).map((key) => {
    const parts = key.split('/');
    return parts[parts.length - 1];
  });
}
