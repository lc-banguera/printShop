import { useMemo } from 'react';
import { create } from 'zustand';
import type { PrintResource } from '../data/resources.data';
import { currentCreator, listResources, removeResource, saveResource } from '../services/resources-repository';
interface ResourcesState { resources: PrintResource[]; refresh: () => void; save: (resource: PrintResource) => PrintResource; remove: (id: string) => void; }
export const useResourcesStore = create<ResourcesState>((set) => ({ resources: listResources(), refresh: () => set({ resources: listResources() }), save: (resource) => { const saved = saveResource(resource); set({ resources: listResources() }); return saved; }, remove: (id) => { removeResource(id); set({ resources: listResources() }); } }));
export function useCreatorResources() {
  const resources = useResourcesStore((state) => state.resources);
  const creatorId = currentCreator()?.id;
  return useMemo(() => resources.filter((resource) => !resource.isFixture && resource.creatorId === creatorId), [creatorId, resources]);
}
