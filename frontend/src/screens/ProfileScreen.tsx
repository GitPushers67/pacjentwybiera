import { useState } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, PatientProfile } from '../types';
import { allergensList, getDailyTargets } from '../data';

const TREATMENT_LABELS: Record<string, string> = {
  chemo: 'Chemioterapia',
  radio: 'Radioterapia',
  surgery: 'Chirurgia',
  combined: 'Leczenie skojarzone',
};

interface Props {
  navigate: (s: Screen) => void;
  patient: PatientProfile;
}

const TREATMENT_SESSIONS = [
  { date: '7 kwi', type: 'chemo', label: 'Chemo', done: true },
  { date: '28 kwi', type: 'chemo', label: 'Chemo', done: true },
  { date: '7 maj', type: 'chemo', label: 'Chemo', done: true },
  { date: '21 maj', type: 'chemo', label: 'Chemo', done: false, next: true },
  { date: '11 cze', type: 'radio', label: 'Radio', done: false },
  { date: '25 cze', type: 'radio', label: 'Radio', done: false },
];

export default function ProfileScreen({ navigate, patient }: Props) {
  const [streak] = useState([true, true, true, true, true]);
  const [showTreatment, setShowTreatment] = useState(false);

  const targets = getDailyTargets(patient.weightKg);

  const allergenLabels = patient.allergens
    .map((key) => allergensList.find((a) => a.key === key)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Profil</h1></div>
      </div>

      <div className="scroll">
        <div style={{
          background: 'var(--card)', borderRadius: 15,
          border: '1px solid var(--border)', padding: 13, marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Seria raportowania</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>5</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
            Im dłuższa seria → tym dokładniejsza predykcja AI
          </p>
          <div style={{ display: 'flex', gap: 5 }}>
            {streak.map((_, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--orange)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="ti ti-check" style={{ fontSize: 12, color: '#fff' }} />
              </div>
            ))}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg)', border: '2px solid var(--orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--orange)', fontWeight: 600,
            }}>6</div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--text2)',
            }}>7</div>
          </div>
        </div>

        <div style={{
          background: 'var(--card)', borderRadius: 15,
          border: '1px solid var(--border)', padding: 13, marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Mój profil</p>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              {patient.firstName} {patient.lastName}
            </span>
          </div>

          {[
            { label: 'Etap leczenia', value: TREATMENT_LABELS[patient.treatmentType] || 'Nie podano', color: 'var(--text)' },
            { label: 'Dzień cyklu', value: '3 / 21', color: 'var(--green)' },
            { label: 'Waga', value: `${patient.weightKg} kg`, color: 'var(--text)' },
            { label: 'Cel białkowy', value: `${targets.protein}g / dobę`, color: 'var(--text)' },
            { label: 'Cel kaloryczny', value: `${targets.kcal} kcal / dobę`, color: 'var(--text)' },
            { label: 'Następny wlew', value: 'czwartek, 21 maja', color: 'var(--orange)' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderTop: '1px solid var(--border)', cursor: 'pointer',
          }} onClick={() => navigate('allergens')}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Wykluczone / Alergeny</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>
                {allergenLabels || 'Brak'}
              </span>
              <i className="ti ti-chevron-right" style={{ fontSize: 12, color: 'var(--text3)' }} />
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--card)', borderRadius: 15,
          border: '1px solid var(--border)', padding: 13, marginBottom: 10,
        }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowTreatment(!showTreatment)}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              Plan leczenia
            </p>
            <i className={`ti ${showTreatment ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14, color: 'var(--text3)' }} />
          </div>

          {showTreatment && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10 }}>
                Cykl 21-dniowy · chemio + radioterapia
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TREATMENT_SESSIONS.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px',
                    borderRadius: 10,
                    background: s.next ? 'var(--olight)' : s.done ? 'var(--glight)' : 'var(--bg)',
                    border: s.next ? '1.5px solid var(--omid)' : s.done ? '1px solid var(--gmid)' : '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: s.done ? 'var(--green)' : s.next ? 'var(--orange)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={`ti ${s.done ? 'ti-check' : s.next ? 'ti-clock' : 'ti-calendar'}`}
                        style={{ fontSize: 12, color: s.done || s.next ? '#fff' : 'var(--text3)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: s.next ? 'var(--orange)' : 'var(--text)' }}>
                        {s.type === 'chemo' ? 'Chemioterapia' : 'Radioterapia'}
                        {s.next && ' — następna'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.date}</div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 600,
                      padding: '2px 7px', borderRadius: 8,
                      background: s.type === 'chemo' ? 'rgba(232,115,42,0.15)' : 'rgba(45,125,90,0.15)',
                      color: s.type === 'chemo' ? 'var(--orange)' : 'var(--green)',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--card)', borderRadius: 15,
          border: '1px solid var(--border)', padding: 13, marginBottom: 10,
        }}>
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 14, color: 'var(--green)', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                Bezpieczeństwo danych
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                Twoje dane medyczne przetwarzane są lokalnie — nie trafiają do zewnętrznych serwerów. Model AI działa on-premise w sieci szpitalnej. Zgodność z RODO.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navbar active="profile" navigate={navigate} />
    </div>
  );
}
