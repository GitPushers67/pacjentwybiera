import logo from '../assets/logo.png';

interface Props {
  onGuest: () => void;
  onLogin: () => void;
}

export default function LandingScreen({ onGuest, onLogin }: Props) {
  return (
    <div className="screen active" style={{ background: 'var(--bg)' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 40px',
          textAlign: 'center',
        }}
      >
        <img
          src={logo}
          alt="Pacjent Wybiera"
          style={{ height: 56, objectFit: 'contain', marginBottom: 36 }}
        />

        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          Zaplanuj dzień z głową
        </div>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text2)',
            lineHeight: 1.65,
            marginBottom: 48,
            maxWidth: 280,
          }}
        >
          Menu dopasowane do etapu leczenia i aktualnych objawów. AI rekomenduje, Ty wybierasz.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="orange-btn" onClick={onGuest}>
            <i className="ti ti-user" style={{ marginRight: 8 }} />
            Przetestuj jako gość
          </button>
          <button className="outline-btn" onClick={onLogin}>
            <i className="ti ti-login" style={{ marginRight: 8 }} />
            Zaloguj się
          </button>
        </div>

        <div className="rodo-note" style={{ marginTop: 28 }}>
          <i className="ti ti-shield-lock" />
          <span>Dane medyczne przechowywane w chmurze EU (Frankfurt). Zgodność z RODO.</span>
        </div>
      </div>
    </div>
  );
}
