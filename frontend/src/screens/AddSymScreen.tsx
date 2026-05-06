import { useState } from 'react';
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

const INTENSITY = ['Słabe', 'Umiarkowane', 'Silne'];

function IntensityPicker() {
  const [selected, setSelected] = useState('Umiarkowane');
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {INTENSITY.map((label) => {
        const active = selected === label;
        return (
          <button
            key={label}
            style={{
              flex: 1,
              padding: 9,
              borderRadius: 12,
              border: active ? '1.5px solid var(--orange)' : '1px solid var(--border)',
              background: active ? 'var(--olight)' : 'var(--card)',
              fontSize: 12,
              color: active ? 'var(--orange)' : 'var(--text2)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
            }}
            onClick={() => setSelected(label)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function AddSymScreen({ navigate, symptoms, setSymptoms }: Props) {
  const toggle = (key: string) => {
    if (symptoms.includes(key)) {
      setSymptoms(symptoms.filter((s) => s !== key));
    } else {
      setSymptoms([...symptoms, key]);
    }
  };

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Dodaj objaw</h1></div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => navigate('home')}
        >
          <i className="ti ti-x" style={{ fontSize: 20, color: 'var(--text2)' }} />
        </button>
      </div>

      <div className="scroll">
        <div className="sym-grid">
          {ALL_SYMPTOMS.map((s) => (
            <div
              key={s.key}
              className={`sym-btn ${symptoms.includes(s.key) ? 'on' : ''}`}
              onClick={() => toggle(s.key)}
            >
              <i className={`ti ${s.icon}`} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Nasilenie</p>
        <IntensityPicker />

        <button className="orange-btn" style={{ marginTop: 8 }} onClick={() => navigate('home')}>
          Zapisz objawy
        </button>
      </div>
    </div>
  );
}
