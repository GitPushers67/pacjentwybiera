import Navbar from '../components/Navbar';
import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

export default function ProfileScreen({ navigate }: Props) {
  const streak = [true, true, true, true, true];

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Profil</h1></div>
      </div>

      <div className="scroll">
        <div style={{
          background: 'var(--card)',
          borderRadius: 15,
          border: '1px solid var(--border)',
          padding: 13,
          marginBottom: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Seria raportowania</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>5</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
            Im dłuższa seria → tym dokładniejsza predykcja
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
              background: 'var(--bg)',
              border: '2px solid var(--orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--orange)', fontWeight: 600,
            }}>6</div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--text2)',
            }}>7</div>
          </div>
        </div>

        <div style={{
          background: 'var(--card)',
          borderRadius: 15,
          border: '1px solid var(--border)',
          padding: 13,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 9 }}>Mój profil</p>

          {[
            { label: 'Etap leczenia', value: 'Chemioterapia', color: 'var(--text)' },
            { label: 'Dzień cyklu', value: '3 / 21', color: 'var(--green)' },
            { label: 'Cel białkowy', value: '75g / dobę', color: 'var(--text)' },
            { label: 'Wykluczone', value: 'Ryby, grejpfrut', color: 'var(--red)' },
            { label: 'Następny wlew', value: 'czwartek, 7 maja', color: 'var(--orange)' },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <Navbar active="profile" navigate={navigate} />
    </div>
  );
}
