import type { DesignResource } from "@/types/design-resource";

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

export function getDesignResources(): DesignResource[] {
  const resources = Object.entries(localResourceModules)
    .map(([path, image]) => {
      const fileName = path.split("/").pop() ?? path;
      const id = fileName.replace(/\.[^.]+$/, "");

      return {
        id,
        name: formatResourceName(fileName),
        image: image as string,
        category: "Local",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, {
      numeric: true,
    }));

  return resources;
}
