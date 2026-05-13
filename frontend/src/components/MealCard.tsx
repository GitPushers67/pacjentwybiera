import { useState } from 'react';
import type { Meal, MealCardState } from '../types';
import { MealActionButtons } from './MealActionButtons';
import { PartialMealBadge } from './PartialMealBadge';
import { PlateSelector } from './PlateSelector';

interface MealCardProps {
  meal: Meal;
  state: MealCardState;
  isCurrent: boolean;
  onSetStatus: (status: MealCardState['status']) => void;
  onUpdatePartialPct: (pct: number) => void;
  onShowPlate: (show: boolean) => void;
  onReset: () => void;
}

export function MealCard({
  meal,
  state,
  isCurrent,
  onSetStatus,
  onUpdatePartialPct,
  onShowPlate,
  onReset,
}: MealCardProps) {
  const [animating, setAnimating] = useState(false);

  const triggerAnim = () => {
    setAnimating(true);
    window.setTimeout(() => setAnimating(false), 400);
  };

  const handleNotAte = () => {
    triggerAnim();
    onSetStatus('not_eaten');
  };

  const handlePartial = () => {
    onShowPlate(true);
  };

  const handleAte = () => {
    triggerAnim();
    onUpdatePartialPct(100);
    onSetStatus('eaten');
  };

  const handleConfirmPartial = (pct: number) => {
    triggerAnim();
    onUpdatePartialPct(pct);
    onSetStatus(pct >= 100 ? 'eaten' : 'partial');
    onShowPlate(false);
  };

  const handleCancelPartial = () => {
    onShowPlate(false);
  };

  const statusLabel =
    state.status === 'eaten'
      ? '✓ Zjedzone'
      : state.status === 'not_eaten'
        ? '✕ Nie zjedzone'
        : null;
  const statusColor = state.status === 'eaten' ? '#3CAB8F' : '#E05252';
  const isPending = state.status === 'pending';

  const cardClasses = [
    'meal-card',
    isCurrent && 'meal-card--current',
    state.status === 'eaten' && 'meal-card--eaten',
    state.status === 'not_eaten' && 'meal-card--not-eaten',
    state.status === 'partial' && 'meal-card--partial',
    animating && 'meal-card--animating',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      <div className="meal-card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {isCurrent && <span className="meal-card-badge">⏰ Teraz</span>}
          <span>{meal.title}</span>
          <span style={{ color: 'var(--meal-text-muted)', fontWeight: 500, textTransform: 'none' }}>
            {meal.time}
          </span>
        </div>
        {!isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
            {statusLabel && (
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>
                {statusLabel}
              </span>
            )}
            <button
              className="meal-change-link"
              onClick={state.status === 'partial' ? () => onShowPlate(true) : onReset}
            >
              zmień
            </button>
          </div>
        )}
      </div>

      <div className="meal-card-title">
        {meal.options[0]?.name || 'Posiłek'}
      </div>

      {state.status === 'partial' && !state.showPlate && (
        <PartialMealBadge percentage={state.partialPct ?? 50} onEdit={() => onShowPlate(true)} />
      )}

      {isPending && !state.showPlate && (
        <MealActionButtons onNotAte={handleNotAte} onPartial={handlePartial} onAte={handleAte} />
      )}

      {state.showPlate && (
        <PlateSelector
          initialPct={state.partialPct ?? 50}
          onConfirm={handleConfirmPartial}
          onCancel={handleCancelPartial}
        />
      )}
    </div>
  );
}
