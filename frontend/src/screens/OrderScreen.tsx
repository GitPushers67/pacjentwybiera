import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import type { Screen, Meal, PatientProfile, SymptomHistoryEntry, EatenStatus } from "../types";
import { meals as fallbackMeals } from "../data";
import {
  getOption,
  getToday,
  getOrderableDate,
  formatDateForAPI,
  formatDateLongPL,
} from "../utils";
import { fetchMenuForDate, fetchAiRecommendation } from "../api";

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  setChoices: (c: Record<string, number>) => void;
  setOrderMeals: (meals: Meal[] | null) => void;
  patient: PatientProfile;
  symptoms: string[];
  symptomHistory: SymptomHistoryEntry[];
  eatenMap: Record<string, EatenStatus>;
}

interface SlotProps {
  meal: Meal;
  optionIdx: number;
  onFlip: (dir: 1 | -1) => void;
  aiReason?: string;
  aiChoice?: number;
}


function CardContent({ opt, flipped, aiChoice, isAiSelected, aiReason }: any) {
  return (
    <div className={`card-inner${flipped ? " flipped" : ""}`}>
      {/* PRZÓD */}
      <div className="card-face card-front">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          {aiChoice !== undefined ? (
            <div className={`card-label ${isAiSelected ? "ai-lbl" : "alt-lbl"}`}>
              <i className={`ti ${isAiSelected ? "ti-brain" : "ti-arrows-exchange"}`} />
              <span>{isAiSelected ? "Wybór AI" : "Alternatywa"}</span>
            </div>
          ) : <div />}
          <div style={{ display: "flex", gap: 3, opacity: 0.3, marginTop: 2 }}>
            <i className="ti ti-chevron-left" style={{ fontSize: 13 }} />
            <i className="ti ti-hand-two-fingers" style={{ fontSize: 15 }} />
            <i className="ti ti-chevron-right" style={{ fontSize: 13 }} />
          </div>
        </div>
        <div className="card-name">{opt.name}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
          <span className="tag b">{opt.protein}g białka</span>
          {opt.allergensText && (
            <span className="tag a" style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 9 }} />
              {opt.allergensText}
            </span>
          )}
        </div>
        <div className="card-flip-hint">
          <i className="ti ti-rotate-clockwise" />
          <span>dotknij po szczegóły</span>
        </div>
      </div>

      {/* TYŁ */}
      <div className="card-face card-back">
        {aiChoice !== undefined && (
          <>
            <div className="card-back-hdr">
              <i className="ti ti-brain" />
              <span>Uzasadnienie AI</span>
            </div>
            <div className={`card-why ${isAiSelected ? "green" : "orange"}`}>
              {isAiSelected ? aiReason : "AI rekomendowało inną opcję dla Twoich objawów. To jest opcja alternatywna."}
            </div>
          </>
        )}
        <div className="card-tags">
          {opt.tags.map((tag: any) => (
            <span key={tag.t} className={`tag ${tag.c}`}>
              {tag.t}
            </span>
          ))}
        </div>
        <span className="card-kcal">
          {opt.kcal} kcal · {opt.protein}g B · {opt.carbs}g W · {opt.fat}g T
        </span>
      </div>
    </div>
  );
}

function MealSlot({ meal, optionIdx, onFlip, aiReason, aiChoice }: SlotProps) {
  const opt = getOption(meal, optionIdx);
  const nextIdx = optionIdx === 0 ? 1 : 0;
  const nextOpt = getOption(meal, nextIdx);

  const isAiSelected = aiChoice !== undefined && optionIdx === aiChoice;
  const isAiAlternative = aiChoice !== undefined && optionIdx !== aiChoice;

  const isNextAiSelected = aiChoice !== undefined && nextIdx === aiChoice;
  const isNextAiAlternative = aiChoice !== undefined && nextIdx !== aiChoice;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const nextCardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const dx = useRef(0);
  const dragging = useRef(false);
  const dirLocked = useRef<"h" | "v" | null>(null);
  const wasVertical = useRef(false);
  const [animDir, setAnimDir] = useState<0 | 1 | -1>(0);
  const [flipped, setFlipped] = useState(false);

  const triggerFlip = useCallback(
    (dir: 1 | -1) => {
      const card = cardRef.current;
      const nextCard = nextCardRef.current;
      if (!card || animDir !== 0) return;
      setAnimDir(dir);
      setFlipped(false);
      card.style.transition = "transform .22s ease, opacity .22s ease, box-shadow .22s ease";
      card.style.transform = dir > 0 ? "translateX(-110%)" : "translateX(110%)";
      card.style.opacity = "0";
      card.style.boxShadow = "";
      if (nextCard) {
        nextCard.style.transition = "transform .22s ease, opacity .22s ease";
        nextCard.style.transform = "scale(1)";
        nextCard.style.opacity = "1";
      }
      setTimeout(() => {
        onFlip(dir);
        setAnimDir(0);
        requestAnimationFrame(() => {
          if (card) {
            card.style.transition = "none";
            card.style.transform = "translateX(0)";
            card.style.opacity = "1";
            card.style.boxShadow = "";
          }
          if (nextCard) {
            nextCard.style.transition = "none";
            nextCard.style.transform = "scale(0.95)";
            nextCard.style.opacity = "0.6";
          }
        });
      }, 220);
    },
    [animDir, onFlip],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dx.current = 0;
    dirLocked.current = null;
    wasVertical.current = false;
    if (cardRef.current) cardRef.current.style.transition = "none";
    if (nextCardRef.current) nextCardRef.current.style.transition = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    let deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    if (dirLocked.current === null) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      dirLocked.current = Math.abs(deltaX) >= Math.abs(deltaY) ? "h" : "v";
    }
    if (dirLocked.current === "v") {
      wasVertical.current = true;
      return;
    }
    e.stopPropagation();

    if (optionIdx === 0 && deltaX > 0) {
      deltaX = deltaX * 0.15;
    } else if (optionIdx === 1 && deltaX < 0) {
      deltaX = deltaX * 0.15;
    }

    dx.current = deltaX;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${dx.current}px) rotate(${dx.current * 0.025}deg)`;
      const shadowProgress = Math.min(Math.abs(dx.current) / 100, 1);
      cardRef.current.style.boxShadow = `0px ${8 + 12 * shadowProgress}px ${16 + 24 * shadowProgress}px rgba(0,0,0,${0.05 + 0.1 * shadowProgress})`;
    }
    if (nextCardRef.current) {
      const isValidSwipe = (optionIdx === 0 && dx.current < 0) || (optionIdx === 1 && dx.current > 0);
      const progress = isValidSwipe ? Math.min(Math.abs(dx.current) / 150, 1) : 0;
      nextCardRef.current.style.transform = `scale(${0.95 + progress * 0.05})`;
      nextCardRef.current.style.opacity = `${0.6 + progress * 0.4}`;
    }
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    dirLocked.current = null;
    if (dx.current < -45 && optionIdx === 0) {
      triggerFlip(1);
    } else if (dx.current > 45 && optionIdx === 1) {
      triggerFlip(-1);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = "transform .18s ease, box-shadow .18s ease";
        cardRef.current.style.transform = "translateX(0) rotate(0deg)";
        cardRef.current.style.boxShadow = "";
      }
      if (nextCardRef.current) {
        nextCardRef.current.style.transition = "transform .18s ease, opacity .18s ease";
        nextCardRef.current.style.transform = "scale(0.95)";
        nextCardRef.current.style.opacity = "0.6";
      }
      if (Math.abs(dx.current) < 8 && !wasVertical.current) {
        setFlipped((f) => !f);
      }
    }
    dx.current = 0;
  };

  return (
    <div className="meal-slot">
      <div className="slot-head">
        <div className="slot-info">
          <div className="slot-title">{meal.title}</div>
          <div className="slot-time">{meal.time}</div>
        </div>
        {aiChoice !== undefined && (
          <div className={`slot-status ${isAiSelected ? "done" : "alt"}`}>
            <i className={`ti ${isAiSelected ? "ti-check" : "ti-arrows-exchange"}`} />
          </div>
        )}
      </div>

      <div className="card-window" style={{ position: "relative" }}>
        <div
          ref={nextCardRef}
          className={`swipe-card ${isNextAiSelected ? "rec-style" : isNextAiAlternative ? "alt-style" : ""}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            transform: "scale(0.95)",
            opacity: 0.6,
            ...(aiChoice === undefined ? { background: '#fff', border: '1px solid var(--border)' } : {})
          }}
        >
          <CardContent 
            opt={nextOpt} 
            flipped={false} 
            aiChoice={aiChoice} 
            isAiSelected={isNextAiSelected} 
            aiReason={aiReason} 
          />
        </div>

        <div
          ref={cardRef}
          className={`swipe-card ${isAiSelected ? "rec-style" : isAiAlternative ? "alt-style" : ""}`}
          style={{
            position: "relative",
            zIndex: 1,
            ...(aiChoice === undefined ? { background: '#fff', border: '1px solid var(--border)' } : {})
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <CardContent 
            opt={opt} 
            flipped={flipped} 
            aiChoice={aiChoice} 
            isAiSelected={isAiSelected} 
            aiReason={aiReason} 
          />
        </div>
      </div>

      <div className="swipe-dots">
        <div className={`sdot ${optionIdx === 0 ? (aiChoice !== undefined ? (aiChoice === 0 ? "ai-active" : "alt-active") : "active") : ""}`} style={optionIdx === 0 && aiChoice !== undefined && aiChoice === 0 ? {background: 'var(--orange)', transform: 'scale(1.2)'} : {}} />
        <div className={`sdot ${optionIdx === 1 ? (aiChoice !== undefined ? (aiChoice === 1 ? "ai-active" : "alt-active") : "active") : ""}`} style={optionIdx === 1 && aiChoice !== undefined && aiChoice === 1 ? {background: 'var(--orange)', transform: 'scale(1.2)'} : {}} />
      </div>
    </div>
  );
}

export default function OrderScreen({
  navigate,
  choices,
  setChoices,
  setOrderMeals,
  patient,
  symptoms,
  symptomHistory,
  eatenMap,
}: Props) {
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiApplied, setAiApplied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReasons, setAiReasons] = useState<Record<string, string>>({});
  const [aiChoices, setAiChoices] = useState<Record<string, number>>({});
  const [globalAiReason, setGlobalAiReason] = useState<string | null>(null);

  const orderDate = useMemo(() => getOrderableDate(), []);
  const orderDateStr = useMemo(() => formatDateForAPI(orderDate), [orderDate]);
  const orderDateDisplay = useMemo(
    () => formatDateLongPL(orderDate),
    [orderDate],
  );
  const todayDisplay = useMemo(() => formatDateLongPL(getToday()), []);

  useEffect(() => {
    fetchMenuForDate(orderDateStr).then((result) => {
      setApiMeals(result);
      setOrderMeals(result);
      setLoading(false);
    });
  }, [orderDateStr, setOrderMeals]);

  const activeMeals = apiMeals ?? fallbackMeals;

  const flip = (mealId: string, dir: 1 | -1) => {
    setChoices({ ...choices, [mealId]: (choices[mealId] ?? 0) + dir });
  };

  const applyAiRecommendation = async () => {
    setIsAiLoading(true);
    // Strip biasing fields so the AI makes an independent clinical decision
    const cleanedMeals = activeMeals.map(meal => ({
      ...meal,
      options: meal.options.map(({ isRec, score, scoreReason, why, ...rest }) => rest),
    }));

    const payload = {
      patient,
      symptoms,
      symptomHistory,
      eatenMap,
      activeMeals: cleanedMeals,
    };
    
    const result = await fetchAiRecommendation(payload);
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

  const totalProtein = activeMeals.reduce(
    (sum, m) => sum + getOption(m, choices[m.id] ?? 0).protein,
    0,
  );
  const totalKcal = activeMeals.reduce(
    (sum, m) => sum + getOption(m, choices[m.id] ?? 0).kcal,
    0,
  );

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Zamówienie</h1>
          <p style={{ textTransform: "capitalize" }}>{todayDisplay}</p>
        </div>
      </div>

      {globalAiReason && (
        <div className="pred-banner">
          <div className="pb-top">
            <i className="ti ti-brain" />
            <span style={{ textTransform: "capitalize" }}>
              Podsumowanie AI · {orderDateDisplay}
            </span>
          </div>
          <p style={{ marginBottom: 0 }}>
            {globalAiReason}
          </p>
        </div>
      )}

      <div className="scroll">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            className="orange-btn"
            style={{ flex: 1, width: "auto", margin: 0, padding: "11px 0" }}
            onClick={() => navigate("confirm")}
          >
            Złóż zamówienie
          </button>
          <button
            style={{
              flex: 1,
              margin: 0,
              padding: "11px 0",
              background: aiApplied ? "var(--glight)" : "var(--olight)",
              border: `1.5px solid ${aiApplied ? "var(--green)" : "var(--omid)"}`,
              borderRadius: 14,
              color: aiApplied ? "var(--green)" : "var(--orange)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
            onClick={applyAiRecommendation}
            disabled={isAiLoading}
          >
            <i
              className={`ti ${isAiLoading ? "ti-loader-2 cam-spin" : aiApplied ? "ti-check" : "ti-brain"}`}
              style={{ fontSize: 14 }}
            />
            {isAiLoading ? "Pobieranie..." : aiApplied ? "Zastosowano" : "Rekomendacja AI"}
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 0",
              gap: 10,
            }}
          >
            <i
              className="ti ti-loader-2 cam-spin"
              style={{ fontSize: 28, color: "var(--orange)" }}
            />
            <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>
              Pobieranie menu na {orderDateDisplay}…
            </p>
          </div>
        ) : (
          <>
            {apiMeals === null && (
              <div
                style={{
                  background: "var(--alight)",
                  border: "1px solid var(--amber)",
                  borderRadius: 11,
                  padding: "8px 12px",
                  marginBottom: 12,
                  fontSize: 11,
                  color: "var(--text2)",
                }}
              >
                <i className="ti ti-wifi-off" style={{ marginRight: 5 }} />
                Brak połączenia z API — wyświetlam dane lokalne.
              </div>
            )}

            {activeMeals.map((meal) => (
              <MealSlot
                key={meal.id}
                meal={meal}
                optionIdx={choices[meal.id] ?? 0}
                onFlip={(dir) => flip(meal.id, dir)}
                aiReason={aiReasons[meal.id]}
                aiChoice={aiChoices[meal.id]}
              />
            ))}

            <div className="summary-card">
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 7,
                }}
              >
                Podsumowanie
              </p>
              {activeMeals.map((meal) => {
                const opt = getOption(meal, choices[meal.id] ?? 0);
                return (
                  <div key={meal.id} className="sum-row">
                    <span className="sum-meal">{meal.title}</span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        className={`sum-val ${aiChoices[meal.id] !== undefined ? (aiChoices[meal.id] === choices[meal.id] ? "green" : "orange") : ""}`}
                      >
                        {opt.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="stat-row">
              <div className="stat-c">
                <div className="sv green">{totalProtein}g</div>
                <div className="sl">Białko / cel 75g</div>
              </div>
              <div className="stat-c">
                <div className="sv">{totalKcal}</div>
                <div className="sl">kcal łącznie</div>
              </div>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--text3)",
                marginTop: 4,
              }}
            >
              Brak wyboru = automat o 20:00
            </p>
          </>
        )}
      </div>

      <Navbar active="order" navigate={navigate} />
    </div>
  );
}
