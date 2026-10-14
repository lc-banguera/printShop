import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ResourcesShell } from '../components/ResourcesShell';
import { findResourceCreatorProfile } from '../services/resources-auth-repository';
import { useResourcesAuthStore } from '../store/resources-auth-store';

type AccessStep = 'email' | 'code' | 'profile';
const PENDING_EMAIL_KEY = 'printshop-resources-creator:pending-email:v1';

function safeTarget(value: string | null): string {
  return value?.startsWith('/resources/creator') ? value : '/resources/creator';
}

export function ResourceAccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const session = useResourcesAuthStore((state) => state.session);
  const signIn = useResourcesAuthStore((state) => state.signIn);
  const saveProfile = useResourcesAuthStore((state) => state.saveProfile);
  const [email, setEmail] = React.useState(() => window.sessionStorage.getItem(PENDING_EMAIL_KEY) ?? '');
  const [step, setStep] = React.useState<AccessStep>(() => (window.sessionStorage.getItem(PENDING_EMAIL_KEY) ? 'code' : 'email'));
  const [code, setCode] = React.useState('');
  const [publicName, setPublicName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [error, setError] = React.useState('');
  const target = safeTarget(params.get('returnTo'));

  React.useEffect(() => { if (session) navigate(target, { replace: true }); }, [navigate, session, target]);

  const finish = () => {
    window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
    navigate(target, { replace: true });
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) { setError('Escribe un correo electrónico válido.'); return; }
    setError(''); setEmail(normalized); window.sessionStorage.setItem(PENDING_EMAIL_KEY, normalized); setStep('code');
  };

  const submitCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('El código debe contener seis dígitos.'); return; }
    setError('');
    if (findResourceCreatorProfile(email)) { signIn(email); finish(); return; }
    setStep('profile');
  };

  const submitProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (publicName.trim().length < 2) { setError('El nombre público debe tener al menos dos caracteres.'); return; }
    saveProfile({ email, publicName, bio }); finish();
  };

  const reset = () => { setError(''); setCode(''); setStep('email'); window.sessionStorage.removeItem(PENDING_EMAIL_KEY); };

  return (
    <ResourcesShell>
      <div className="resources-main resources-access-main">
        <Link to="/resources" className="resources-back-link"><ArrowLeft aria-hidden="true" /> Volver a Recursos</Link>
        <div className="resources-access-layout">
          <section className="resources-access-intro"><h1>Una cuenta para tu biblioteca creativa.</h1><p>Publica plantillas, mockups y herramientas desde un espacio independiente de Cliente o Tienda. Explora y descarga recursos sin registrarte.</p></section>
          <section className="resources-access-card" aria-labelledby="resource-access-title">
            <p className="resources-eyebrow">Cuenta de creador</p>
            <p className="resources-access-help">{step === 'email' ? 'Usa tu correo para guardar borradores y administrar tus publicaciones.' : step === 'code' ? `Escribe el código de seis dígitos para ${email}.` : 'Solo necesitamos un nombre público para mostrar junto a tus recursos.'}</p>
            {error ? <p className="resources-message resources-message-error" role="alert">{error}</p> : null}
            {step === 'email' ? <form className="resources-form" onSubmit={submitEmail} noValidate><div className="resources-field"><label htmlFor="resource-access-email">Correo electrónico</label><input id="resource-access-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" /></div><button className="resources-button resources-button-primary" type="submit">Continuar</button></form> : null}
            {step === 'code' ? <form className="resources-form" onSubmit={submitCode} noValidate><div className="resources-field"><label htmlFor="resource-access-code">Código de verificación</label><input id="resource-access-code" className="resources-code-input" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" autoFocus /><small>Introduce seis dígitos para continuar.</small></div><div className="resources-form-actions"><button type="button" className="resources-button resources-button-secondary" onClick={reset}>Cambiar correo</button><button className="resources-button resources-button-primary" type="submit">Verificar</button></div></form> : null}
            {step === 'profile' ? <form className="resources-form" onSubmit={submitProfile} noValidate><div className="resources-field"><label htmlFor="resource-public-name">Nombre público</label><input id="resource-public-name" value={publicName} onChange={(event) => setPublicName(event.target.value)} placeholder="Cómo quieres aparecer" autoFocus /></div><div className="resources-field"><label htmlFor="resource-bio">Descripción breve <span>(opcional)</span></label><textarea id="resource-bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Qué tipo de recursos creas" /></div><div className="resources-form-actions"><button type="button" className="resources-button resources-button-secondary" onClick={() => setStep('code')}>Atrás</button><button className="resources-button resources-button-primary" type="submit">Crear perfil</button></div></form> : null}
          </section>
        </div>
      </div>
    </ResourcesShell>
  );
}
