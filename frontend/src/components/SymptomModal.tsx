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
  onClose: () => void;
  onRemove: () => void;
}

const INTENSITY_LABELS = ['', 'Słabe', 'Umiarkowane', 'Średnie', 'Silne', 'Bardzo silne'];
const INTENSITY_COLORS = ['', 'var(--green)', 'var(--green)', 'var(--amber)', 'var(--amber)', 'var(--red)'];

export default function SymptomModal({ symptom, intensity, onIntensityChange, onClose, onRemove }: Props) {
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
            <span style={{ fontSize: 13, fontWeight: 700, color: INTENSITY_COLORS[intensity] }}>
              {intensity}/5 · {INTENSITY_LABELS[intensity]}
            </span>
          </div>
          <input
            type="range" min={1} max={5} step={1}
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="wellbeing-range"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Słabe</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Bardzo silne</span>
          </div>
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
          <button className="orange-btn" style={{ flex: 2, margin: 0 }} onClick={onClose}>
            Gotowe
          </button>
        </div>
      </div>
    </>
  );
}
