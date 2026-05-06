import { useState } from 'react';
import SymptomModal from '../components/SymptomModal';
import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
}

const ALL_SYMPTOMS = [
  { key: 'nausea', icon: 'ti-mood-sick', label: 'Nudności' },
  { key: 'diarrhea', icon: 'ti-ripple', label: 'Biegunka' },
  { key: 'const', icon: 'ti-alert-circle', label: 'Zaparcia' },
  { key: 'mouth', icon: 'ti-tooth', label: 'Ból jamy ustnej' },
  { key: 'taste', icon: 'ti-tongue', label: 'Brak smaku' },
  { key: 'metal', icon: 'ti-thermometer', label: 'Metaliczny posmak' },
  { key: 'fatigue', icon: 'ti-battery-low', label: 'Zmęczenie' },
  { key: 'appetite', icon: 'ti-bowl', label: 'Brak apetytu' },
  { key: 'dryness', icon: 'ti-droplets', label: 'Suchość w ustach' },
];

export default function AddSymScreen({ navigate, symptoms, setSymptoms }: Props) {
  const [modalSym, setModalSym] = useState<string | null>(null);
  const [symIntensity, setSymIntensity] = useState<Record<string, number>>({});

  const openSym = (key: string) => {
    if (!symptoms.includes(key)) setSymptoms([...symptoms, key]);
    setModalSym(key);
  };

  const closeModal = () => setModalSym(null);

  const removeSym = () => {
    setSymptoms(symptoms.filter((s) => s !== modalSym));
    setModalSym(null);
  };

  const activeSym = ALL_SYMPTOMS.find((s) => s.key === modalSym);

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Dodaj objaw</h1>
          <p>Kliknij objaw, aby ustawić nasilenie</p>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => navigate('home')}
        >
          <i className="ti ti-x" style={{ fontSize: 20, color: 'var(--text2)' }} />
        </button>
      </div>

      <div className="scroll">
        {symptoms.length > 0 && (
          <div style={{
            background: 'var(--olight)', border: '1px solid var(--omid)',
            borderRadius: 11, padding: '9px 12px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-check-circle" style={{ fontSize: 13, color: 'var(--orange)', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>
              Aktywne: <strong>{symptoms.length}</strong> {symptoms.length === 1 ? 'objaw' : 'objawy'}
              {' — '}kliknij objaw, aby edytować nasilenie
            </p>
          </div>
        )}

        <div className="sym-grid">
          {ALL_SYMPTOMS.map((s) => {
            const active = symptoms.includes(s.key);
            const intensity = symIntensity[s.key];
            return (
              <div
                key={s.key}
                className={`sym-btn ${active ? 'on' : ''}`}
                onClick={() => openSym(s.key)}
                style={{ position: 'relative' }}
              >
                <i className={`ti ${s.icon}`} />
                <span>{s.label}</span>
                {active && intensity && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    fontSize: 9, fontWeight: 700, color: 'var(--orange)',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: 6, padding: '1px 4px',
                  }}>
                    {intensity}/5
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button className="orange-btn" style={{ marginTop: 16 }} onClick={() => navigate('home')}>
          Zapisz objawy
        </button>
      </div>

      {modalSym && activeSym && (
        <SymptomModal
          symptom={activeSym}
          intensity={symIntensity[modalSym] ?? 3}
          onIntensityChange={(v) => setSymIntensity({ ...symIntensity, [modalSym]: v })}
          onClose={closeModal}
          onRemove={removeSym}
        />
      )}
    </div>
  );
}
