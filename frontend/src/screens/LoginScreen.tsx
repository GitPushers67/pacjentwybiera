import { useState } from 'react';
import { signIn, signUp } from '../services/auth';
import logo from '../assets/logo.png';

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.includes('@') && password.length >= 6;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');

    if (mode === 'register') {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      const { error: loginErr } = await signIn(email, password);
      if (loginErr) {
        setError('Konto utworzone — zaloguj się.');
        setMode('login');
      } else {
        onLogin();
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError('Nieprawidłowy email lub hasło.');
      } else {
        onLogin();
      }
    }
    setLoading(false);
  };

  return (
    <div className="screen active" style={{ background: 'var(--bg)', overflowY: 'auto' }}>
      <div className="onboard-wrap">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src={logo} alt="Pacjent Wybiera" style={{ height: 52, objectFit: 'contain' }} />
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 24 }}>
          {mode === 'login'
            ? 'Twoje dane są bezpiecznie przechowywane w chmurze.'
            : 'Stwórz konto, aby personalizować menu i śledzić objawy.'}
        </p>

        <label className="onboard-label required">Adres email</label>
        <input
          className="onboard-input"
          type="email"
          placeholder="pacjent@szpital.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <label className="onboard-label required">Hasło (min. 6 znaków)</label>
        <input
          className="onboard-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginTop: -4, marginBottom: 8, padding: '6px 10px', background: 'var(--rlight)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          className="orange-btn"
          style={{ marginTop: 8, opacity: (!isValid || loading) ? 0.5 : 1 }}
          disabled={!isValid || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Proszę czekać…' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj'}
        </button>

        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', marginTop: 14, textDecoration: 'underline' }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
        </button>

        <div className="rodo-note" style={{ marginTop: 20 }}>
          <i className="ti ti-shield-lock" />
          <span>Dane medyczne przechowywane w chmurze EU (Frankfurt). Zgodność z RODO.</span>
        </div>
      </div>
    </div>
  );
}
