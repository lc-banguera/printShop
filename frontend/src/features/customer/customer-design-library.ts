import { create } from "zustand";

export interface CustomerDesignAsset {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  previewUrl: string;
}

interface CustomerDesignLibraryState {
  designs: CustomerDesignAsset[];
  addFiles: (files: File[]) => void;
  removeDesign: (id: string) => void;
  clearDesigns: () => void;
}

function formatFileType(file: File) {
  return file.type || file.name.split(".").pop()?.toUpperCase() || "Archivo";
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export const useCustomerDesignLibrary = create<CustomerDesignLibraryState>((set, get) => ({
  designs: [],

  addFiles: (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const uploaded = imageFiles.map((file) => ({
      id: `customer-design-${crypto.randomUUID()}`,
      name: file.name,
      type: formatFileType(file),
      size: file.size,
      createdAt: new Date().toISOString(),
      previewUrl: URL.createObjectURL(file),
    }));

    set((state) => ({ designs: [...uploaded, ...state.designs] }));
  },

  removeDesign: (id) => {
    const target = get().designs.find((design) => design.id === id);
    if (target?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(target.previewUrl);
    }
    set((state) => ({ designs: state.designs.filter((design) => design.id !== id) }));
  },

  clearDesigns: () => {
    get().designs.forEach((design) => {
      if (design.previewUrl.startsWith("blob:")) URL.revokeObjectURL(design.previewUrl);
    });
    set({ designs: [] });
  },
}));
