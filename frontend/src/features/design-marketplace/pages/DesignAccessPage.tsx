import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DesignMarketplaceShell, MarketplaceNotice } from '../components/DesignMarketplaceShell';
import { consumePendingMarketplaceAction, findMarketplaceProfile } from '../services/design-marketplace-repository';
import { useDesignMarketplaceStore } from '../store/design-marketplace-store';

type AccessStep = 'email' | 'code' | 'profile';
const PENDING_EMAIL_KEY = 'printshop-design-marketplace:pending-email:v1';

function safeTarget(value: string | null) {
  return value && value.startsWith('/designs/') ? value : '/designs/creator';
}

export function DesignAccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const session = useDesignMarketplaceStore((state) => state.session);
  const signIn = useDesignMarketplaceStore((state) => state.signIn);
  const saveProfile = useDesignMarketplaceStore((state) => state.saveProfile);
  const [email, setEmail] = React.useState(() => window.sessionStorage.getItem(PENDING_EMAIL_KEY) ?? '');
  const [step, setStep] = React.useState<AccessStep>(() => window.sessionStorage.getItem(PENDING_EMAIL_KEY) ? 'code' : 'email');
  const [code, setCode] = React.useState('');
  const [publicName, setPublicName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const target = safeTarget(params.get('returnTo'));

  React.useEffect(() => {
    if (session) navigate(target, { replace: true });
  }, [navigate, session, target]);

  const continueAfterAuth = () => {
    window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
    consumePendingMarketplaceAction();
    navigate(target, { replace: true });
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError('Escribe un correo electrónico válido.'); return; }
    setError('');
    setEmail(normalized);
    window.sessionStorage.setItem(PENDING_EMAIL_KEY, normalized);
    setNotice('Código de verificación requerido para continuar.');
    setStep('code');
  };

  const submitCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('El código debe contener seis dígitos.'); return; }
    setError('');
    if (findMarketplaceProfile(email)) { signIn(email); continueAfterAuth(); return; }
    setStep('profile');
  };

  const submitProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (publicName.trim().length < 2) { setError('El nombre público debe tener al menos dos caracteres.'); return; }
    saveProfile({ email, publicName, bio });
    continueAfterAuth();
  };

  const reset = () => { setError(''); setNotice(''); setCode(''); setStep('email'); window.sessionStorage.removeItem(PENDING_EMAIL_KEY); };
  const title = step === 'email' ? 'Accede a tus diseños' : step === 'code' ? 'Verifica tu correo' : 'Crea tu perfil de creador';

  return (
    <DesignMarketplaceShell>
      <div className="marketplace-main">
        <div className="marketplace-access-layout">
          <section className="marketplace-access-intro"><div><span className="marketplace-access-mark"><span /> Marketplace independiente</span><h1>Tu biblioteca. Tu trabajo.</h1><p>Una cuenta separada para adquirir packs, conservar tus originales y publicar recursos creativos sin mezclar sesiones con Cliente o Tienda.</p></div><p className="m-0 text-xs text-foregroundSubtle">Verifica tu acceso con un código de seis dígitos.</p></section>
          <section className="marketplace-access-card" aria-labelledby="access-title">
            <h2 id="access-title">{title}</h2>
            <p>{step === 'email' ? 'Usa un correo para guardar tus adquisiciones y publicaciones.' : step === 'code' ? `Escribe el código de seis dígitos para ${email}.` : 'Es la primera vez que usas este correo. Solo necesitamos un nombre público para tus publicaciones.'}</p>
            {notice ? <MarketplaceNotice>{notice}</MarketplaceNotice> : null}
            {error ? <MarketplaceNotice tone="error">{error}</MarketplaceNotice> : null}
            {step === 'email' ? <form className="marketplace-form" onSubmit={submitEmail} noValidate><div className="marketplace-field"><label htmlFor="marketplace-email">Correo electrónico</label><input id="marketplace-email" className="marketplace-control" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" /></div><button className="marketplace-button marketplace-button-primary" type="submit">Continuar</button></form> : null}
            {step === 'code' ? <form className="marketplace-form" onSubmit={submitCode} noValidate><div className="marketplace-field"><label htmlFor="marketplace-code">Código de verificación</label><input id="marketplace-code" className="marketplace-control marketplace-code-input" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" /><small>Introduce los seis dígitos de tu código.</small></div><div className="marketplace-form-actions"><button type="button" className="marketplace-button marketplace-button-secondary" onClick={reset}>Cambiar correo</button><button type="button" className="marketplace-button marketplace-button-ghost" onClick={() => setNotice('Puedes continuar con tu código de verificación.')}>Reenviar</button><button className="marketplace-button marketplace-button-primary" type="submit">Verificar</button></div></form> : null}
            {step === 'profile' ? <form className="marketplace-form" onSubmit={submitProfile} noValidate><div className="marketplace-field"><label htmlFor="marketplace-public-name">Nombre público</label><input id="marketplace-public-name" className="marketplace-control" value={publicName} onChange={(event) => setPublicName(event.target.value)} placeholder="Cómo quieres aparecer" autoFocus /></div><div className="marketplace-field"><label htmlFor="marketplace-bio">Descripción breve <span className="text-foregroundSubtle">(opcional)</span></label><textarea id="marketplace-bio" className="marketplace-control" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Qué tipo de recursos creas" /></div><div className="marketplace-form-actions"><button type="button" className="marketplace-button marketplace-button-secondary" onClick={() => setStep('code')}>Atrás</button><button className="marketplace-button marketplace-button-primary" type="submit">Crear perfil</button></div></form> : null}
          </section>
        </div>
      </div>
    </DesignMarketplaceShell>
  );
}
