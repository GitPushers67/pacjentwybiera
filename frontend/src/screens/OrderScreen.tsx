import { useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import type { Screen, Meal, MealOption } from '../types';
import { meals } from '../data';

interface Props {
  navigate: (s: Screen) => void;
  choices: Record<string, number>;
  setChoices: (c: Record<string, number>) => void;
}

function getOption(meal: Meal, idx: number): MealOption {
  const i = ((idx % meal.options.length) + meal.options.length) % meal.options.length;
  return meal.options[i];
}

interface SlotProps {
  meal: Meal;
  optionIdx: number;
  onFlip: (dir: 1 | -1) => void;
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

  const triggerFlip = useCallback((dir: 1 | -1) => {
    const card = cardRef.current;
    if (!card || animDir !== 0) return;
    setAnimDir(dir);
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
          <div className={`card-label ${isRec ? 'rec-lbl' : 'alt-lbl'}`}>
            <i className={`ti ${isRec ? 'ti-star' : 'ti-arrows-exchange'}`} />
            <span>{isRec ? 'Rekomendowane' : 'Alternatywa'}</span>
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
            <span className="card-kcal">{opt.kcal} kcal · {opt.protein}g białka</span>
          </div>
        </div>
      </div>

      <div className="swipe-dots">
        <div className={`sdot ${isRec ? 'rec-active' : ''}`} />
        <div className={`sdot ${!isRec ? 'alt-active' : ''}`} />
      </div>
    </div>
  );
}

export default function OrderScreen({ navigate, choices, setChoices }: Props) {
  const flip = (mealId: string, dir: 1 | -1) => {
    setChoices({ ...choices, [mealId]: (choices[mealId] ?? 0) + dir });
  };

  const totalProtein = meals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).protein, 0);
  const totalKcal = meals.reduce((sum, m) => sum + getOption(m, choices[m.id] ?? 0).kcal, 0);

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Zamówienie</h1>
          <p>Piątek, 8 maja 2026</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 10, color: 'var(--text2)', display: 'block' }}>Wybrano</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
            {meals.length}/{meals.length}
          </span>
        </div>
      </div>

      <div className="pred-banner">
        <div className="pb-top">
          <i className="ti ti-brain" />
          <span>Predykcja na pojutrze</span>
        </div>
        <p>Nudności będą słabnąć. Możliwa wrażliwość żołądka. Polecamy dania chłodne, lekkostrawne, wysokobiałkowe.</p>
        <div className="diet-pill">
          <span>Dieta lekkostrawna wysokobiałkowa</span>
        </div>
      </div>

      <div className="deadline-bar">
        <i className="ti ti-clock" />
        <p>Zamów do <strong>dziś 20:00</strong> — po tym czasie AI wybierze za Ciebie</p>
      </div>

      <div className="progress-wrap">
        <div className="prog-labels">
          <span>Postęp</span>
          <strong>{meals.length} z {meals.length}</strong>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="scroll">
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
                <span className={`sum-val ${opt.isRec ? 'green' : 'orange'}`}>{opt.name}</span>
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

        <button className="orange-btn" onClick={() => navigate('confirm')}>
          Złóż zamówienie
        </button>
        <button className="outline-btn">Wybierz za mnie (AI)</button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 9 }}>
          Brak wyboru = automat o 20:00
        </p>
      </div>

      <Navbar active="order" navigate={navigate} />
    </div>
  );
}
