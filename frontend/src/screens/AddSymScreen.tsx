import { useState, type Dispatch, type SetStateAction } from 'react';
import SymptomModal from '../components/SymptomModal';
import Navbar from '../components/Navbar';
import type { Screen, SymptomHistoryEntry } from '../types';

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  symptomHistory: SymptomHistoryEntry[];
  setSymptomHistory: Dispatch<SetStateAction<SymptomHistoryEntry[]>>;
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

export default function AddSymScreen({
  navigate,
  symptoms,
  setSymptoms,
  symptomHistory,
  setSymptomHistory,
}: Props) {
  const [modalSym, setModalSym] = useState<string | null>(null);
  const [symIntensity, setSymIntensity] = useState<Record<string, number>>({});
  const [symNotes, setSymNotes] = useState<Record<string, string>>({});

  const openSym = (key: string) => {
    if (!symptoms.includes(key)) setSymptoms([...symptoms, key]);
    if (symIntensity[key] === undefined) {
      setSymIntensity((prev) => ({ ...prev, [key]: 50 }));
    }
    setModalSym(key);
  };

  const closeModal = () => setModalSym(null);

  const saveModal = () => {
    if (!modalSym) return;
      setSymptomHistory((prev) => [{
        key: modalSym,
        addedAt: new Date().toISOString(),
        scale: symIntensity[modalSym] ?? 50,
        note: symNotes[modalSym]?.trim() || undefined,
      }, ...prev]);
    setModalSym(null);
  };

  const removeSym = () => {
    if (!modalSym) return;
    setSymptoms(symptoms.filter((s) => s !== modalSym));
    setSymIntensity((prev) => {
      const next = { ...prev };
      delete next[modalSym];
      return next;
    });
    setSymNotes((prev) => {
      const next = { ...prev };
      delete next[modalSym];
      return next;
    });
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

      <div className="scroll" style={{ paddingBottom: 92 }}>
        {symptoms.length > 0 && (
          <div style={{
            background: 'var(--olight)', border: '1px solid var(--omid)',
            borderRadius: 11, padding: '9px 12px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-check-circle" style={{ fontSize: 13, color: 'var(--orange)', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: 'var(--text)', margin: 0 }}>
              Aktywne: <strong>{symptoms.length}</strong> {symptoms.length === 1 ? 'objaw' : 'objawy'}
              {' — '}kliknij objaw, aby edytować nasilenie i notatkę
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
                {active && intensity !== undefined && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    fontSize: 9, fontWeight: 700, color: 'var(--orange)',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: 6, padding: '1px 4px',
                  }}>
                    {intensity}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button className="orange-btn" style={{ marginTop: 16 }} onClick={() => navigate('home')}>
          Zapisz objawy
        </button>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Historia dnia
          </div>
          {symptomHistory.length === 0 ? (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 11,
                padding: '10px 12px',
                fontSize: 12,
                color: 'var(--text2)',
              }}
            >
              Brak wpisów na dziś.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {symptomHistory.slice(0, 8).map((entry, idx) => {
                const symptom = ALL_SYMPTOMS.find((s) => s.key === entry.key);
                return (
                  <div
                    key={`${entry.key}-${entry.addedAt}-${idx}`}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 11,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                        {symptom?.label ?? entry.key}
                      </div>
                      {entry.note && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: 'var(--text2)',
                            lineHeight: 1.4,
                          }}
                        >
                          Notatka: {entry.note}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                        {new Date(entry.addedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>Skala: {entry.scale}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalSym && activeSym && (
        <SymptomModal
          symptom={activeSym}
          intensity={symIntensity[modalSym] ?? 50}
          onIntensityChange={(v) => setSymIntensity({ ...symIntensity, [modalSym]: v })}
          note={symNotes[modalSym] ?? ''}
          onNoteChange={(v) => setSymNotes({ ...symNotes, [modalSym]: v })}
          onClose={closeModal}
          onDone={saveModal}
          onRemove={removeSym}
        />
      )}
      <Navbar active="add-sym" navigate={navigate} />
    </div>
  );
}
