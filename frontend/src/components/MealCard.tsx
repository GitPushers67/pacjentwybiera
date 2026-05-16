import { useState } from 'react';
import type { Meal, MealCardState, NotEatenReason } from '../types';
import { MealActionButtons } from './MealActionButtons';
import { PartialMealBadge } from './PartialMealBadge';
import MealDetailModal from './MealDetailModal';
import { EatenFeedbackModal, NotEatenFeedbackModal, PartialFeedbackModal } from './MealFeedbackModal';

interface MealCardProps {
  meal: Meal;
  state: MealCardState;
  isCurrent: boolean;
  isFavorite?: boolean;
  optionIdx?: number;
  hideHeader?: boolean;
  onSetStatus: (status: MealCardState['status']) => void;
  onUpdatePartialPct: (pct: number) => void;
  onShowPlate: (show: boolean) => void;
  onReset: () => void;
  onToggleFavorite?: () => void;
  onNotEatenReason?: (reason: NotEatenReason) => void;
  showAlternativePanel?: boolean;
  onAlternativeHandled?: () => void;
}

export function MealCard({
  meal,
  state,
  isCurrent,
  isFavorite = false,
  optionIdx = 0,
  hideHeader = false,
  onSetStatus,
  onUpdatePartialPct,
  onShowPlate,
  onReset,
  onToggleFavorite,
  onNotEatenReason,
}: MealCardProps) {
  const [animating, setAnimating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEatenFeedback, setShowEatenFeedback] = useState(false);
  const [showNotEatenFeedback, setShowNotEatenFeedback] = useState(false);
  const [showPartialFeedback, setShowPartialFeedback] = useState(false);
  const [ateAlternative, setAteAlternative] = useState(false);
  const [alternativeName, setAlternativeName] = useState<string | null>(null);

  const opt = meal.options[optionIdx] ?? meal.options[0];

  const triggerAnim = () => {
    setAnimating(true);
    window.setTimeout(() => setAnimating(false), 400);
  };

  const handleNotAte = () => {
    triggerAnim();
    onSetStatus('not_eaten');
    setShowNotEatenFeedback(true);
  };

  const handlePartial = () => setShowPartialFeedback(true);

  const handleConfirmPartial = (pct: number) => {
    triggerAnim();
    onUpdatePartialPct(pct);
    onSetStatus(pct >= 100 ? 'eaten' : 'partial');
    onShowPlate(false);
    setShowPartialFeedback(false);
    if (pct >= 100) setShowEatenFeedback(true);
  };

  const handleAte = () => {
    triggerAnim();
    onUpdatePartialPct(100);
    onSetStatus('eaten');
    setShowEatenFeedback(true);
  };

  const handleNotEatenReason = (reason: NotEatenReason) => {
    onNotEatenReason?.(reason);
    // modal pozostaje otwarty — przejdzie do kroku 'alternative'
  };

  const handleAteAlternative = (altName: string) => {
    setAteAlternative(true);
    setAlternativeName(altName);
    setShowNotEatenFeedback(false);
    onSetStatus('eaten_alternative' as MealCardState['status']);
    triggerAnim();
    setShowEatenFeedback(true);
  };

  const statusLabel =
    state.status === 'eaten' || state.status === ('eaten_alternative' as string)
      ? '✓ Zjedzone'
      : state.status === 'not_eaten'
        ? '✕ Nie zjedzone'
        : null;
  const statusColor = (state.status === 'eaten' || state.status === ('eaten_alternative' as string)) ? '#3CAB8F' : '#E05252';
  const isPending = state.status === 'pending';

  const cardClasses = [
    'meal-card',
    isCurrent && 'meal-card--current',
    (state.status === 'eaten' || state.status === ('eaten_alternative' as string)) && 'meal-card--eaten',
    state.status === 'not_eaten' && 'meal-card--not-eaten',
    state.status === 'partial' && 'meal-card--partial',
    animating && 'meal-card--animating',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={cardClasses}>
        {!hideHeader && (
        <div className="meal-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {isCurrent && <span className="meal-card-badge">⏰ Teraz</span>}
            <span>{meal.title}</span>
            <span style={{ color: 'var(--meal-text-muted)', fontWeight: 500, textTransform: 'none' }}>{meal.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isPending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {statusLabel && <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{statusLabel}</span>}
                <button className="meal-change-link" onClick={state.status === 'partial' ? () => onShowPlate(true) : onReset}>zmień</button>
              </div>
            )}
            {onToggleFavorite && (
              <button
                className={`hmc-heart ${isFavorite ? 'on' : ''}`}
                onClick={onToggleFavorite}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
              >
                <i className={`ti ${isFavorite ? 'ti-heart-filled' : 'ti-heart'}`}
                  style={{ fontSize: 16, color: isFavorite ? '#d4537e' : 'var(--text3)' }} />
              </button>
            )}
          </div>
        </div>
        )}

        {/* Tytuł — kliknięcie otwiera szczegóły */}
        <button
          className="meal-card-title"
          onClick={() => setShowDetail(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ flex: 1 }}>{opt?.name || meal.options[0]?.name || 'Posiłek'}</span>
          <i className="ti ti-chevron-right" style={{ fontSize: 13, color: 'var(--text3)', flexShrink: 0 }} />
        </button>

        {ateAlternative && alternativeName && (
          <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 3, marginBottom: 2 }}>
            Zjadłeś alternatywę: {alternativeName}
          </div>
        )}

        {state.status === 'partial' && !state.showPlate && (
          <PartialMealBadge percentage={state.partialPct ?? 50} onEdit={() => setShowPartialFeedback(true)} />
        )}

        {isPending && !state.showPlate && (
          <MealActionButtons onNotAte={handleNotAte} onPartial={handlePartial} onAte={handleAte} />
        )}
      </div>

      {showDetail && (
        <MealDetailModal meal={meal} optionIdx={optionIdx} onClose={() => setShowDetail(false)} />
      )}

      {showPartialFeedback && (
        <PartialFeedbackModal
          mealName={opt?.name || 'Posiłek'}
          initialPct={state.partialPct ?? 50}
          protein={opt?.protein ?? 0}
          kcal={opt?.kcal ?? 0}
          onConfirm={handleConfirmPartial}
          onCancel={() => setShowPartialFeedback(false)}
        />
      )}

      {showEatenFeedback && (
        <EatenFeedbackModal
          mealName={ateAlternative && alternativeName ? alternativeName : (opt?.name || 'Posiłek')}
          protein={opt?.protein ?? 0}
          kcal={opt?.kcal ?? 0}
          onClose={() => setShowEatenFeedback(false)}
        />
      )}

      {showNotEatenFeedback && (
        <NotEatenFeedbackModal
          mealName={opt?.name || 'Posiłek'}
          onClose={handleNotEatenReason}
          onSelectAlternative={(alt) => handleAteAlternative(alt.name)}
          onCancel={() => setShowNotEatenFeedback(false)}
        />
      )}
    </>
  );
}
