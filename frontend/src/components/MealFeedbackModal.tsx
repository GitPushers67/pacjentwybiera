import { useState } from 'react';
import type { NotEatenReason } from '../types';
import { PlateSelector } from './PlateSelector';

// ─── Eaten feedback ───────────────────────────────────────────────────────────

interface EatenProps {
  mealName: string;
  protein: number;
  kcal: number;
  onClose: () => void;
}

const ENCOURAGEMENTS = [
  'Dobra robota! Każdy posiłek to krok do przodu.',
  'Świetnie! Twoje ciało dziękuje za to paliwo.',
  'Tak trzymaj! Regularne jedzenie wspiera regenerację.',
  'Brawo! Białko z tego posiłku wspiera odbudowę tkanek.',
  'Doskonale! Konsekwencja w jedzeniu robi różnicę.',
];

export function EatenFeedbackModal({ mealName, protein, kcal, onClose }: EatenProps) {
  const msgIdx = mealName.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % ENCOURAGEMENTS.length;
  const msg = ENCOURAGEMENTS[msgIdx];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18, marginTop: 4 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--glight)', border: '2px solid var(--gmid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <i className="ti ti-check" style={{ fontSize: 28, color: 'var(--green)' }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Zjedzone!</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', maxWidth: 240, lineHeight: 1.4 }}>{mealName}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.25)', borderRadius: 13, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{protein}g</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>białka</div>
          </div>
          <div style={{ flex: 1, background: 'var(--olight)', border: '1.5px solid var(--omid)', borderRadius: 13, padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{kcal}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>kcal</div>
          </div>
        </div>

        <div style={{ background: 'var(--glight)', border: '1px solid var(--gmid)', borderRadius: 13, padding: '10px 13px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <i className="ti ti-bulb" style={{ fontSize: 14, color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>{msg}</p>
        </div>

        <button className="orange-btn" onClick={onClose}>Świetnie!</button>
      </div>
    </>
  );
}

// ─── Not-eaten feedback ───────────────────────────────────────────────────────

const MEAL_ALTERNATIVES = [
  { name: 'Kleik ryżowy z miodem i bananem', tip: 'Ugotuj ½ szklanki ryżu w 2 szklankach mleka, dodaj łyżkę miodu i pokrojonego banana.', protein: 8, kcal: 280 },
  { name: 'Jogurt naturalny z musem owocowym', tip: 'Zmiksuj jogurt z dojrzałym bananem lub brzoskwinią. Łatwe do przełknięcia, bogate w białko.', protein: 10, kcal: 190 },
  { name: 'Koktajl bananowo-mleczny', tip: 'Zmiksuj banana z mlekiem i łyżką miodu. Szybkie 200 kcal i 8g białka w szklance.', protein: 8, kcal: 200 },
  { name: 'Pieczone jabłko z cynamonem', tip: 'Jabłko piecz 20 min w 180°C. Miękkie, słodkie, bezpieczne przy wrażliwym żołądku.', protein: 1, kcal: 120 },
  { name: 'Twarożek z rzodkiewką i szczypiorkiem', tip: 'Lekka kolacja na zimno. Twaróg dostarcza białka, nie obciąża żołądka przed snem.', protein: 14, kcal: 160 },
];

type MealAlternative = typeof MEAL_ALTERNATIVES[0];

const ALTERNATIVES = MEAL_ALTERNATIVES;

const NOT_EATEN_REASONS: { key: NotEatenReason; icon: string; label: string; sub: string }[] = [
  { key: 'no_appetite', icon: 'ti-bowl',        label: 'Brak apetytu',     sub: 'Nie miałem/am ochoty jeść' },
  { key: 'bad_taste',   icon: 'ti-mood-sad',    label: 'Nie smakowało',    sub: 'Smak lub zapach był nieodpowiedni' },
  { key: 'bad_feeling', icon: 'ti-heart-broken', label: 'Złe samopoczucie', sub: 'Nudności, ból lub inne objawy' },
];

interface NotEatenProps {
  mealName: string;
  onClose: (reason: NotEatenReason) => void;
  onSelectAlternative: (alt: MealAlternative) => void;
  onCancel: () => void;
}

export function NotEatenFeedbackModal({ mealName, onClose, onSelectAlternative, onCancel }: NotEatenProps) {
  const [step, setStep] = useState<'reason' | 'alternative'>('reason');
  const [altIdx, setAltIdx] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const alt = ALTERNATIVES[altIdx % ALTERNATIVES.length];

  const handleReason = (reason: NotEatenReason) => {
    onClose(reason); // powiadom rodzica o powodzie
    setStep('alternative'); // zawsze przejdź do alternatywy
  };

  const nextAlt = () => setAltIdx(i => (i + 1) % ALTERNATIVES.length);
  const prevAlt = () => setAltIdx(i => (i - 1 + ALTERNATIVES.length) % ALTERNATIVES.length);

  const handleDragEnd = (x: number) => {
    if (dragStart === null) return;
    const diff = x - dragStart;
    if (diff < -40) nextAlt();
    else if (diff > 40) prevAlt();
    setDragStart(null);
  };

  if (step === 'alternative') {
    return (
      <>
        <div className="modal-backdrop" onClick={onCancel} />
        <div className="modal-sheet">
          <div className="modal-handle" />

          <div className="modal-header">
            <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--olight)', border: '1px solid var(--omid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-chef-hat" style={{ fontSize: 18, color: 'var(--orange)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Może coś innego?</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Przesuń, żeby zobaczyć więcej propozycji</div>
              </div>
            </div>
            <button className="modal-close" onClick={onCancel}>
              <i className="ti ti-x" style={{ fontSize: 14 }} />
            </button>
          </div>

          {/* Swipeable karta */}
          <div
            style={{ background: 'var(--olight)', border: '1.5px solid var(--omid)', borderRadius: 16, padding: '14px', marginBottom: 12, cursor: 'grab', userSelect: 'none' }}
            onPointerDown={(e) => setDragStart(e.clientX)}
            onPointerUp={(e) => handleDragEnd(e.clientX)}
            onPointerCancel={() => setDragStart(null)}
          >
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
              {ALTERNATIVES.map((_, i) => (
                <div key={i} style={{ width: i === altIdx % ALTERNATIVES.length ? 14 : 5, height: 5, borderRadius: 3, background: i === altIdx % ALTERNATIVES.length ? 'var(--orange)' : 'var(--omid)', transition: 'all 0.2s' }} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-chevron-left" style={{ fontSize: 13, color: 'var(--omid)', flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6 }}>{alt.name}</div>
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 7 }}>
                  <span className="tag b">{alt.protein}g białka</span>
                  <span className="tag">{alt.kcal} kcal</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>{alt.tip}</p>
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: 13, color: 'var(--omid)', flexShrink: 0 }} />
            </div>
          </div>

          {/* Przyciski alternatywy */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              style={{ flex: 1, padding: '10px 0', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 11, color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Pomiń
            </button>
            <button
              className="orange-btn"
              style={{ flex: 2, margin: 0 }}
              onClick={() => onSelectAlternative(alt)}
            >
              Wybierz to
            </button>
          </div>
        </div>
      </>
    );
  }

  // step === 'reason'
  return (
    <>
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--rlight)', border: '1px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-x" style={{ fontSize: 18, color: 'var(--red)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nie zjadłeś</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mealName}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text2)', margin: '0 0 12px' }}>
          Co było powodem? Zaproponujemy coś alternatywnego.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {NOT_EATEN_REASONS.map((r) => (
            <button
              key={r.key}
              onClick={() => handleReason(r.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 13, padding: '11px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`ti ${r.icon}`} style={{ fontSize: 16, color: 'var(--text2)' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>{r.sub}</div>
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: 14, color: 'var(--text3)', marginLeft: 'auto' }} />
            </button>
          ))}
        </div>

        <button onClick={onCancel} style={{ width: '100%', padding: '10px 0', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 11, color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Anuluj
        </button>
      </div>
    </>
  );
}

// ─── Partial feedback ─────────────────────────────────────────────────────────

interface PartialProps {
  mealName: string;
  initialPct?: number;
  protein: number;
  kcal: number;
  onConfirm: (pct: number) => void;
  onCancel: () => void;
}

export function PartialFeedbackModal({ mealName, initialPct = 50, protein, kcal, onConfirm, onCancel }: PartialProps) {
  return (
    <>
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--olight)', border: '1px solid var(--omid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-bowl" style={{ fontSize: 18, color: 'var(--orange)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Ile zjadłeś?</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mealName}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.25)', borderRadius: 11, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{protein}g</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 1 }}>białka (100%)</div>
          </div>
          <div style={{ flex: 1, background: 'var(--olight)', border: '1.5px solid var(--omid)', borderRadius: 11, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--orange)' }}>{kcal}</div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 1 }}>kcal (100%)</div>
          </div>
        </div>

        <PlateSelector
          initialPct={initialPct}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </div>
    </>
  );
}
