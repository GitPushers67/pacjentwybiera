import { useState } from 'react';
import Navbar from '../components/Navbar';
import type { Screen } from '../types';
import { planDays } from '../data';

interface Props {
  navigate: (s: Screen) => void;
}

const DAYS = [
  { key: 'mon', short: 'Pon', num: '4', date: 'pon, 4 maja' },
  { key: 'tue', short: 'Wt',  num: '5', date: 'wt, 5 maja' },
  { key: 'wed', short: 'Śr',  num: '6', date: 'śr, 6 maja', today: true },
  { key: 'thu', short: 'Czw', num: '7', date: 'czw, 7 maja', treatment: 'chemo' as const },
  { key: 'fri', short: 'Pt',  num: '8', date: 'pt, 8 maja' },
  { key: 'sat', short: 'Sob', num: '9', date: 'sob, 9 maja' },
  { key: 'sun', short: 'Nd',  num: '10', date: 'nd, 10 maja' },
];

const TREATMENT_SESSIONS = [
  { date: '7 kwi', label: 'Chemo', type: 'chemo', done: true },
  { date: '28 kwi', label: 'Chemo', type: 'chemo', done: true },
  { date: '7 maj', label: 'Chemo', type: 'chemo', done: true },
  { date: '21 maj', label: 'Chemo', type: 'chemo', done: false, next: true },
  { date: '11 cze', label: 'Radio', type: 'radio', done: false },
  { date: '25 cze', label: 'Radio', type: 'radio', done: false },
];

const BADGE_ICON: Record<string, string> = {
  zjedzone: 'ti-check',
  'częściowo': 'ti-circle-half',
  'nie zjedzone': 'ti-x',
  rekomendowane: 'ti-star',
  wybrane: 'ti-check',
  oczekuje: 'ti-clock',
  wkrótce: 'ti-lock',
};

export default function PlanScreen({ navigate }: Props) {
  const [selectedDay, setSelectedDay] = useState('wed');
  const [showTreatments, setShowTreatments] = useState(false);

  const day = planDays[selectedDay] ?? planDays.wed;
  const selectedMeta = DAYS.find((d) => d.key === selectedDay)!;
  const isHistory = selectedDay === 'mon' || selectedDay === 'tue';
  const totalKcal = day.meals.reduce((s, m) => s + m.kcal, 0);

  const nextSession = TREATMENT_SESSIONS.find((s) => s.next);

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Plan tygodnia</h1></div>
      </div>

      {/* ── Week bar ──────────────────────────────────────── */}
      <div className="week-bar">
        {DAYS.map((d) => (
          <button
            key={d.key}
            className={`dp ${selectedDay === d.key ? 'on' : ''} ${d.today ? 'today-day' : ''}`}
            onClick={() => setSelectedDay(d.key)}
          >
            <span>{d.short}</span>
            <span className="dn">{d.num}</span>
            {d.today
              ? <span className="today-lbl">Dziś</span>
              : <div style={{ height: 10 }} />
            }
            {d.treatment && (
              <div className={`treat-dot treat-${d.treatment}`} />
            )}
          </button>
        ))}
      </div>

      {/* ── Treatment notice banner ───────────────────────── */}
      {nextSession && (
        <div
          style={{
            margin: '0 16px 10px',
            background: 'var(--olight)', border: '1px solid var(--omid)',
            borderRadius: 11, padding: '8px 12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setShowTreatments(!showTreatments)}
        >
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <i className="ti ti-calendar-event" style={{ fontSize: 13, color: 'var(--orange)', flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: 'var(--text)', margin: 0 }}>
              Następna sesja: <strong style={{ color: 'var(--orange)' }}>{nextSession.label} · {nextSession.date}</strong>
            </p>
          </div>
          <i className={`ti ${showTreatments ? 'ti-chevron-up' : 'ti-chevron-down'}`}
            style={{ fontSize: 13, color: 'var(--text3)' }} />
        </div>
      )}

      {/* ── Treatment timeline ────────────────────────────── */}
      {showTreatments && (
        <div style={{ margin: '0 16px 10px' }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>
              Plan leczenia — wszystkie sesje
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TREATMENT_SESSIONS.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 9px', borderRadius: 9,
                  background: s.next ? 'var(--olight)' : s.done ? 'var(--glight)' : 'var(--bg)',
                  border: s.next ? '1.5px solid var(--omid)' : s.done ? '1px solid var(--gmid)' : '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: s.done ? 'var(--green)' : s.next ? 'var(--orange)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`ti ${s.done ? 'ti-check' : s.next ? 'ti-clock' : 'ti-calendar'}`}
                      style={{ fontSize: 11, color: s.done || s.next ? '#fff' : 'var(--text3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.next ? 'var(--orange)' : 'var(--text)' }}>
                      {s.type === 'chemo' ? 'Chemioterapia' : 'Radioterapia'}
                      {s.next ? ' — następna' : s.done ? ' — zakończona' : ''}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 6 }}>{s.date}</span>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                    background: s.type === 'chemo' ? 'rgba(232,115,42,0.15)' : 'rgba(45,125,90,0.15)',
                    color: s.type === 'chemo' ? 'var(--orange)' : 'var(--green)',
                  }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="scroll">
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
            {day.label}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 0 }}>
            {day.sub}
          </p>
        </div>

        {selectedMeta.treatment === 'chemo' && (
          <div style={{
            background: 'var(--rlight)', border: '1px solid var(--red)',
            borderRadius: 12, padding: '8px 12px', marginBottom: 12,
            display: 'flex', gap: 7, alignItems: 'center',
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 13, color: 'var(--red)', flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, margin: 0 }}>
              Dzień wlewu — dieta okołowlewowa. Unikaj ciężkich posiłków 3h przed wlewem.
            </p>
          </div>
        )}

        {isHistory && totalKcal > 0 && (
          <div style={{
            background: 'var(--glight)', border: '1px solid var(--gmid)',
            borderRadius: 12, padding: '8px 12px', marginBottom: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <i className="ti ti-chart-pie" style={{ fontSize: 13, color: 'var(--green)', flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--green)', margin: 0 }}>Spożyto łącznie tego dnia</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
              {Math.round(totalKcal * 0.85)} kcal
            </span>
          </div>
        )}

        {day.meals.map((m) => (
          <div key={m.type} className="cal-meal-item">
            <div className="cmi-emoji">{m.emoji}</div>
            <div className="cmi-info">
              <div className="cmi-type">{m.type}</div>
              <div className="cmi-name">{m.name}</div>
              {m.kcal > 0 && <div className="cmi-kcal">{m.kcal} kcal</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {BADGE_ICON[m.badge] && (
                <i className={`ti ${BADGE_ICON[m.badge]}`} style={{
                  fontSize: 11,
                  color: m.bc === 'g' ? 'var(--green)' : m.bc === 'o' ? 'var(--orange)' : 'var(--text3)',
                }} />
              )}
              <span className={`cmi-badge ${m.bc}`}>{m.badge}</span>
            </div>
          </div>
        ))}

        {(selectedDay === 'fri' || selectedDay === 'wed') && (
          <button className="orange-btn" style={{ marginTop: 8 }} onClick={() => navigate('order')}>
            Zamów na piątek, 8 maja →
          </button>
        )}
      </div>

      <Navbar active="plan" navigate={navigate} />
    </div>
  );
}
