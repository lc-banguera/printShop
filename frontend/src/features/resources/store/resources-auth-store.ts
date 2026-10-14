import { create } from 'zustand';
import {
  clearResourceCreatorSession,
  findResourceCreatorProfile,
  getResourceCreatorSession,
  saveResourceCreatorProfile,
  setResourceCreatorSession,
  type ResourceCreatorProfile,
  type ResourceCreatorSession,
} from '../services/resources-auth-repository';

interface ResourceAuthState {
  session: ResourceCreatorSession | null;
  profile: ResourceCreatorProfile | null;
  signIn: (email: string) => ResourceCreatorProfile | null;
  saveProfile: (input: { email: string; publicName: string; bio: string }) => ResourceCreatorProfile;
  signOut: () => void;
  refresh: () => void;
}

function loadState() {
  const session = getResourceCreatorSession();
  return { session, profile: session ? findResourceCreatorProfile(session.email) : null };
}

export const useResourcesAuthStore = create<ResourceAuthState>((set) => ({
  ...loadState(),
  signIn: (email) => {
    const profile = findResourceCreatorProfile(email);
    if (!profile) return null;
    const session = setResourceCreatorSession(profile);
    set({ session, profile });
    return profile;
  },
  saveProfile: (input) => {
    const profile = saveResourceCreatorProfile(input);
    const session = setResourceCreatorSession(profile);
    set({ session, profile });
    return profile;
  },
  signOut: () => {
    clearResourceCreatorSession();
    set({ session: null, profile: null });
  },
  refresh: () => {
    const session = getResourceCreatorSession();
    set({ session, profile: session ? findResourceCreatorProfile(session.email) : null });
  },
}));

export function currentResourceCreator(): ResourceCreatorProfile | null {
  const session = getResourceCreatorSession();
  return session ? findResourceCreatorProfile(session.email) : null;
}
