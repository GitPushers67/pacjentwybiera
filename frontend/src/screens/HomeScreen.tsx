import {
  useEffect,
  useState,
  useMemo,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import Navbar from "../components/Navbar";
import type { EatenStatus, Meal, PatientProfile, Screen, MealCardState, NotEatenReason } from "../types";
import { meals as fallbackMeals } from "../data";
import { getToday, formatDateForAPI, addDays } from "../utils";
import { fetchMenuForDateCached } from "../api";
import logo from "../assets/logo.png";
import TopbarDate from "../components/TopbarDate";
import { ensureDayMeals, getMealLogs, updateMealStatus } from "../services/mealLogs";
import MealDetailModal from "../components/MealDetailModal";
import { EatenFeedbackModal, NotEatenFeedbackModal, PartialFeedbackModal } from "../components/MealFeedbackModal";
import { MealActionButtons } from "../components/MealActionButtons";
import { PartialMealBadge } from "../components/PartialMealBadge";

type MealAlternative = {
  name: string;
  tip: string;
  protein: number;
  kcal: number;
};

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  choices: Record<string, number>;
  eatenMap: Record<string, EatenStatus>;
  setEatenMap: Dispatch<SetStateAction<Record<string, EatenStatus>>>;
  patient: PatientProfile;
  favorites: string[];
  onToggleFavorite: (mealId: string) => void;
  streak: number;
  onNotEatenReason?: (mealId: string, reason: NotEatenReason) => void;
  pendingAlternativeMealId?: string | null;
  onAlternativeHandled?: () => void;
}

const MEAL_HOURS: Record<string, number> = {
  shot: 7, breakfast: 8, lunch2: 10, shake: 12, dinner: 13, snack: 16, supper: 19,
};

function getCurrentMealId(): string {
  const h = new Date().getHours();
  if (h < 9) return "breakfast";
  if (h < 12) return "lunch2";
  if (h < 15) return "dinner";
  if (h < 18) return "snack";
  return "supper";
}

interface MealModalState {
  showDetail: boolean;
  showEaten: boolean;
  showNotEaten: boolean;
  showPartial: boolean;
  ateAlternative: boolean;
  alternativeName: string | null;
}

const defaultModalState = (): MealModalState => ({
  showDetail: false, showEaten: false, showNotEaten: false,
  showPartial: false, ateAlternative: false, alternativeName: null,
});

export default function HomeScreen({
  navigate,
  eatenMap,
  setEatenMap,
  choices,
  favorites,
  onToggleFavorite,
  onNotEatenReason,
}: Props) {
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const [mealStates, setMealStates] = useState<Record<string, MealCardState>>({});
  const [mealLogIds, setMealLogIds] = useState<Record<string, string>>({});
  const [modals, setModals] = useState<Record<string, MealModalState>>({});
  // Wybrana alternatywa per posiłek (null = brak)
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, MealAlternative>>({});
  // Status alternatywy per posiłek
  const [altStates, setAltStates] = useState<Record<string, { status: 'pending'|'eaten'|'partial'|'not_eaten'; partialPct: number; showPlate: boolean }>>({});
  // Aktywna strona karty: 0 = oryginał, 1 = alternatywa
  const [cardSide, setCardSide] = useState<Record<string, 0|1>>({});
  const swipeStartXRef = useRef<Record<string, number>>({});
  const swipeDxRef = useRef<Record<string, number>>({});
  const swipeDraggingRef = useRef<Record<string, boolean>>({});
  const swipeDidDragRef = useRef<Record<string, boolean>>({});

  const today = useMemo(() => getToday(), []);
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60;

  useEffect(() => {
    const dateStr = formatDateForAPI(today);
    fetchMenuForDateCached(dateStr).then(async (fetchedMeals) => {
      const mealsForMapping = fetchedMeals ?? fallbackMeals;
      if (fetchedMeals) setApiMeals(fetchedMeals);
      const logs = fetchedMeals
        ? await ensureDayMeals(dateStr, fetchedMeals)
        : await getMealLogs(dateStr);
      const idMap: Record<string, string> = {};
      const states: Record<string, MealCardState> = {};
      for (const log of logs) {
        const meal = mealsForMapping.find((m) => m.title === log.meal_slot);
        if (meal) {
          idMap[meal.id] = log.id;
          states[meal.id] = { status: log.status, partialPct: log.partial_pct ?? 50, showPlate: false };
        }
      }
      setMealLogIds(idMap);
      setMealStates(states);
      const dayAfterTomorrow = formatDateForAPI(addDays(today, 2));
      fetchMenuForDateCached(dayAfterTomorrow).then((futureMeals) => {
        if (futureMeals) ensureDayMeals(dayAfterTomorrow, futureMeals);
      });
    });
  }, [today]);

  const meals = apiMeals ?? fallbackMeals;
  const currentMealId = getCurrentMealId();
  const sortedMeals = [...meals].sort((a, b) => (MEAL_HOURS[a.id] ?? 12) - (MEAL_HOURS[b.id] ?? 12));

  const orderDate = useMemo(() => {
    const d = addDays(today, 2);
    return new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  }, [today]);

  const getMealState = (mealId: string, stateMap = mealStates): MealCardState => {
    const s = stateMap[mealId];
    if (s) return s;
    if (eatenMap[mealId] === "full") return { status: "eaten", partialPct: 100, showPlate: false };
    return { status: "pending", partialPct: 50, showPlate: false };
  };

  const getModal = (mealId: string) => modals[mealId] ?? defaultModalState();
  const setModal = (mealId: string, patch: Partial<MealModalState>) =>
    setModals(prev => ({ ...prev, [mealId]: { ...getModal(mealId), ...patch } }));

  const setStatus = (mealId: string, status: MealCardState['status'], pct?: number) => {
    const partialPct = status === 'eaten' ? 100 : (pct ?? mealStates[mealId]?.partialPct ?? 50);
    setMealStates(prev => ({ ...prev, [mealId]: { ...prev[mealId], status, showPlate: false, partialPct } }));
    setEatenMap(prev => ({ ...prev, [mealId]: status === 'eaten' ? 'full' : 'none' }));
    const logId = mealLogIds[mealId];
    if (logId) updateMealStatus(logId, status, status === 'partial' ? partialPct : undefined);
  };

  const resetStatus = (mealId: string) => {
    setMealStates(prev => ({ ...prev, [mealId]: { status: 'pending', partialPct: 50, showPlate: false } }));
    setEatenMap(prev => ({ ...prev, [mealId]: 'none' }));
  };

  // Aktualny posiłek na górze, reszta posortowana chronologicznie
  const currentMeal = sortedMeals.find(m => m.id === currentMealId);
  const otherMeals = sortedMeals.filter(m => m.id !== currentMealId);

  const renderMealRow = (meal: Meal, isLast: boolean) => {
    const state = getMealState(meal.id);
    const opt = meal.options[choices[meal.id] ?? 0] ?? meal.options[0];
    const isPending = state.status === 'pending';
    const isCurrent = meal.id === currentMealId;
    const mealHour = MEAL_HOURS[meal.id] ?? 12;
    const isPast = mealHour < nowHour - 0.5 && !isCurrent;

    const alt = selectedAlternatives[meal.id] ?? null;
    const side = cardSide[meal.id] ?? 0;
    const altState = altStates[meal.id] ?? { status: 'pending', partialPct: 50, showPlate: false };

    const bodyBg =
      state.status === 'eaten' || state.status === ('eaten_alternative' as string) ? 'var(--meal-green-light-bg)' :
      state.status === 'not_eaten' ? 'var(--meal-red-light-bg)' :
      state.status === 'partial' ? 'var(--meal-orange-light-bg)' :
      'var(--card)';

    const altBodyBg =
      altState.status === 'eaten' ? 'var(--meal-green-light-bg)' :
      altState.status === 'not_eaten' ? 'var(--meal-red-light-bg)' :
      altState.status === 'partial' ? 'var(--meal-orange-light-bg)' :
      'var(--card)';

    const setSide = (s: 0|1) => setCardSide(prev => ({ ...prev, [meal.id]: s }));

    const handlePointerDown = (e: React.PointerEvent) => {
      if (!alt) return;
      swipeDraggingRef.current[meal.id] = true;
      swipeDidDragRef.current[meal.id] = false;
      swipeStartXRef.current[meal.id] = e.clientX;
      swipeDxRef.current[meal.id] = 0;
    };
    const handlePointerMove = (e: React.PointerEvent) => {
      if (!swipeDraggingRef.current[meal.id]) return;
      const deltaX = e.clientX - (swipeStartXRef.current[meal.id] ?? e.clientX);
      swipeDxRef.current[meal.id] = deltaX;
      if (Math.abs(deltaX) > 8) swipeDidDragRef.current[meal.id] = true;
    };
    const handlePointerUp = () => {
      if (!swipeDraggingRef.current[meal.id]) return;
      swipeDraggingRef.current[meal.id] = false;
      const deltaX = swipeDxRef.current[meal.id] ?? 0;
      if (swipeDidDragRef.current[meal.id]) {
        if (deltaX < -40 && side === 0) setSide(1);
        else if (deltaX > 40 && side === 1) setSide(0);
      }
      swipeDxRef.current[meal.id] = 0;
    };

    return (
      <div key={meal.id} style={{ display: 'flex', gap: 0, marginBottom: isLast ? 0 : 12 }}>
        {/* Karta swipeable */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: alt ? 'grab' : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div style={{ background: 'var(--card)', border: isCurrent ? '1.5px solid var(--orange)' : '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: isCurrent ? '0 4px 12px rgba(249, 115, 22, 0.15)' : 'none' }}>
            {/* Nagłówek */}
            <div 
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => setModal(meal.id, { showDetail: true })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {isCurrent && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />}
                <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? 'var(--orange)' : 'var(--text)' }}>{meal.title}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{meal.time}</span>
                {/* Dots nawigacyjne gdy jest alternatywa */}
                {alt && (
                  <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
                    <div style={{ width: side === 0 ? 12 : 5, height: 5, borderRadius: 3, background: side === 0 ? 'var(--orange)' : 'var(--border)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSide(0); }} />
                    <div style={{ width: side === 1 ? 12 : 5, height: 5, borderRadius: 3, background: side === 1 ? 'var(--orange)' : 'var(--border)', transition: 'all 0.2s', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSide(1); }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {side === 0 && (
                  <>
                    {state.status === 'eaten' && <button onClick={(e) => { e.stopPropagation(); resetStatus(meal.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>✓ Zjedzone</span></button>}
                    {state.status === ('eaten_alternative' as string) && <button onClick={(e) => { e.stopPropagation(); resetStatus(meal.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>✓ Zjedzone</span></button>}
                    {state.status === 'not_eaten' && <button onClick={(e) => { e.stopPropagation(); resetStatus(meal.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--red)' }}>✕ Nie zjedzone</span></button>}
                    {state.status === 'partial' && <button onClick={(e) => { e.stopPropagation(); resetStatus(meal.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--orange)' }}>~{state.partialPct ?? 50}%</span></button>}
                  </>
                )}
                {side === 1 && alt && (
                  <>
                    {altState.status === 'eaten' && <button onClick={(e) => { e.stopPropagation(); setAltStates(prev => ({ ...prev, [meal.id]: { status: 'pending', partialPct: 50, showPlate: false } })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>✓ Zjedzone</span></button>}
                    {altState.status === 'not_eaten' && <button onClick={(e) => { e.stopPropagation(); setAltStates(prev => ({ ...prev, [meal.id]: { status: 'pending', partialPct: 50, showPlate: false } })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--red)' }}>✕ Nie zjedzone</span></button>}
                    {altState.status === 'partial' && <button onClick={(e) => { e.stopPropagation(); setAltStates(prev => ({ ...prev, [meal.id]: { status: 'pending', partialPct: 50, showPlate: false } })); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--orange)' }}>~{altState.partialPct}%</span></button>}
                  </>
                )}
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px' }}>
                  <i className={`ti ${favorites.includes(meal.id) ? 'ti-heart-filled' : 'ti-heart'}`} style={{ fontSize: 13, color: favorites.includes(meal.id) ? '#d4537e' : 'var(--text3)' }} />
                </button>
              </div>
            </div>

            {/* Treść — strona 0: oryginał */}
            {side === 0 && (
              <div style={{ padding: '9px 12px', background: bodyBg }}>
                <button
                  onClick={() => setModal(meal.id, { showDetail: true })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 6, marginBottom: isPending ? 9 : 0 }}
                >
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--meal-text-primary)', lineHeight: 1.35 }}>
                    {opt?.name || 'Posiłek'}
                  </span>
                  <i className="ti ti-info-circle" style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0 }} />
                </button>
                {state.status === 'partial' && (
                  <div style={{ marginTop: 10 }}>
                    <PartialMealBadge percentage={state.partialPct ?? 50} onEdit={() => setModal(meal.id, { showPartial: true })} />
                  </div>
                )}
                {isPending && (
                  <MealActionButtons
                    onNotAte={() => { setStatus(meal.id, 'not_eaten'); setModal(meal.id, { showNotEaten: true }); }}
                    onPartial={() => setModal(meal.id, { showPartial: true })}
                    onAte={() => { setStatus(meal.id, 'eaten'); setModal(meal.id, { showEaten: true }); }}
                  />
                )}
                {alt && state.status === 'not_eaten' && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.6 }}>
                    <i className="ti ti-chevron-right" style={{ fontSize: 10, color: 'var(--text3)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>Przesuń, aby zobaczyć alternatywę</span>
                  </div>
                )}
              </div>
            )}

            {/* Treść — strona 1: alternatywa */}
            {side === 1 && alt && (
              <div style={{ padding: '9px 12px', background: altBodyBg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <i className="ti ti-chef-hat" style={{ fontSize: 11, color: 'var(--orange)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alternatywa</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--meal-text-primary)', lineHeight: 1.35, marginBottom: 5 }}>
                  {alt.name}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: '0 0 9px' }}>{alt.tip}</p>
                {altState.status === 'partial' && (
                  <div style={{ marginTop: 4 }}>
                    <PartialMealBadge
                      percentage={altState.partialPct}
                      onEdit={() => setAltStates(prev => ({ ...prev, [meal.id]: { ...altState, showPlate: true } }))}
                    />
                  </div>
                )}
                {altState.status === 'pending' && (
                  <MealActionButtons
                    onNotAte={() => setAltStates(prev => ({ ...prev, [meal.id]: { status: 'not_eaten', partialPct: 50, showPlate: false } }))}
                    onPartial={() => setAltStates(prev => ({ ...prev, [meal.id]: { ...altState, showPlate: true } }))}
                    onAte={() => setAltStates(prev => ({ ...prev, [meal.id]: { status: 'eaten', partialPct: 100, showPlate: false } }))}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Zbierz wszystkie aktywne modale — renderowane poza strukturą osi czasu
  const activeModalMeals = sortedMeals.filter(m => {
    const modal = getModal(m.id);
    return modal.showDetail || modal.showEaten || modal.showNotEaten || modal.showPartial
      || (altStates[m.id]?.showPlate ?? false);
  });

  return (
    <div className="screen active">
      <div className="topbar" style={{ alignItems: "center" }}>
        <img src={logo} alt="Pacjent Wybiera" style={{ height: 58, objectFit: "contain" }} />
        <TopbarDate navigate={navigate} />
      </div>

      <div style={{ padding: "0 16px 10px" }}>
        <button
          onClick={() => navigate("add-sym")}
          style={{ width: "100%", border: "1px solid var(--border)", background: "#fff", borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Jak się dziś czujesz?</div>
          <i className="ti ti-chevron-right" style={{ fontSize: 16, color: "var(--text2)" }} />
        </button>
      </div>

      <div className="scroll">
        {currentMeal && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-clock-hour-4" style={{ fontSize: 16 }} /> Najbliższy posiłek
            </div>
            {renderMealRow(currentMeal, true)}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{currentMeal ? 'Pozostałe posiłki' : 'Dzisiejsze menu'}</span>
          <a style={{ fontSize: 12, color: "var(--orange)", cursor: "pointer" }} onClick={() => navigate("plan")}>Cały plan →</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {otherMeals.map((meal, idx) => renderMealRow(meal, idx === otherMeals.length - 1))}
        </div>

        <button className="orange-btn" style={{ marginTop: 24, marginBottom: 24 }} onClick={() => navigate("order")}>
          Zamów posiłki na {orderDate} →
        </button>
      </div>

      {/* Modale — poza strukturą osi czasu, renderowane na poziomie screen */}
      {activeModalMeals.map(meal => {
        const modal = getModal(meal.id);
        const opt = meal.options[choices[meal.id] ?? 0] ?? meal.options[0];
        const state = getMealState(meal.id);
        return (
          <div key={`modal-${meal.id}`}>
            {modal.showDetail && (
              <MealDetailModal meal={meal} optionIdx={choices[meal.id] ?? 0} onClose={() => setModal(meal.id, { showDetail: false })} />
            )}
            {modal.showPartial && (
              <PartialFeedbackModal
                mealName={opt?.name || 'Posiłek'}
                initialPct={state.partialPct ?? 50}
                protein={opt?.protein ?? 0}
                kcal={opt?.kcal ?? 0}
                onConfirm={(pct) => {
                  setStatus(meal.id, pct >= 100 ? 'eaten' : 'partial', pct);
                  setModal(meal.id, { showPartial: false, showEaten: pct >= 100 });
                }}
                onCancel={() => setModal(meal.id, { showPartial: false })}
              />
            )}
            {/* Popup "ile zjadłeś" dla alternatywy */}
            {(altStates[meal.id]?.showPlate ?? false) && selectedAlternatives[meal.id] && (
              <PartialFeedbackModal
                mealName={selectedAlternatives[meal.id].name}
                initialPct={altStates[meal.id]?.partialPct ?? 50}
                protein={selectedAlternatives[meal.id].protein}
                kcal={selectedAlternatives[meal.id].kcal}
                onConfirm={(pct) => setAltStates(prev => ({ ...prev, [meal.id]: { status: pct >= 100 ? 'eaten' : 'partial', partialPct: pct, showPlate: false } }))}
                onCancel={() => setAltStates(prev => ({ ...prev, [meal.id]: { ...altStates[meal.id], showPlate: false } }))}
              />
            )}
            {modal.showEaten && (
              <EatenFeedbackModal
                mealName={modal.ateAlternative && modal.alternativeName ? modal.alternativeName : (opt?.name || 'Posiłek')}
                protein={opt?.protein ?? 0}
                kcal={opt?.kcal ?? 0}
                onClose={() => setModal(meal.id, { showEaten: false })}
              />
            )}
            {modal.showNotEaten && (              <NotEatenFeedbackModal
                mealName={opt?.name || 'Posiłek'}
                onClose={(reason) => { onNotEatenReason?.(meal.id, reason); }}
                onSelectAlternative={(alt) => {
                  setModal(meal.id, { showNotEaten: false });
                  setSelectedAlternatives(prev => ({ ...prev, [meal.id]: alt }));
                  setAltStates(prev => ({ ...prev, [meal.id]: { status: 'pending', partialPct: 50, showPlate: false } }));
                  setCardSide(prev => ({ ...prev, [meal.id]: 1 }));
                }}
                onCancel={() => setModal(meal.id, { showNotEaten: false })}              />
            )}
          </div>
        );
      })}

      <Navbar active="home" navigate={navigate} />
    </div>
  );
}
