import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, Meal, PlanDay, PlanMeal, SymptomHistoryEntry } from '../types';
import {
  getToday, addDays,
  formatDateShortPL, formatDateForAPI,
  getOption,
} from '../utils';
import { fetchMenuForDateCached } from '../api';
import TopbarDate from '../components/TopbarDate';
import { getMealLogsRange, type MealLog } from '../services/mealLogs';

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  orderMeals: Meal[] | null;
  symptomHistory: SymptomHistoryEntry[];
  streak?: number;
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


const MEAL_HOURS: Record<string, number> = {
  'OnkoShot':     7,
  'Śniadanie':    8,
  'II Śniadanie': 10,
  'Koktajl':      12,
  'Obiad':        13,
  'Podwieczorek': 16,
  'Kolacja':      19,
};

const MEAL_MINUTES: Record<string, number> = {
  'OnkoShot':     0,
  'Śniadanie':    0,
  'II Śniadanie': 30,
  'Koktajl':      0,
  'Obiad':        0,
  'Podwieczorek': 0,
  'Kolacja':      0,
};

const SYM_LABELS: Record<string, string> = {
  nausea:   'Nudności',
  diarrhea: 'Biegunka',
  const:    'Zaparcia',
  mouth:    'Ból jamy ustnej',
  taste:    'Brak smaku',
  metal:    'Metaliczny posmak',
  fatigue:  'Zmęczenie',
  appetite: 'Brak apetytu',
  dryness:  'Suchość w ustach',
};

const SYM_ICONS: Record<string, string> = {
  nausea:   'ti-mood-sick',
  diarrhea: 'ti-ripple',
  const:    'ti-alert-circle',
  mouth:    'ti-bandage',
  taste:    'ti-eye-off',
  metal:    'ti-thermometer',
  fatigue:  'ti-zzz',
  appetite: 'ti-bowl',
  dryness:  'ti-droplets',
};

type TimelineEntry =
  | { kind: 'meal'; hour: number; minute: number; meal: PlanMeal }
  | { kind: 'symptom'; hour: number; minute: number; key: string; scale: number; note?: string };

function buildTimeline(
  meals: PlanMeal[],
  symptomHistory: SymptomHistoryEntry[],
  selectedDate: Date,
): TimelineEntry[] {
  const entries: TimelineEntry[] = meals.map(m => ({
    kind: 'meal' as const,
    hour: MEAL_HOURS[m.type] ?? 12,
    minute: MEAL_MINUTES[m.type] ?? 0,
    meal: m,
  }));

  const dateStr = selectedDate.toDateString();
  for (const e of symptomHistory) {
    const d = new Date(e.addedAt);
    if (d.toDateString() === dateStr) {
      entries.push({ kind: 'symptom', hour: d.getHours(), minute: d.getMinutes(), key: e.key, scale: e.scale, note: e.note });
    }
  }

  return entries.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

function statusToBadge(status: MealLog['status']): { badge: string; bc: 'g' | 'o' | '' } {
  switch (status) {
    case 'eaten':     return { badge: 'zjedzone',     bc: 'g' };
    case 'partial':   return { badge: 'częściowo',    bc: 'o' };
    case 'not_eaten': return { badge: 'nie zjedzone', bc: ''  };
    default:          return { badge: 'oczekuje',     bc: 'o' };
  }
}

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

export default function PlanScreen({ navigate, choices, orderMeals, symptomHistory }: Props) {
  const today = useMemo(() => getToday(), []);

  const [selectedOffset, setSelectedOffset] = useState(0);
  const [fetchedMeals, setFetchedMeals] = useState<Record<number, Meal[] | null>>({});
  const [expandedMacros, setExpandedMacros] = useState<Set<string>>(new Set());
  const [pastLogs, setPastLogs] = useState<Record<string, MealLog[]>>({});

  useEffect(() => {
    [-3, -2, -1, 0, 1, 2].forEach((offset) => {
      fetchMenuForDateCached(formatDateForAPI(addDays(today, offset))).then((meals) =>
        setFetchedMeals((prev) => ({ ...prev, [offset]: meals })),
      );
    });
    const from = formatDateForAPI(addDays(today, -3));
    const to   = formatDateForAPI(addDays(today, 2));
    getMealLogsRange(from, to).then((logs) => {
      const grouped: Record<string, MealLog[]> = {};
      for (const log of logs) {
        if (!grouped[log.date]) grouped[log.date] = [];
        grouped[log.date].push(log);
      }
      setPastLogs(grouped);
    });
  }, [today]);

  function selectOffset(offset: number) {
    setSelectedOffset(offset);
    setExpandedMacros(new Set());
  }

  function toggleMacro(type: string) {
    setExpandedMacros((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

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
        isChemo: d.getDay() === 4,
      };
    }),
  [today]);

  const selectedDate = addDays(today, selectedOffset);
  const hasOrdered = orderMeals !== null && Object.keys(choices).length > 0;
  const orderingDateStr = formatDateForAPI(addDays(today, 2));
  const isOrdered = hasOrdered || (pastLogs[orderingDateStr] ?? []).length > 0;

  const day: PlanDay = useMemo(() => {
    if (selectedOffset >= -3 && selectedOffset <= -1) {
      const apiMeals = fetchedMeals[selectedOffset];
      const dateStr = formatDateForAPI(selectedDate);
      const logsForDay = pastLogs[dateStr] ?? [];
      return {
        label: PAST_LABELS[selectedOffset],
        sub: formatDateShortPL(selectedDate),
        meals: apiMeals
          ? apiMeals.map((m) => {
              const log = logsForDay.find((l) => l.meal_slot === m.title);
              const opt = log ? (m.options[log.option_index] ?? m.options[0]) : m.options[0];
              const { badge, bc } = log ? statusToBadge(log.status) : { badge: 'oczekuje', bc: 'o' as const };
              return { emoji: opt.emoji, type: m.title, name: opt.name, kcal: opt.kcal, protein: opt.protein, carbs: opt.carbs, fat: opt.fat, badge, bc };
            })
          : [],
      };
    }

    if (selectedOffset === 0) {
      const apiMeals = fetchedMeals[0];
      const dateStr = formatDateForAPI(selectedDate);
      const logsForDay = pastLogs[dateStr] ?? [];
      return {
        label: 'Dzisiejsze menu',
        sub: formatDateShortPL(selectedDate),
        meals: apiMeals
          ? apiMeals.map((m) => {
              const log = logsForDay.find((l) => l.meal_slot === m.title);
              const opt = log ? (m.options[log.option_index] ?? m.options[0]) : m.options[0];
              const { badge, bc } = log ? statusToBadge(log.status) : { badge: 'oczekuje', bc: 'o' as const };
              return { emoji: opt.emoji, type: m.title, name: opt.name, kcal: opt.kcal, protein: opt.protein, carbs: opt.carbs, fat: opt.fat, badge, bc };
            })
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
      const apiMeals2 = fetchedMeals[2];
      const logsForDay2 = pastLogs[orderingDateStr] ?? [];

      if (isOrdered) {
        const meals = logsForDay2.length > 0 && apiMeals2
          ? apiMeals2.map((m) => {
              const log = logsForDay2.find((l) => l.meal_slot === m.title);
              const opt = log ? (m.options[log.option_index] ?? m.options[0]) : m.options[0];
              return { emoji: opt.emoji, type: m.title, name: opt.name, kcal: opt.kcal, protein: opt.protein, carbs: opt.carbs, fat: opt.fat, badge: 'zamówiono', bc: 'g' as const };
            })
          : apiMealsToPlanMeals(orderMeals!, 'zamówiono', 'g', choices);
        return {
          label: `Posiłki na ${formatDateShortPL(selectedDate)}`,
          sub: 'Zamówienie złożone — możesz edytować do 20:00',
          meals,
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
  }, [selectedOffset, selectedDate, fetchedMeals, isOrdered, orderMeals, choices, pastLogs, orderingDateStr]);

  const timeline = useMemo(() => {
    if (selectedOffset > 0) return [];
    return buildTimeline(day.meals, symptomHistory, selectedDate);
  }, [day.meals, selectedOffset, symptomHistory, selectedDate]);

  const showTimeline = selectedOffset <= 0;
  const isSelectedChemo = dayEntries.find((d) => d.offset === selectedOffset)?.isChemo ?? false;

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Plan posiłków</h1></div>
        <TopbarDate navigate={navigate} />
      </div>

      {/* ── 7-day bar ─────────────────────────────────────── */}
      <div className="week-bar">
        {dayEntries.map(({ offset, short, num, isChemo }) => (
          <button
            key={offset}
            className={`dp ${selectedOffset === offset ? 'on' : ''} ${offset === 0 ? 'today-day' : ''} ${offset < 0 ? 'past-day' : ''}`}
            onClick={() => selectOffset(offset)}
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

        {/* ── Loading state ──────────────────────────────── */}
        {day.meals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
            <i className="ti ti-loader-2 cam-spin" style={{ fontSize: 22, display: 'block', margin: '0 auto 8px' }} />
            Ładowanie menu…
          </div>
        )}

        {/* ── Timeline (dziś + historia) ────────────────── */}
        {showTimeline && timeline.length > 0 && (
          <div>
            {timeline.map((entry, i) => {
              const timeStr = `${String(entry.hour).padStart(2, '0')}:${String(entry.minute).padStart(2, '0')}`;
              const isLast = i === timeline.length - 1;
              const isPast = selectedOffset < 0 || (selectedOffset === 0 && entry.hour < new Date().getHours());

              if (entry.kind === 'meal') {
                const m = entry.meal;
                return (
                  <div key={`meal-${m.type}`} style={{ display: 'flex', gap: 0 }}>
                    {/* Oś czasu — identyczna jak w HomeScreen */}
                    <div style={{ width: 32, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 9 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', marginBottom: 3, lineHeight: 1, whiteSpace: 'nowrap' }}>
                        {timeStr}
                      </span>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: isPast ? 'var(--green)' : 'var(--bg)',
                        border: isPast ? '2px solid var(--green)' : '2px solid var(--border)',
                        flexShrink: 0, zIndex: 1,
                      }} />
                      {!isLast && (
                        <div style={{ width: 1, flex: 1, minHeight: 12, background: isPast ? 'var(--gmid)' : 'var(--border)', marginTop: 3 }} />
                      )}
                    </div>
                    {/* Kafelek — oryginalny styl .cal-meal-item */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 6, minWidth: 0 }}>
                      <div className="cal-meal-item" style={{ marginBottom: 0 }}>
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
                                <i className="ti ti-chart-bar" style={{ fontSize: 19, color: expandedMacros.has(m.type) ? 'var(--orange)' : 'var(--text3)' }} />
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
                    </div>
                  </div>
                );
              }

              // symptom entry
              const { key, scale, note } = entry;
              const badgeCls = scale >= 67 ? 'high' : scale >= 34 ? 'mid' : 'low';
              const badgeLbl = scale >= 67 ? 'Bardzo silny' : scale >= 34 ? 'Silny' : 'Słaby';
              const symLabel = SYM_LABELS[key] ?? (key.startsWith('custom_') ? key.slice(7) : key);
              const symIcon = SYM_ICONS[key] ?? 'ti-activity';
              const symColor = scale >= 67 ? 'var(--red)' : scale >= 34 ? 'var(--amber)' : 'var(--green)';
              const symDotBg = scale >= 67 ? 'var(--red)' : scale >= 34 ? 'var(--amber)' : 'var(--green)';

              return (
                <div key={`sym-${i}-${key}`} style={{ display: 'flex', gap: 0 }}>
                  <div style={{ width: 32, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 9 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text3)', marginBottom: 3, lineHeight: 1, whiteSpace: 'nowrap' }}>
                      {timeStr}
                    </span>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: symDotBg, border: `2px solid ${symDotBg}`, flexShrink: 0, zIndex: 1 }} />
                    {!isLast && (
                      <div style={{ width: 1, flex: 1, minHeight: 12, background: 'var(--border)', marginTop: 3 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 6, minWidth: 0 }}>
                    <div className="tl-sym-card">
                      <div className="tl-sym-row">
                        <i className={`ti ${symIcon}`} style={{ fontSize: 13, color: symColor, flexShrink: 0 }} />
                        <span className="tl-sym-name">{symLabel}</span>
                        <span className={`tl-sym-badge ${badgeCls}`}>{badgeLbl}</span>
                      </div>
                      {note && <div className="tl-sym-note">{note}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Flat list (przyszłe dni) ───────────────────── */}
        {!showTimeline && day.meals.map((m) => (
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
        {selectedOffset === 2 && !isOrdered && (
          <button className="orange-btn" style={{ marginTop: 8 }} onClick={() => navigate('order')}>
            Wybierz dania →
          </button>
        )}
        {selectedOffset === 2 && isOrdered && (
          <button
            style={{
              marginTop: 8, width: '100%', padding: '13px 0', borderRadius: 14,
              border: '1.5px solid var(--omid)', background: 'var(--bg)',
              color: 'var(--orange)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
            onClick={() => navigate('order')}
          >
            <i className="ti ti-edit" style={{ fontSize: 15 }} />
            Edytuj zamówienie
          </button>
        )}
      </div>

      <Navbar active="plan" navigate={navigate} />
    </div>
  );
}
