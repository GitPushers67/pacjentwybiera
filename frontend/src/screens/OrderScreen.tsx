import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import type { Screen, Meal, PatientProfile, SymptomHistoryEntry, EatenStatus } from "../types";
import { meals as fallbackMeals } from "../data";
import { getOption, getOrderableDate, formatDateForAPI, formatDateLongPL } from "../utils";
import { fetchMenuForDateCached, fetchAiRecommendation } from "../api";
import TopbarDate from "../components/TopbarDate";
import { upsertMealLog, getMealLogs } from "../services/mealLogs";
import MealDetailModal from "../components/MealDetailModal";

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  setChoices: (c: Record<string, number>) => void;
  setOrderMeals: (meals: Meal[] | null) => void;
  patient: PatientProfile;
  symptoms: string[];
  symptomHistory: SymptomHistoryEntry[];
  eatenMap: Record<string, EatenStatus>;
  editMode: boolean;
  streak?: number;
}

// ── Swipeable meal slot ────────────────────────────────────────────────────────

interface SlotProps {
  meal: Meal;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  aiIdx?: number;
  aiReason?: string;
  onShowDetail: (idx: number) => void;
}

function MealSlot({ meal, selectedIdx, onSelect, aiIdx, aiReason, onShowDetail }: SlotProps) {
  const [currentView, setCurrentView] = useState(selectedIdx);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dx = useRef(0);
  const dragging = useRef(false);
  const dirLocked = useRef<'h' | 'v' | null>(null);
  const startY = useRef(0);
  const didDrag = useRef(false);

  useEffect(() => { setCurrentView(selectedIdx); setFlipped(false); }, [selectedIdx]);

  const opt = getOption(meal, currentView);
  const isAiRec = aiIdx !== undefined && currentView === aiIdx;
  const isAiAlt = aiIdx !== undefined && currentView !== aiIdx;
  const totalOpts = meal.options.length;

  const swipeTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(totalOpts - 1, idx));
    setCurrentView(clamped);
    onSelect(clamped);
    setFlipped(false);
  }, [totalOpts, onSelect]);
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    didDrag.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dx.current = 0;
    dirLocked.current = null;
    if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    if (!dirLocked.current) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      dirLocked.current = Math.abs(deltaX) >= Math.abs(deltaY) ? 'h' : 'v';
    }
    if (dirLocked.current === 'v') return;
    e.stopPropagation();
    if (Math.abs(deltaX) > 8) didDrag.current = true;
    dx.current = deltaX;
    if (cardRef.current) cardRef.current.style.transform = `translateX(${dx.current * 0.3}px)`;
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease';
      cardRef.current.style.transform = 'translateX(0)';
    }
    if (dx.current < -50 && currentView < totalOpts - 1) swipeTo(currentView + 1);
    else if (dx.current > 50 && currentView > 0) swipeTo(currentView - 1);
    else if (!didDrag.current) {
      // tap — flip karta
      setFlipped(f => !f);
    }
    dx.current = 0;
  };

  const cardBg = '#fff';
  const cardBorder = isAiRec ? '1px solid var(--gmid)' :
                     isAiAlt ? '1px solid var(--omid)' : '1px solid var(--border)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 8, overflow: 'hidden' }}>
      {/* Nagłówek */}
      <div style={{ padding: '9px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{meal.title}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>{meal.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {aiIdx !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: isAiRec ? 'var(--glight)' : 'var(--olight)', border: `1px solid ${isAiRec ? 'var(--gmid)' : 'var(--omid)'}`, borderRadius: 8, padding: '2px 7px' }}>
              <i className="ti ti-brain" style={{ fontSize: 10, color: isAiRec ? 'var(--green)' : 'var(--orange)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: isAiRec ? 'var(--green)' : 'var(--orange)' }}>
                {isAiRec ? 'Wybór AI' : 'Alternatywa'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            {meal.options.map((_, i) => (
              <div key={i} style={{
                width: i === currentView ? 14 : 6, height: 6, borderRadius: 3,
                background: i === currentView ? (aiIdx !== undefined && i === aiIdx ? 'var(--green)' : 'var(--orange)') : 'var(--border)',
                transition: 'all 0.2s', cursor: 'pointer',
              }} onClick={() => swipeTo(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* Flip card */}
      <div style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            cursor: 'pointer',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* PRZÓD */}
          <div style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            padding: '12px 14px',
            background: cardBg,
            border: cardBorder,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35, marginBottom: 6 }}>{opt.name}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span className="tag b">{opt.protein}g białka</span>
                  <span className="tag">{opt.kcal} kcal</span>
                  {opt.tags?.filter(t => t.c === 'g').slice(0, 2).map(t => (
                    <span key={t.t} className="tag g">{t.t}</span>
                  ))}
                  {opt.allergensText && (
                    <span className="tag a" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: 8 }} />alergeny
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onShowDetail(currentView); }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <i className="ti ti-info-circle" style={{ fontSize: 13, color: 'var(--text3)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 8, opacity: 0.4 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 9, color: 'var(--text3)' }} />
              <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {aiIdx !== undefined ? 'dotknij po uzasadnienie AI · przesuń by zmienić' : 'przesuń, by zmienić opcję'}
              </span>
              <i className="ti ti-arrow-right" style={{ fontSize: 9, color: 'var(--text3)' }} />
            </div>
          </div>

          {/* TYŁ — uzasadnienie AI, auto-height */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            padding: '14px',
            background: '#fff',
            border: isAiRec ? '1px solid var(--gmid)' : '1px solid var(--omid)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            minHeight: '100%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <i className="ti ti-brain" style={{ fontSize: 13, color: isAiRec ? 'var(--green)' : 'var(--orange)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: isAiRec ? 'var(--green)' : 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Uzasadnienie AI
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 12px' }}>
              {aiReason
                ? (isAiRec ? aiReason : 'AI rekomendowało inną opcję dla Twoich objawów. Przesuń w lewo, aby zobaczyć rekomendację AI.')
                : 'Brak uzasadnienia AI dla tego dania.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.4 }}>
              <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>dotknij, by wrócić</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function OrderScreen({
  navigate,
  choices,
  setChoices,
  setOrderMeals,
  patient,
  symptoms,
  symptomHistory,
  eatenMap,
  editMode,
}: Props) {
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiApplied, setAiApplied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({});
  const [aiChoices, setAiChoices] = useState<Record<string, number>>({});
  const [globalAiReason, setGlobalAiReason] = useState<string | null>(null);
  const [detailMeal, setDetailMeal] = useState<{ meal: Meal; optionIdx: number } | null>(null);

  const orderDate = useMemo(() => getOrderableDate(), []);
  const orderDateStr = useMemo(() => formatDateForAPI(orderDate), [orderDate]);
  const orderDateDisplay = useMemo(() => formatDateLongPL(orderDate), [orderDate]);

  useEffect(() => {
    Promise.all([fetchMenuForDateCached(orderDateStr), getMealLogs(orderDateStr)]).then(([meals, logs]) => {
      setApiMeals(meals);
      setOrderMeals(meals);
      if (logs.length > 0 && meals) {
        const restored: Record<string, number> = {};
        for (const log of logs) {
          const meal = meals.find((m) => m.title === log.meal_slot);
          if (meal) restored[meal.id] = log.option_index;
        }
        setChoices({ ...choices, ...restored });
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDateStr]);

  const activeMeals = apiMeals ?? fallbackMeals;

  const applyAiRecommendation = async () => {
    setIsAiLoading(true);
    const cleanedMeals = activeMeals.map(meal => ({
      ...meal,
      options: meal.options.map(({ isRec: _r, score: _s, scoreReason: _sr, why: _w, ...rest }) => rest),
    }));
    const result = await fetchAiRecommendation({ patient, symptoms, symptomHistory, eatenMap, activeMeals: cleanedMeals });
    setIsAiLoading(false);
    if (result) {
      const newChoices: Record<string, number> = {};
      const newReasons: Record<string, string> = {};
      for (const [mealId, data] of Object.entries(result.choices || {})) {
        newChoices[mealId] = data.choice;
        newReasons[mealId] = data.reason;
      }
      setChoices({ ...choices, ...newChoices });
      setAiChoices(newChoices);
      setAiReasons(newReasons);
      setGlobalAiReason(result.globalReason);
      setAiApplied(true);
    } else {
      alert("Błąd podczas pobierania rekomendacji z serwera.");
    }
  };

  const handlePlaceOrder = async () => {
    await Promise.all(
      activeMeals.map((meal) => {
        const optIdx = choices[meal.id] ?? 0;
        const opt = getOption(meal, optIdx);
        return upsertMealLog({ date: orderDateStr, meal_slot: meal.title, meal_name: opt.name, option_index: optIdx, status: 'pending' });
      }),
    );
    navigate("confirm");
  };

  const totalProtein = activeMeals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).protein, 0);
  const totalKcal = activeMeals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).kcal, 0);

  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Zamówienie</h1><p>{orderDateDisplay}</p></div>
        <TopbarDate navigate={navigate} />
      </div>

      {/* AI Banner */}
      <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
        <button
          style={{
            width: '100%', padding: '10px 14px',
            background: aiApplied ? 'var(--glight)' : 'var(--olight)',
            border: `1.5px solid ${aiApplied ? 'var(--gmid)' : 'var(--omid)'}`,
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
          onClick={applyAiRecommendation}
          disabled={isAiLoading}
        >
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: aiApplied ? 'var(--green)' : 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`ti ${isAiLoading ? 'ti-loader-2 cam-spin' : aiApplied ? 'ti-check' : 'ti-brain'}`} style={{ fontSize: 15, color: '#fff' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: aiApplied ? 'var(--green)' : 'var(--orange)' }}>
              {isAiLoading ? 'Analizuję Twoje objawy…' : aiApplied ? 'Rekomendacja AI zastosowana' : 'Dopasuj menu do moich objawów'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>
              {aiApplied ? 'Dotknij kartę dania, by zobaczyć uzasadnienie AI' : 'AI przeanalizuje objawy i wybierze najlepsze dania'}
            </div>
          </div>
          {!aiApplied && !isAiLoading && <i className="ti ti-chevron-right" style={{ fontSize: 14, color: 'var(--orange)', flexShrink: 0 }} />}
        </button>
      </div>

      <div className="scroll" style={{ paddingBottom: 90 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 10 }}>
            <i className="ti ti-loader-2 cam-spin" style={{ fontSize: 28, color: 'var(--orange)' }} />
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>Pobieranie menu…</p>
          </div>
        ) : (
          <>
            {apiMeals === null && (
              <div style={{ background: 'var(--alight)', border: '1px solid var(--amber)', borderRadius: 11, padding: '8px 12px', marginBottom: 10, fontSize: 11, color: 'var(--text2)' }}>
                <i className="ti ti-wifi-off" style={{ marginRight: 5 }} />
                Brak połączenia z API — wyświetlam dane lokalne.
              </div>
            )}

            {activeMeals.map((meal) => (
              <MealSlot
                key={meal.id}
                meal={meal}
                selectedIdx={choices[meal.id] ?? 0}
                onSelect={(idx) => setChoices({ ...choices, [meal.id]: idx })}
                aiIdx={aiChoices[meal.id]}
                aiReason={aiReasons[meal.id]}
                onShowDetail={(idx) => setDetailMeal({ meal, optionIdx: idx })}
              />
            ))}

            {/* Podsumowanie */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Podsumowanie zamówienia</div>
              {activeMeals.map((meal) => {
                const opt = getOption(meal, choices[meal.id] ?? 0);
                const isAiMatch = aiChoices[meal.id] !== undefined && aiChoices[meal.id] === (choices[meal.id] ?? 0);
                const isAiMismatch = aiChoices[meal.id] !== undefined && aiChoices[meal.id] !== (choices[meal.id] ?? 0);
                return (
                  <div key={meal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, width: 88 }}>{meal.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'flex-end', paddingLeft: 8, minWidth: 0 }}>
                      {isAiMatch && <i className="ti ti-brain" style={{ fontSize: 10, color: 'var(--green)', flexShrink: 0 }} />}
                      {isAiMismatch && <i className="ti ti-arrows-exchange" style={{ fontSize: 10, color: 'var(--orange)', flexShrink: 0 }} />}
                      <span style={{ fontSize: 11, fontWeight: 600, color: isAiMatch ? 'var(--green)' : isAiMismatch ? 'var(--orange)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{totalProtein}g</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>białko</div>
                </div>
                <div style={{ flex: 1, background: 'var(--olight)', border: '1px solid var(--omid)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>{totalKcal}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>kcal</div>
                </div>
              </div>
              {Object.keys(aiChoices).length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-brain" style={{ fontSize: 10, color: 'var(--green)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>Zgodne z AI</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-arrows-exchange" style={{ fontSize: 10, color: 'var(--orange)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>Zmienione przez Ciebie</span>
                  </div>
                </div>
              )}
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
              Brak wyboru = automat o 20:00
            </p>
          </>
        )}
      </div>

      {/* Sticky przycisk */}
      {!loading && (
        <div style={{ flexShrink: 0, padding: '8px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <button className="orange-btn" style={{ margin: 0, fontSize: 14, fontWeight: 700, padding: '13px' }} onClick={handlePlaceOrder}>
            {editMode ? 'Zapisz zmiany' : 'Złóż zamówienie'}
          </button>
        </div>
      )}

      {detailMeal && (
        <MealDetailModal meal={detailMeal.meal} optionIdx={detailMeal.optionIdx} onClose={() => setDetailMeal(null)} />
      )}

      <Navbar active="order" navigate={navigate} />
    </div>
  );
}
