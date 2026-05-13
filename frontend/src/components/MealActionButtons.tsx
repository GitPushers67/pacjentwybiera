interface MealActionButtonsProps {
  onNotAte: () => void;
  onPartial: () => void;
  onAte: () => void;
}

export function MealActionButtons({ onNotAte, onPartial, onAte }: MealActionButtonsProps) {
  return (
    <div className="meal-action-buttons">
      <button className="meal-btn meal-btn--not-ate" onClick={onNotAte}>
        ✕ Nie zjadłem
      </button>
      <button className="meal-btn meal-btn--partial" onClick={onPartial}>
        🍽 Częściowo
      </button>
      <button className="meal-btn meal-btn--ate" onClick={onAte}>
        ✓ Zjadłem
      </button>
    </div>
  );
}
