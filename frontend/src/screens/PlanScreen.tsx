import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, Meal, PlanDay } from '../types';
import {
  getToday, addDays,
  getOrderableDate, formatDateLongPL, formatDateShortPL, formatDateForAPI,
  getOption,
} from '../utils';
import { fetchMenuForDate } from '../api';

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

const TREATMENT_SESSIONS = [
  { date: '7 kwi', label: 'Chemo', type: 'chemo', done: true },
  { date: '28 kwi', label: 'Chemo', type: 'chemo', done: true },
  { date: '7 maj', label: 'Chemo', type: 'chemo', done: true },
  { date: '21 maj', label: 'Chemo', type: 'chemo', done: false, next: true },
  { date: '11 cze', label: 'Radio', type: 'radio', done: false },
  { date: '25 cze', label: 'Radio', type: 'radio', done: false },
];

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
  const orderDate = useMemo(() => getOrderableDate(), []);

  const [selectedOffset, setSelectedOffset] = useState(0);
  const [fetchedMeals, setFetchedMeals] = useState<Record<number, Meal[] | null>>({});
  const [showTreatments, setShowTreatments] = useState(false);

  useEffect(() => {
    [-3, -2, -1, 0, 1].forEach((offset) => {
      fetchMenuForDate(formatDateForAPI(addDays(today, offset))).then((meals) =>
        setFetchedMeals((prev) => ({ ...prev, [offset]: meals })),
      );
    });
  }, [today]);

  const dayEntries = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const offset = i - 3;
      const d = addDays(today, offset);
      const dow = d.getDay();
      return {
        offset,
        date: d,
        short: PL_SHORT[dow],
        num: String(d.getDate()),
        isChemo: d.getDay() === 4 && offset < 0,
      };
    }),
  [today]);

  const selectedDate = addDays(today, selectedOffset);
  const hasOrdered = orderMeals !== null && Object.keys(choices).length > 0;

  // Compute the plan data for the selected day
  const day: PlanDay = useMemo(() => {
    if (selectedOffset >= -3 && selectedOffset <= -1) {
      const meals = fetchedMeals[selectedOffset];
      return {
        label: PAST_LABELS[selectedOffset],
        sub: formatDateShortPL(selectedDate),
        meals: meals
          ? apiMealsToPlanMeals(meals, 'zjedzone', 'g')
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
  const nextSession = TREATMENT_SESSIONS.find((s) => s.next);
  const selectedEntry = dayEntries.find((d) => d.offset === selectedOffset)!;

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Plan posiłków</h1></div>
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

      {/* ── Order banner ──────────────────────────────────── */}
      <div
        style={{
          margin: '0 16px 10px',
          background: 'var(--olight)', border: '1.5px solid var(--omid)',
          borderRadius: 11, padding: '8px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => navigate('order')}
      >
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <i className="ti ti-shopping-cart" style={{ fontSize: 13, color: 'var(--orange)', flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: 'var(--text)', margin: 0 }}>
            {hasOrdered
              ? <>Zmień zamówienie na: <strong style={{ color: 'var(--orange)' }}>{formatDateShortPL(orderDate)}</strong></>
              : <>Zamów na: <strong style={{ color: 'var(--orange)' }}>{formatDateShortPL(orderDate)}</strong></>
            }
          </p>
        </div>
        <i className="ti ti-chevron-right" style={{ fontSize: 13, color: 'var(--orange)' }} />
      </div>

      {/* ── Treatment notice ──────────────────────────────── */}
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
        {/* ── Day header ────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
            {day.label}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 0 }}>
            {day.sub}
          </p>
        </div>

        {/* ── Chemo day warning (past Thursday) ─────────── */}
        {selectedEntry.isChemo && (
          <div style={{
            background: 'var(--rlight)', border: '1px solid var(--red)',
            borderRadius: 12, padding: '8px 12px', marginBottom: 12,
            display: 'flex', gap: 7, alignItems: 'center',
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 13, color: 'var(--red)', flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, margin: 0 }}>
              Dzień wlewu — dieta okołowlewowa. Posiłki dobrane specjalnie pod chemioterapię.
            </p>
          </div>
        )}

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                {BADGE_ICON[m.badge] && (
                  <i className={`ti ${BADGE_ICON[m.badge]}`} style={{
                    fontSize: 11,
                    color: m.bc === 'g' ? 'var(--green)' : m.bc === 'o' ? 'var(--orange)' : 'var(--text3)',
                  }} />
                )}
                <span className={`cmi-badge ${m.bc}`}>{m.badge}</span>
              </div>
            </div>
            {m.kcal > 0 && (
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
            Wybierz posiłki na {formatDateShortPL(selectedDate)} →
          </button>
        )}

        <button
          className="orange-btn"
          style={{ marginTop: selectedOffset === 2 && !hasOrdered ? 6 : 8, opacity: 0.85 }}
          onClick={() => navigate('order')}
        >
          {hasOrdered
            ? `Zmień zamówienie na ${formatDateLongPL(orderDate)} →`
            : `Zamów na ${formatDateLongPL(orderDate)} →`
          }
        </button>
      </div>

      <Navbar active="plan" navigate={navigate} />
    </div>
  );
}
