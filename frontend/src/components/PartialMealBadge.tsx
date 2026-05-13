interface PartialMealBadgeProps {
  percentage: number;
  onEdit: () => void;
}

function getPiePath(pct: number, size: number): string | null {
  if (pct <= 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;

  if (pct >= 100) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }

  const angle = (pct / 100) * 2 * Math.PI;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const largeArc = pct > 50 ? 1 : 0;
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
}

export function PartialMealBadge({ percentage, onEdit }: PartialMealBadgeProps) {
  const path = getPiePath(percentage, 40);

  return (
    <div className="partial-badge">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="21.5" rx="18.4" ry="2.7" fill="rgba(0,0,0,0.08)" />
          <circle cx="20" cy="20" r="18.4" fill="#EDE8DF" />
          <circle cx="20" cy="20" r="17.6" fill="#FAF7F2" />
          {path && <path d={path} fill="#3CAB8F" opacity="0.88" />}
          <circle cx="20" cy="20" r="18.4" fill="none" stroke="#D4CCBF" strokeWidth="0.8" />
          <circle cx="20" cy="20" r="17.6" fill="none" stroke="#E8E0D4" strokeWidth="0.8" />
        </svg>
        <div className="partial-info">
          <div className="partial-pct">{percentage}%</div>
          <div className="partial-label">zjedzone</div>
        </div>
      </div>
      <button className="partial-edit-btn" onClick={onEdit}>
        Edytuj porcję
      </button>
    </div>
  );
}
