import { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, Meal } from '../types';
import { meals } from '../data';
import { getOption } from '../utils';

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  setChoices: (c: Record<string, number>) => void;
}

interface SlotProps {
  meal: Meal;
  optionIdx: number;
  onFlip: (dir: 1 | -1) => void;
}

function ScoreRing({ score }: { score: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 10);
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color,
      }}>
        {score}
      </div>
    </div>
  );
}

function MealSlot({ meal, optionIdx, onFlip }: SlotProps) {
  const opt = getOption(meal, optionIdx);
  const isRec = opt.isRec;
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const dx = useRef(0);
  const dragging = useRef(false);
  const dirLocked = useRef<'h' | 'v' | null>(null);
  const [animDir, setAnimDir] = useState<0 | 1 | -1>(0);
  const [showReason, setShowReason] = useState(false);

  const triggerFlip = useCallback((dir: 1 | -1) => {
    const card = cardRef.current;
    if (!card || animDir !== 0) return;
    setAnimDir(dir);
    setShowReason(false);
    card.style.transition = 'transform .22s ease, opacity .22s ease';
    card.style.transform = dir > 0 ? 'translateX(-110%)' : 'translateX(110%)';
    card.style.opacity = '0';
    setTimeout(() => {
      onFlip(dir);
      setAnimDir(0);
      if (card) {
        card.style.transition = 'none';
        card.style.transform = dir > 0 ? 'translateX(110%)' : 'translateX(-110%)';
        card.style.opacity = '0';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'transform .22s ease, opacity .22s ease';
            card.style.transform = 'translateX(0)';
            card.style.opacity = '1';
          });
        });
      }
    }, 220);
  }, [animDir, onFlip]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dx.current = 0;
    dirLocked.current = null;
    const card = cardRef.current;
    if (card) card.style.transition = 'none';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;
    if (dirLocked.current === null) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      dirLocked.current = Math.abs(deltaX) >= Math.abs(deltaY) ? 'h' : 'v';
    }
    if (dirLocked.current === 'v') return;
    e.stopPropagation();
    dx.current = deltaX;
    const card = cardRef.current;
    if (card) {
      card.style.transform = `translateX(${dx.current}px) rotate(${dx.current * 0.025}deg)`;
    }
  };

  const onPointerUp = (_e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    dirLocked.current = null;
    if (dx.current < -45) {
      triggerFlip(1);
    } else if (dx.current > 45) {
      triggerFlip(-1);
    } else {
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'transform .18s ease';
        card.style.transform = 'translateX(0) rotate(0deg)';
      }
    }
    dx.current = 0;
  };

  return (
    <div className="meal-slot">
      <div className="slot-head">
        <div className="slot-icon">{meal.icon}</div>
        <div className="slot-info">
          <div className="slot-title">{meal.title}</div>
          <div className="slot-time">{meal.time}</div>
        </div>
        <div className={`slot-status ${isRec ? 'done' : 'alt'}`}>
          <i className={`ti ${isRec ? 'ti-check' : 'ti-arrows-exchange'}`} />
        </div>
      </div>

      <div className="swipe-hint">
        <i className="ti ti-chevron-left" />
        <span>przesuń aby zmienić</span>
        <i className="ti ti-chevron-right" />
      </div>

      <div className="card-window">
        <div
          ref={cardRef}
          className={`swipe-card ${isRec ? 'rec-style' : 'alt-style'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 7 }}>
            <div className={`card-label ${isRec ? 'rec-lbl' : 'alt-lbl'}`}>
              <i className={`ti ${isRec ? 'ti-star' : 'ti-arrows-exchange'}`} />
              <span>{isRec ? 'Rekomendowane' : 'Alternatywa'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <ScoreRing score={opt.score} />
              <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}>Predykcja</span>
            </div>
          </div>
          <div className="card-top">
            <div className="card-emoji">{opt.emoji}</div>
            <div>
              <div className="card-name">{opt.name}</div>
            </div>
          </div>
          <div className={`card-why ${isRec ? 'green' : 'orange'}`}>{opt.why}</div>
          <div className="card-tags">
            {opt.tags.map((tag) => (
              <span key={tag.t} className={`tag ${tag.c}`}>{tag.t}</span>
            ))}
          </div>
          <div className="card-foot">
            <span className="card-kcal">{opt.kcal} kcal · {opt.protein}g B · {opt.carbs}g W · {opt.fat}g T</span>
            <button
              className="score-why-btn"
              onClick={(e) => { e.stopPropagation(); setShowReason(!showReason); }}
            >
              <i className="ti ti-info-circle" />
            </button>
          </div>
        </div>
      </div>

      {showReason && (
        <div className="score-reason-box">
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <i className="ti ti-brain" style={{ fontSize: 13, color: 'var(--orange)', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                Dlaczego {opt.score}/10?
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                {opt.scoreReason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="swipe-dots">
        <div className={`sdot ${isRec ? 'rec-active' : ''}`} />
        <div className={`sdot ${!isRec ? 'alt-active' : ''}`} />
      </div>
    </div>
  );
}

export default function OrderScreen({ navigate, choices, setChoices }: Props) {
  const [aiApplied, setAiApplied] = useState(false);

  const flip = (mealId: string, dir: 1 | -1) => {
    setChoices({ ...choices, [mealId]: (choices[mealId] ?? 0) + dir });
    setAiApplied(false);
  };

  const applyAiRecommendation = () => {
    const recommended: Record<string, number> = {};
    meals.forEach((meal) => {
      // index 0 is always isRec: true in our data
      recommended[meal.id] = 0;
    });
    setChoices(recommended);
    setAiApplied(true);
  };

  const totalProtein = meals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).protein, 0);
  const totalKcal = meals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).kcal, 0);
  const avgScore = Math.round(meals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).score, 0) / meals.length * 10) / 10;

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Zamówienie</h1>
          <p>Piątek, 8 maja 2026</p>
        </div>
      </div>

      <div className="pred-banner">
        <div className="pb-top">
          <i className="ti ti-brain" />
          <span>Predykcja AI · piątek, 8 maja (za 2 dni)</span>
        </div>
        <p>Nudności słabną, wrażliwość żołądka utrzymuje się. Model zaleca dania chłodne, lekkostrawne, wysokobiałkowe.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="diet-pill">
            <span>Lekkostrawna wysokobiałkowa</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>
            Śr. dopasowanie: {avgScore}/10
          </div>
        </div>
      </div>

      <div className="scroll">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            className="orange-btn"
            style={{ flex: 1, width: 'auto', margin: 0, padding: '11px 0' }}
            onClick={() => navigate('confirm')}
          >
            Złóż zamówienie
          </button>
          <button
            style={{
              flex: 1, margin: 0, padding: '11px 0',
              background: aiApplied ? 'var(--glight)' : 'var(--olight)',
              border: `1.5px solid ${aiApplied ? 'var(--green)' : 'var(--omid)'}`,
              borderRadius: 14,
              color: aiApplied ? 'var(--green)' : 'var(--orange)',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
            onClick={applyAiRecommendation}
          >
            <i className={`ti ${aiApplied ? 'ti-check' : 'ti-brain'}`} style={{ fontSize: 14 }} />
            {aiApplied ? 'Zastosowano' : 'Rekomendacja AI'}
          </button>
        </div>

        {meals.map((meal) => (
          <MealSlot
            key={meal.id}
            meal={meal}
            optionIdx={choices[meal.id] ?? 0}
            onFlip={(dir) => flip(meal.id, dir)}
          />
        ))}

        <div className="summary-card">
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>
            Podsumowanie
          </p>
          {meals.map((meal) => {
            const opt = getOption(meal, choices[meal.id] ?? 0);
            return (
              <div key={meal.id} className="sum-row">
                <span className="sum-meal">{meal.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`sum-val ${opt.isRec ? 'green' : 'orange'}`}>{opt.name}</span>
                  <span style={{ fontSize: 10, color: opt.score >= 8 ? 'var(--green)' : 'var(--amber)', fontWeight: 700 }}>
                    {opt.score}/10
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

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
          Brak wyboru = automat o 20:00
        </p>
      </div>

      <Navbar active="order" navigate={navigate} />
    </div>
  );
}
