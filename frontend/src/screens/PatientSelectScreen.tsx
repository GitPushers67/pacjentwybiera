import { useEffect, useState } from 'react';
import type { Screen, PatientProfile } from '../types';
import logo from '../assets/logo.png';
import { listPatients } from '../api';

interface Props {
  navigate: (s: Screen) => void;
  onSelect: (p: PatientProfile) => void;
}

const TREATMENT_LABELS: Record<string, string> = {
  chemo: 'Chemioterapia',
  radio: 'Radioterapia',
  surgery: 'Chirurgia',
  combined: 'Leczenie skojarzone',
};

function initials(p: PatientProfile) {
  return `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'var(--orange)', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
];

export default function PatientSelectScreen({ navigate, onSelect }: Props) {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPatients().then(ps => {
      setPatients(ps);
      setLoading(false);
    });
  }, []);

  return (
    <div className="screen active" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 12px', textAlign: 'center' }}>
        <img src={logo} alt="logo" style={{ height: 44, marginBottom: 10 }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Wybierz pacjenta
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
          Bez logowania &mdash; dotknij karty lub dodaj nowego
        </p>
      </div>

      {/* New patient button */}
      <div style={{ padding: '0 20px 8px' }}>
        <button
          className="orange-btn"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => navigate('onboarding')}
        >
          <i className="ti ti-user-plus" style={{ fontSize: 18 }} />
          Nowy pacjent
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 32px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
            <i className="ti ti-loader-2" style={{ fontSize: 28 }} />
            <p style={{ marginTop: 8 }}>Wczytywanie&hellip;</p>
          </div>
        )}

        {!loading && patients.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text3)', fontSize: 14,
          }}>
            <i className="ti ti-users" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
            Brak pacjentów.<br />Dodaj pierwszego klikając przycisk powyżej.
          </div>
        )}

        {patients.map((p, idx) => (
          <div
            key={`${p.firstName}-${p.lastName}-${idx}`}
            onClick={() => onSelect(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--card)', borderRadius: 16,
              padding: '14px 16px', marginBottom: 10,
              boxShadow: 'var(--shadow)', cursor: 'pointer',
              transition: 'transform .1s',
              WebkitTapHighlightColor: 'transparent',
            }}
            onPointerDown={e => (e.currentTarget.style.transform = 'scale(.97)')}
            onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Avatar */}
            <div style={{
              width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
              background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700, color: '#fff',
            }}>
              {initials(p)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                {p.firstName} {p.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'var(--bg2)', borderRadius: 6, padding: '2px 7px',
                  color: 'var(--orange)', fontWeight: 600,
                }}>
                  {p.cancerType}
                </span>
                {p.treatmentType && (
                  <span style={{
                    background: 'var(--bg2)', borderRadius: 6, padding: '2px 7px',
                  }}>
                    {TREATMENT_LABELS[p.treatmentType] ?? p.treatmentType}
                  </span>
                )}
              </div>
            </div>

            <i className="ti ti-chevron-right" style={{ color: 'var(--text3)', fontSize: 18, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
