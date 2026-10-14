import * as React from 'react';
import { ArrowRight, Check, Lock, Store, UserRound } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onboardingPlans } from '@/features/subscription/plans/data/plans.data';
import {
  getAuthorizedStore,
  hasActiveSellerMembership,
  hasSellerProfile,
  useAuthStore,
  type StoreWorkspace,
} from './auth-store';

function getStoreLimit(planId: string | undefined): number | null {
  const plan = onboardingPlans.find((item) => item.id === planId);
  if (!plan) return null;

  const storeLabel = plan.sections
    .flatMap((section) => section.items)
    .map((item) => item.label)
    .find((label) => /tienda/i.test(label));

  if (!storeLabel) return null;
  if (/ilimitad/i.test(storeLabel)) return -1;
  const amount = storeLabel.match(/\d+/)?.[0];
  return amount ? Number(amount) : null;
}

function canCreateStore(user: ReturnType<typeof useAuthStore.getState>) {
  const profile = user.user?.sellerProfile;
  const limit = getStoreLimit(profile?.planId);
  return Boolean(
    profile &&
      hasActiveSellerMembership(user.user) &&
      profile.createStorePath &&
      limit !== null &&
      (limit === -1 || profile.stores.length < limit),
  );
}

function WorkspaceCard({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false,
  note,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex min-h-48 flex-col border border-slate-200 bg-white p-5 text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:shadow-none"
    >
      <span className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-5 flex items-start justify-between gap-4">
        <span>
          <span className="block text-base font-semibold tracking-[-0.02em] text-slate-950 group-disabled:text-slate-500">{title}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-600 group-disabled:text-slate-400">{description}</span>
        </span>
        {!disabled ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
      </span>
      {note ? <span className="mt-auto pt-5 text-xs font-medium text-slate-500">{note}</span> : null}
    </button>
  );
}

function StoreCard({ store, onClick, disabled }: { store: StoreWorkspace; onClick: () => void; disabled: boolean }) {
  return (
    <WorkspaceCard
      title={store.name}
      description="Abrir el espacio comercial de esta tienda."
      icon={Store}
      onClick={onClick}
      disabled={disabled}
      note={disabled ? 'Membresía no activa' : 'Tienda autorizada'}
    />
  );
}

export function WorkspaceSelectorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const profile = auth.user?.sellerProfile;
  const hasSeller = hasSellerProfile(auth.user);
  const membershipActive = hasActiveSellerMembership(auth.user);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasSeller || !profile) {
    return <Navigate to="/account" replace />;
  }

  const createAllowed = canCreateStore(auth);
  const storeLimit = getStoreLimit(profile.planId);

  const openClient = () => {
    auth.setActiveStoreId(null);
    navigate('/account');
  };

  const openStore = (store: StoreWorkspace) => {
    if (!membershipActive || store.status === 'INACTIVE') {
      navigate('/plans');
      return;
    }
    const authorizedStore = getAuthorizedStore(auth.user, store.id);
    if (!authorizedStore) return;
    auth.setActiveStoreId(authorizedStore.id);
    navigate('/store/dashboard');
  };

  const createStore = () => {
    if (!createAllowed || !profile.createStorePath) return;
    navigate(profile.createStorePath, { state: { intent: 'create-store', from: '/workspace' } });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">PrintShop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Elige dónde quieres trabajar</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{auth.user?.name ? `${auth.user.name}, ` : ''}selecciona un espacio para continuar con la misma cuenta.</p>
        </header>

        <section aria-labelledby="workspace-options" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <h2 id="workspace-options" className="sr-only">Espacios disponibles</h2>
          <WorkspaceCard title="Entrar como cliente" description="Accede a tus diseños, proyectos, pedidos y preferencias personales." icon={UserRound} onClick={openClient} note="Espacio personal" />
          {profile.stores.map((store) => <StoreCard key={store.id} store={store} onClick={() => openStore(store)} disabled={!membershipActive || store.status === 'INACTIVE'} />)}
          <WorkspaceCard
            title="Crear tienda"
            description="Inicia el proceso de configuración de otra tienda con tu plan vigente."
            icon={Store}
            onClick={createStore}
            disabled={!createAllowed}
            note={!membershipActive ? 'Requiere membresía activa' : storeLimit === null ? 'Límite de plan no disponible' : storeLimit !== -1 && profile.stores.length >= storeLimit ? 'Límite de tiendas alcanzado' : 'Disponible según tu plan'}
          />
        </section>

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Cliente y Tienda conservan sus datos y permisos por separado.
        </p>
      </div>
    </main>
  );
}

export default WorkspaceSelectorPage;
