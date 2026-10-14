import { create } from 'zustand';
import type { DesignPack } from '../data/design-packs.data';
import {
  acquireMarketplacePack,
  clearMarketplaceSession,
  findMarketplaceProfile,
  getMarketplaceSession,
  listMarketplaceAcquisitions,
  listMarketplacePacks,
  listMarketplaceSales,
  saveMarketplacePack,
  saveMarketplaceProfile,
  setMarketplaceSession,
  type DesignAcquisition,
  type DesignMarketplaceProfile,
  type DesignMarketplaceSession,
  type DesignSale,
} from '../services/design-marketplace-repository';

interface DesignMarketplaceState {
  session: DesignMarketplaceSession | null;
  profile: DesignMarketplaceProfile | null;
  packs: DesignPack[];
  acquisitions: DesignAcquisition[];
  sales: DesignSale[];
  refresh: () => void;
  signIn: (email: string) => DesignMarketplaceProfile | null;
  saveProfile: (input: { email: string; publicName: string; bio: string }) => DesignMarketplaceProfile;
  signOut: () => void;
  savePack: (pack: DesignPack) => DesignPack;
  acquirePack: (pack: DesignPack) => DesignAcquisition;
}

function loadState() {
  const session = getMarketplaceSession();
  return {
    session,
    profile: session ? findMarketplaceProfile(session.email) : null,
    packs: listMarketplacePacks(),
    acquisitions: session ? listMarketplaceAcquisitions(session.email) : [],
    sales: session ? listMarketplaceSales(session.profileId) : [],
  };
}

export const useDesignMarketplaceStore = create<DesignMarketplaceState>((set, get) => ({
  ...loadState(),
  refresh: () => {
    const session = get().session ?? getMarketplaceSession();
    set({
      packs: listMarketplacePacks(),
      session,
      profile: session ? findMarketplaceProfile(session.email) : null,
      acquisitions: session ? listMarketplaceAcquisitions(session.email) : [],
      sales: session ? listMarketplaceSales(session.profileId) : [],
    });
  },
  signIn: (email) => {
    const profile = findMarketplaceProfile(email);
    if (!profile) return null;
    const session = setMarketplaceSession(profile);
    set({ session, profile, acquisitions: listMarketplaceAcquisitions(profile.email), sales: listMarketplaceSales(profile.id) });
    return profile;
  },
  saveProfile: (input) => {
    const profile = saveMarketplaceProfile(input);
    const session = setMarketplaceSession(profile);
    set({ session, profile, acquisitions: listMarketplaceAcquisitions(profile.email), sales: listMarketplaceSales(profile.id) });
    return profile;
  },
  signOut: () => {
    clearMarketplaceSession();
    set({ session: null, profile: null, acquisitions: [], sales: [] });
  },
  savePack: (pack) => {
    const saved = saveMarketplacePack(pack);
    set({ packs: listMarketplacePacks() });
    return saved;
  },
  acquirePack: (pack) => {
    const session = get().session;
    if (!session) throw new Error('Necesitas una sesión del marketplace para adquirir este pack.');
    const acquisition = acquireMarketplacePack(session.email, pack);
    set({ acquisitions: listMarketplaceAcquisitions(session.email), sales: listMarketplaceSales(session.profileId) });
    return acquisition;
  },
}));

export function useMarketplaceProfile(): DesignMarketplaceProfile | null {
  return useDesignMarketplaceStore((state) => state.profile);
}
