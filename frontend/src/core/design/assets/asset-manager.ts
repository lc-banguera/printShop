export type DesignAssetOrigin = 'library' | 'upload';

export interface DesignAsset {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly origin: DesignAssetOrigin;
  readonly category: string;
}

export class AssetManager {
  private readonly assets = new Map<string, DesignAsset>();

  register(asset: DesignAsset): DesignAsset {
    if (!asset.id.trim() || !asset.name.trim() || !asset.url.trim()) {
      throw new Error('An asset requires a non-empty ID, name, and URL.');
    }

    const existing = this.assets.get(asset.id);
    if (existing) {
      const isSameAsset =
        existing.name === asset.name &&
        existing.url === asset.url &&
        existing.origin === asset.origin &&
        existing.category === asset.category;
      if (!isSameAsset) {
        throw new Error(`Asset "${asset.id}" is already registered with different metadata.`);
      }
      return existing;
    }

    const registered = Object.freeze({ ...asset });
    this.assets.set(registered.id, registered);
    return registered;
  }

  get(id: string): DesignAsset | null {
    return this.assets.get(id) ?? null;
  }

  list(origin?: DesignAssetOrigin): DesignAsset[] {
    return [...this.assets.values()].filter((asset) => !origin || asset.origin === origin);
  }

  unregisterUpload(id: string): DesignAsset | null {
    const asset = this.assets.get(id);
    if (!asset || asset.origin !== 'upload') return null;

    this.assets.delete(id);
    return asset;
  }
}
