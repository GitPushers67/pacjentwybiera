import Navbar from '../components/Navbar';
import type { Screen } from '../types';
import { allergensList } from '../data';
import TopbarDate from '../components/TopbarDate';

interface Props {
  navigate: (s: Screen) => void;
  allergens: string[];
  setAllergens: (a: string[]) => void;
}

export default function AllergensScreen({ navigate, allergens, setAllergens }: Props) {
  const toggle = (key: string) => {
    if (allergens.includes(key)) {
      setAllergens(allergens.filter((a) => a !== key));
    } else {
      setAllergens([...allergens, key]);
    }
  };

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Alergeny</h1>
          <p>Zaznacz alergeny, których unikasz</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <TopbarDate />
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => navigate('profile')}
          >
            <i className="ti ti-x" style={{ fontSize: 20, color: 'var(--text2)' }} />
          </button>
        </div>
      </div>

      <div className="scroll">
        <div style={{
          background: 'var(--olight)',
          border: '1px solid var(--omid)',
          borderRadius: 13,
          padding: '10px 13px',
          marginBottom: 16,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <i className="ti ti-info-circle" style={{ fontSize: 14, color: 'var(--orange)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
            Zaznaczone składniki będą automatycznie wykluczone z rekomendacji AI i oznaczone w menu.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {allergensList.map((a) => {
            const active = allergens.includes(a.key);
            return (
              <button
                key={a.key}
                className={`allergen-btn ${active ? 'on' : ''}`}
                onClick={() => toggle(a.key)}
              >
                <i className={`ti ${a.icon}`} />
                <span>{a.label}</span>
                {active && <i className="ti ti-check allergen-check" />}
              </button>
            );
          })}
        </div>

        {allergens.length > 0 && (
          <div style={{
            background: 'var(--rlight)',
            border: '1px solid var(--red)',
            borderRadius: 13,
            padding: '10px 13px',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>
              Wykluczone składniki ({allergens.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {allergens.map((key) => {
                const a = allergensList.find((x) => x.key === key);
                return a ? (
                  <span key={key} className="tag" style={{ background: 'var(--rlight)', color: 'var(--red)', borderColor: 'var(--red)' }}>
                    {a.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <button className="orange-btn" onClick={() => navigate('profile')}>
          Zapisz zmiany
        </button>
      </div>

      <Navbar active="profile" navigate={navigate} />
    </div>
  );
}
