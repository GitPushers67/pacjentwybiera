import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, Meal, PlanDay } from '../types';
import {
  getToday, addDays,
  formatDateShortPL, formatDateForAPI,
  getOption,
} from '../utils';
import { fetchMenuForDate } from '../api';
import TopbarDate from '../components/TopbarDate';

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  orderMeals: Meal[] | null;
}

const PL_SHORT = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

const PAST_LABELS: Record<number, string> = {
  [-1]: 'Posiłki z wczoraj',
  [-2]: 'Posiłki sprzed 2 dni',
  [-3]: 'Posiłki sprzed 3 dni',
  [-4]: 'Posiłki sprzed 4 dni',
};

const BADGE_ICON: Record<string, string> = {
  zjedzone:       'ti-check',
  'częściowo':    'ti-circle-half',
  'nie zjedzone': 'ti-x',
  zamówiono:      'ti-circle-check',
  wybrane:        'ti-check',
  oczekuje:       'ti-clock',
  wkrótce:        'ti-lock',
  rekomendowane:  'ti-star',
};

const BADGE_LABEL: Record<string, string> = {
  'zjedzone':      'Zjedzone',
  'częściowo':     'Częściowo zjedzone',
  'nie zjedzone':  'Niezjedzone',
  'zamówiono':     'Zamówiono',
  'wybrane':       'Wybrane',
  'oczekuje':      'Oczekuje',
  'wkrótce':       'Wkrótce',
  'rekomendowane': 'Rekomendowane',
};

type PastBadge = { badge: string; bc: 'g' | 'o' | '' };

const PAST_DAY_BADGES: Record<number, PastBadge[]> = {
  [-4]: [
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'częściowo',    bc: 'o' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'nie zjedzone', bc: ''  },
    { badge: 'zjedzone',     bc: 'g' },
  ],
  [-1]: [
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'częściowo',    bc: 'o' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'nie zjedzone', bc: ''  },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
  ],
  [-2]: [
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'częściowo',    bc: 'o' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'nie zjedzone', bc: ''  },
    { badge: 'zjedzone',     bc: 'g' },
  ],
  [-3]: [
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'nie zjedzone', bc: ''  },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'częściowo',    bc: 'o' },
    { badge: 'zjedzone',     bc: 'g' },
    { badge: 'zjedzone',     bc: 'g' },
  ],
};


function apiMealsToPlanMeals(
  meals: Meal[],
  badge: string,
  bc: 'g' | 'o' | '' | 'p',
  choicesMap?: Record<string, number>,
) {
  return meals.map((m) => {
    const opt = choicesMap ? getOption(m, choicesMap[m.id] ?? 0) : m.options[0];
    return { emoji: opt.emoji, type: m.title, name: opt.name, kcal: opt.kcal, protein: opt.protein, carbs: opt.carbs, fat: opt.fat, badge, bc };
  });
}

export default function PlanScreen({ navigate, choices, orderMeals }: Props) {
  const today = useMemo(() => getToday(), []);

  const [selectedOffset, setSelectedOffset] = useState(0);
  const [fetchedMeals, setFetchedMeals] = useState<Record<number, Meal[] | null>>({});
  const [expandedMacros, setExpandedMacros] = useState<Set<string>>(new Set());

  useEffect(() => {
    [-4, -3, -2, -1, 0, 1].forEach((offset) => {
      fetchMenuForDate(formatDateForAPI(addDays(today, offset))).then((meals) =>
        setFetchedMeals((prev) => ({ ...prev, [offset]: meals })),
      );
    });
  }, [today]);

  useEffect(() => {
    setExpandedMacros(new Set());
  }, [selectedOffset]);

  function toggleMacro(type: string) {
    setExpandedMacros((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  const dayEntries = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const offset = i - 4;
      const d = addDays(today, offset);
      const dow = d.getDay();
      return {
        offset,
        date: d,
        short: PL_SHORT[dow],
        num: String(d.getDate()),
        isChemo: d.getDay() === 4,
      };
    }),
  [today]);

  const selectedDate = addDays(today, selectedOffset);
  const hasOrdered = orderMeals !== null && Object.keys(choices).length > 0;

  // Compute the plan data for the selected day
  const day: PlanDay = useMemo(() => {
    if (selectedOffset >= -4 && selectedOffset <= -1) {
      const meals = fetchedMeals[selectedOffset];
      return {
        label: PAST_LABELS[selectedOffset],
        sub: formatDateShortPL(selectedDate),
        meals: meals
          ? meals.map((m, i) => {
              const opt = m.options[0];
              const { badge, bc } = PAST_DAY_BADGES[selectedOffset]?.[i] ?? { badge: 'zjedzone', bc: 'g' as const };
              return { emoji: opt.emoji, type: m.title, name: opt.name, kcal: opt.kcal, protein: opt.protein, carbs: opt.carbs, fat: opt.fat, badge, bc };
            })
          : [],
      };
    }

    if (selectedOffset === 0) {
      const meals = fetchedMeals[0];
      return {
        label: 'Dzisiejsze menu',
        sub: 'Posiłki zostały zamówione wcześniej — serwowane dziś',
        meals: meals
          ? apiMealsToPlanMeals(meals, 'zamówiono', 'g')
          : [],
      };
    }

    if (selectedOffset === 1) {
      const meals = fetchedMeals[1];
      if (meals) {
        return {
          label: `Posiłki na ${formatDateShortPL(selectedDate)}`,
          sub: 'Zamówione — zostaną dostarczone jutro',
          meals: apiMealsToPlanMeals(meals, 'zamówiono', 'g'),
        };
      }
      return {
        label: `Posiłki na ${formatDateShortPL(selectedDate)}`,
        sub: 'Ładowanie menu…',
        meals: [],
      };
    }

    if (selectedOffset === 2) {
      if (hasOrdered) {
        return {
          label: `Posiłki na ${formatDateShortPL(selectedDate)}`,
          sub: 'Twój wybór — zamówienie złożone',
          meals: apiMealsToPlanMeals(orderMeals!, 'wybrane', 'g', choices),
        };
      }
      return {
        label: `Zamów na ${formatDateShortPL(selectedDate)}`,
        sub: 'Zamówienie otwarte — wybierz posiłki do 20:00',
        meals: [
          { emoji: '?', type: 'Śniadanie',    name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'II Śniadanie', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'Obiad',        name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'Podwieczorek', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'Kolacja',      name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'Koktajl',      name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
          { emoji: '?', type: 'OnkoShot',     name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
        ],
      };
    }

    // offset === 3
    return {
      label: `Posiłki na ${formatDateShortPL(selectedDate)}`,
      sub: 'Zamówienie dostępne wkrótce',
      meals: [
        { emoji: '—', type: 'Śniadanie',    name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'II Śniadanie', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'Obiad',        name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'Podwieczorek', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'Kolacja',      name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'Koktajl',      name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
        { emoji: '—', type: 'OnkoShot',     name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: '' },
      ],
    };
  }, [selectedOffset, selectedDate, fetchedMeals, hasOrdered, orderMeals, choices]);

  const isHistory = selectedOffset < 0;
  const totalKcal = day.meals.reduce((s, m) => s + m.kcal, 0);
  const isSelectedChemo = dayEntries.find((d) => d.offset === selectedOffset)?.isChemo ?? false;

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Plan posiłków</h1></div>
        <TopbarDate />
      </div>

      {/* ── 7-day bar ─────────────────────────────────────── */}
      <div className="week-bar">
        {dayEntries.map(({ offset, short, num, isChemo }) => (
          <button
            key={offset}
            className={`dp ${selectedOffset === offset ? 'on' : ''} ${offset === 0 ? 'today-day' : ''} ${offset < 0 ? 'past-day' : ''}`}
            onClick={() => setSelectedOffset(offset)}
          >
            <span>{short}</span>
            <span className="dn">{num}</span>
            {offset === 0
              ? <span className="today-lbl">Dziś</span>
              : <div style={{ height: 10 }} />
            }
            {isChemo && <div className="treat-dot treat-chemo" />}
            {offset === 2 && <div className="treat-dot" style={{ background: 'var(--orange)' }} />}
          </button>
        ))}
      </div>

      {isSelectedChemo && (
        <div style={{
          margin: '0 16px 8px',
          padding: '5px 10px',
          background: 'rgba(129,140,248,0.08)',
          borderRadius: 9,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 600 }}>Chemioterapia</span>
        </div>
      )}

      <div className="scroll">
        {/* ── Day header ────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
            {day.label}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 0 }}>
            {day.sub}
          </p>
        </div>

        {/* ── History kcal summary ───────────────────────── */}
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

        {/* ── Meal list ──────────────────────────────────── */}
        {day.meals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
            <i className="ti ti-loader-2 cam-spin" style={{ fontSize: 22, display: 'block', margin: '0 auto 8px' }} />
            Ładowanie menu…
          </div>
        )}

        {day.meals.map((m) => (
          <div key={m.type} className="cal-meal-item">
            <div className="cmi-top-row">
              <div className="cmi-info">
                <div className="cmi-type">{m.type}</div>
                <div className="cmi-name">{m.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {BADGE_ICON[m.badge] && (
                    <i className={`ti ${BADGE_ICON[m.badge]}`} style={{
                      fontSize: 11,
                      color: m.bc === 'g' ? 'var(--green)' : m.bc === 'o' ? 'var(--orange)' : 'var(--text3)',
                    }} />
                  )}
                  <span className={`cmi-badge ${m.bc}`}>{BADGE_LABEL[m.badge] ?? m.badge}</span>
                </div>
                {m.kcal > 0 && (
                  <button
                    onClick={() => toggleMacro(m.type)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 33, height: 33, borderRadius: 9, cursor: 'pointer',
                      border: expandedMacros.has(m.type) ? '1.5px solid var(--omid)' : '1.5px solid var(--border)',
                      background: expandedMacros.has(m.type) ? 'var(--olight)' : 'var(--bg)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <i
                      className="ti ti-chart-bar"
                      style={{
                        fontSize: 19,
                        color: expandedMacros.has(m.type) ? 'var(--orange)' : 'var(--text3)',
                      }}
                    />
                  </button>
                )}
              </div>
            </div>
            {m.kcal > 0 && expandedMacros.has(m.type) && (
              <div className="cmi-macros">
                {[
                  { val: m.kcal,    lbl: 'kcal',   cls: 'mc-kcal' },
                  { val: m.protein, lbl: 'białko',  cls: 'mc-prot' },
                  { val: m.carbs,   lbl: 'węgle',   cls: 'mc-carb' },
                  { val: m.fat,     lbl: 'tłuszcz', cls: 'mc-fat'  },
                ].map(({ val, lbl, cls }) => val != null && (
                  <div key={lbl} className="cmi-macro">
                    <div className={`cmi-mc ${cls}`}>{val}</div>
                    <span className="cmi-ml">{lbl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ── CTA for orderable day ─────────────────────── */}
        {selectedOffset === 2 && !hasOrdered && (
          <button className="orange-btn" style={{ marginTop: 8 }} onClick={() => navigate('order')}>
            Wybierz dania →
          </button>
        )}
      </div>

      <Navbar active="plan" navigate={navigate} />
    </div>
  );
}
