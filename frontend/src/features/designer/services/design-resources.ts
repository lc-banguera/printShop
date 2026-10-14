import type { DesignResource } from "@/types/design-resource";
import { AssetManager, type DesignAsset } from '@/core/design/assets';

const assetManager = new AssetManager();

const localResourceModules = import.meta.glob(
  "../../../resources/designs/*.{png,jpg,jpeg,webp,svg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

function formatResourceName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "");
  return nameWithoutExtension
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

for (const [path, image] of Object.entries(localResourceModules)) {
  const fileName = path.split('/').pop() ?? path;
  const asset: DesignAsset = {
    id: fileName.replace(/\.[^.]+$/, ''),
    name: formatResourceName(fileName),
    url: image as string,
    origin: 'library',
    category: 'Local',
  };
  assetManager.register(asset);
}

function toDesignResource(asset: DesignAsset): DesignResource {
  return {
    id: asset.id,
    name: asset.name,
    image: asset.url,
    category: asset.category,
  };
}

export function getDesignResources(): DesignResource[] {
  return assetManager
    .list('library')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map(toDesignResource);
}

export function registerUploadedDesign(file: File): DesignResource {
  const url = URL.createObjectURL(file);
  try {
    const asset = assetManager.register({
      id: `upload-${crypto.randomUUID()}`,
      name: file.name,
      url,
      origin: 'upload',
      category: 'Subidos',
    });
    return toDesignResource(asset);
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function releaseUploadedDesign(id: string): void {
  const asset = assetManager.unregisterUpload(id);
  if (asset?.url.startsWith('blob:')) {
    URL.revokeObjectURL(asset.url);
  }
}
