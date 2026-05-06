import { useState } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, EatenStatus, PatientProfile } from '../types';
import { meals, getDailyTargets } from '../data';
import { getOption } from '../utils';

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  eatenMap: Record<string, EatenStatus>;
  patient: PatientProfile;
}

function eatenRatio(status: EatenStatus): number {
  return status === 'full' ? 1 : 0;
}

function MacroBar({ label, eaten, target, unit }: {
  label: string; eaten: number; target: number; unit: string; color?: string;
}) {
  const pct = Math.min(100, Math.round((eaten / target) * 100));
  return (
    <div className="macro-bar-item">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
          <strong style={{ color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)' }}>
            {Math.round(eaten)}{unit}
          </strong>
          {' / '}{target}{unit} · {pct}%
        </span>
      </div>
      <div className="macro-track">
        <div
          className="macro-fill"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)',
          }}
        />
      </div>
    </div>
  );
}

function MacroCompareBar({ label, eaten, ordered, target, unit }: {
  label: string; eaten: number; ordered: number; target: number; unit: string;
}) {
  const pctEaten   = Math.min(100, (eaten   / target) * 100);
  const pctOrdered = Math.min(100, (ordered / target) * 100);
  return (
    <div className="macro-bar-item">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>cel: <strong style={{ color: 'var(--text)' }}>{target}{unit}</strong></span>
      </div>
      <div className="macro-track" style={{ position: 'relative', height: 8 }}>
        {/* ordered background */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pctOrdered}%`,
          background: 'var(--gmid)',
          borderRadius: 4,
        }} />
        {/* eaten foreground */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pctEaten}%`,
          background: pctEaten >= 80 ? 'var(--green)' : pctEaten >= 50 ? 'var(--amber)' : 'var(--red)',
          borderRadius: 4,
          transition: 'width .4s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: pctEaten >= 50 ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text2)' }}>
            Zjedzone: <strong style={{ color: 'var(--text)' }}>{Math.round(eaten)}{unit}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--gmid)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text2)' }}>
            Gdyby całość: <strong style={{ color: 'var(--text)' }}>{Math.round(ordered)}{unit}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

type Tab = 'today' | 'week';

export default function NutritionScreen({ navigate, choices, eatenMap, patient }: Props) {
  const DAILY_TARGETS = getDailyTargets(patient.weightKg);
  const [tab, setTab] = useState<Tab>('today');

  const eatenMacros = meals.reduce(
    (acc, meal) => {
      const opt = getOption(meal, choices[meal.id] ?? 0);
      const ratio = eatenRatio(eatenMap[meal.id] ?? 'none');
      acc.kcal += opt.kcal * ratio;
      acc.protein += opt.protein * ratio;
      acc.carbs += opt.carbs * ratio;
      acc.fat += opt.fat * ratio;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const orderedMacros = meals.reduce(
    (acc, meal) => {
      const opt = getOption(meal, choices[meal.id] ?? 0);
      acc.kcal += opt.kcal;
      acc.protein += opt.protein;
      acc.carbs += opt.carbs;
      acc.fat += opt.fat;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const weekData = [
    { day: 'Pon', kcal: 1120, target: 1800 },
    { day: 'Wt', kcal: 980, target: 1800 },
    { day: 'Śr', kcal: Math.round(eatenMacros.kcal), target: 1800, today: true },
    { day: 'Czw', kcal: 0, target: 1800 },
    { day: 'Pt', kcal: 0, target: 1800 },
    { day: 'Sob', kcal: 0, target: 1800 },
    { day: 'Nd', kcal: 0, target: 1800 },
  ];

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Odżywianie</h1>
          <p>środa, 7 maja 2026</p>
        </div>
      </div>

      <div className="nutrition-tabs">
        <button className={`ntab ${tab === 'today' ? 'on' : ''}`} onClick={() => setTab('today')}>Dziś</button>
        <button className={`ntab ${tab === 'week' ? 'on' : ''}`} onClick={() => setTab('week')}>Tydzień</button>
      </div>

      <div className="scroll">
        {tab === 'today' && (
          <>
            <div style={{
              background: 'var(--card)',
              borderRadius: 15,
              border: '1px solid var(--border)',
              padding: 14,
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  Makroskładniki dziś
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text2)' }}>Zjedzone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--gmid)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text2)' }}>Gdyby całość</span>
                  </div>
                </div>
              </div>
              <MacroCompareBar label="Kalorie" eaten={eatenMacros.kcal} ordered={orderedMacros.kcal} target={DAILY_TARGETS.kcal} unit=" kcal" />
              <MacroCompareBar label="Białko" eaten={eatenMacros.protein} ordered={orderedMacros.protein} target={DAILY_TARGETS.protein} unit="g" />
              <MacroCompareBar label="Węglowodany" eaten={eatenMacros.carbs} ordered={orderedMacros.carbs} target={DAILY_TARGETS.carbs} unit="g" />
              <MacroCompareBar label="Tłuszcze" eaten={eatenMacros.fat} ordered={orderedMacros.fat} target={DAILY_TARGETS.fat} unit="g" />
            </div>

            <div style={{
              background: 'var(--card)',
              borderRadius: 15,
              border: '1px solid var(--border)',
              padding: 14,
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                Posiłek po posiłku
              </p>
              {meals.map((meal) => {
                const opt = getOption(meal, choices[meal.id] ?? 0);
                const status = eatenMap[meal.id] ?? 'none';
                const ratio = eatenRatio(status);
                const statusLabel = status === 'full' ? 'Zjedzone' : 'Nie zjedzone';
                const statusColor = status === 'full' ? 'var(--green)' : 'var(--text3)';
                return (
                  <div key={meal.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{opt.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{meal.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                        {Math.round(opt.kcal * ratio)} / {opt.kcal} kcal · {Math.round(opt.protein * ratio)}g białka
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'week' && (
          <>
            <div style={{
              background: 'var(--card)',
              borderRadius: 15,
              border: '1px solid var(--border)',
              padding: 14,
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
                Kalorie w tym tygodniu
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                {weekData.map((d) => {
                  const pct = d.kcal > 0 ? Math.min(100, (d.kcal / d.target) * 100) : 0;
                  return (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%',
                        height: `${Math.max(4, pct * 0.6)}px`,
                        background: d.today ? 'var(--orange)' : d.kcal > 0 ? 'var(--green)' : 'var(--border)',
                        borderRadius: 4,
                        alignSelf: 'flex-end',
                      }} />
                      <span style={{ fontSize: 9, color: d.today ? 'var(--orange)' : 'var(--text3)', fontWeight: d.today ? 700 : 400 }}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              background: 'var(--card)',
              borderRadius: 15,
              border: '1px solid var(--border)',
              padding: 14,
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
                Średnie spożycie (tydzień)
              </p>
              {[
                { label: 'Kalorie', avg: 1050, target: 1800, unit: ' kcal' },
                { label: 'Białko', avg: 44, target: 75, unit: 'g' },
                { label: 'Węglowodany', avg: 130, target: 220, unit: 'g' },
                { label: 'Tłuszcze', avg: 32, target: 60, unit: 'g' },
              ].map((m) => (
                <MacroBar key={m.label} label={m.label} eaten={m.avg} target={m.target} unit={m.unit} color="var(--orange)" />
              ))}
            </div>

            <div style={{
              background: 'var(--alight)',
              border: '1px solid #F5C775',
              borderRadius: 13,
              padding: '10px 13px',
              marginBottom: 12,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: 'var(--amber)', marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                  Średnie spożycie białka w tym tygodniu wynosi <strong>59%</strong> celu dobowego. Rozważ koktajl białkowy jako uzupełnienie.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <Navbar active="nutrition" navigate={navigate} />
    </div>
  );
}
