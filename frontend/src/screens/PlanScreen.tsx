import { useState } from 'react';
import Navbar from '../components/Navbar';
import type { Screen } from '../types';
import { planDays } from '../data';

interface Props {
  navigate: (s: Screen) => void;
}

const DAYS = [
  { key: 'mon', short: 'Pon', num: '28' },
  { key: 'tue', short: 'Wt', num: '29' },
  { key: 'wed', short: 'Śr', num: '30', today: true },
  { key: 'thu', short: 'Czw', num: '01', chemo: true },
  { key: 'fri', short: 'Pt', num: '02' },
  { key: 'sat', short: 'Sob', num: '03' },
  { key: 'sun', short: 'Nd', num: '04' },
];

export default function PlanScreen({ navigate }: Props) {
  const [selectedDay, setSelectedDay] = useState('wed');
  const day = planDays[selectedDay] ?? planDays.wed;

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Plan tygodnia</h1></div>
      </div>

      <div className="week-bar">
        {DAYS.map((d) => (
          <button
            key={d.key}
            className={`dp ${selectedDay === d.key ? 'on' : ''} ${d.chemo ? 'chemo' : ''}`}
            onClick={() => setSelectedDay(d.key)}
          >
            <span>{d.short}</span>
            <span className="dn">{d.num}</span>
            {(d.today || d.chemo) && (
              <div
                className="wdot"
                style={d.chemo && selectedDay !== d.key ? { background: 'var(--red)' } : undefined}
              />
            )}
          </button>
        ))}
      </div>

      <div className="scroll">
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
          {day.label}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12 }}>
          {day.sub}
        </p>

        {day.meals.map((m, i) => (
          <div key={i} className="cal-meal-item">
            <div className="cmi-emoji">{m.emoji}</div>
            <div className="cmi-info">
              <div className="cmi-type">{m.type}</div>
              <div className="cmi-name">{m.name}</div>
              {m.kcal > 0 && <div className="cmi-kcal">{m.kcal} kcal</div>}
            </div>
            <span className={`cmi-badge ${m.bc}`}>{m.badge}</span>
          </div>
        ))}

        <button className="orange-btn" style={{ marginTop: 8 }} onClick={() => navigate('order')}>
          Zamów na pojutrze →
        </button>
      </div>

      <Navbar active="plan" navigate={navigate} />
    </div>
  );
}
