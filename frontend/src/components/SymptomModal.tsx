import { symptomTips } from '../data';

interface SymInfo {
  key: string;
  icon: string;
  label: string;
}

interface Props {
  symptom: SymInfo;
  intensity: number;
  onIntensityChange: (v: number) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onClose: () => void;
  onDone: () => void;
  onRemove: () => void;
}

function getIntensityColor(value: number): string {
  if (value < 34) return 'var(--green)';
  if (value < 67) return 'var(--amber)';
  return 'var(--red)';
}

export default function SymptomModal({
  symptom,
  intensity,
  note,
  onIntensityChange,
  onNoteChange,
  onClose,
  onDone,
  onRemove,
}: Props) {
  const tip = symptomTips[symptom.key as keyof typeof symptomTips];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--alight)', border: '1px solid #f5c775',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${symptom.icon}`} style={{ fontSize: 17, color: 'var(--amber)' }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{symptom.label}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Nasilenie objawu</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: getIntensityColor(intensity) }}>
              {intensity}%
            </span>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="wellbeing-range"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>0%</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>100%</span>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            Notatka
          </div>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Np. objaw nasila się po ciepłych potrawach"
            rows={3}
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 11,
              padding: '9px 10px',
              fontSize: 12,
              color: 'var(--text)',
              resize: 'vertical',
              background: '#fff',
            }}
          />
        </div>

        {tip && (
          <div className="sym-tip" style={{ marginBottom: 18 }}>
            <i className="ti ti-bulb" style={{ fontSize: 14, color: 'var(--orange)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                Porada żywieniowa
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                {tip}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onRemove}
            style={{
              flex: 1, padding: '11px 0',
              background: 'var(--rlight)', border: '1px solid var(--red)',
              borderRadius: 11, color: 'var(--red)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Usuń objaw
          </button>
          <button className="orange-btn" style={{ flex: 2, margin: 0 }} onClick={onDone}>
            Gotowe
          </button>
        </div>
      </div>
    </>
  );
}
