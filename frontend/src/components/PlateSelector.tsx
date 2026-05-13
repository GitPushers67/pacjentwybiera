import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';

interface PlateSelectorProps {
  initialPct?: number;
  onConfirm: (pct: number) => void;
  onCancel: () => void;
}

export function PlateSelector({ initialPct = 50, onConfirm, onCancel }: PlateSelectorProps) {
  const [percentage, setPercentage] = useState(Math.max(5, Math.min(100, initialPct)));
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setPercentage(Math.max(5, Math.min(100, initialPct)));
  }, [initialPct]);

  const getPiePath = (pct: number): string | null => {
    if (pct <= 0) return null;

    if (pct >= 100) {
      return 'M 90 18 A 72 72 0 1 1 89.999 18 Z';
    }

    const angle = (pct / 100) * 2 * Math.PI;
    const x = 90 + 72 * Math.sin(angle);
    const y = 90 - 72 * Math.cos(angle);
    const largeArc = pct > 50 ? 1 : 0;
    return `M 90 90 L 90 18 A 72 72 0 ${largeArc} 1 ${x} ${y} Z`;
  };

  const getDescriptionText = (pct: number): string => {
    if (pct === 100) return 'Wszystko';
    if (pct <= 10) return 'Prawie nic';
    if (pct <= 30) return 'Mało';
    if (pct <= 60) return 'Około połowy';
    if (pct <= 85) return 'Większość';
    return 'Prawie wszystko';
  };

  const calcPct = (clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return percentage;

    const rect = svg.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);

    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += 2 * Math.PI;

    let pct = Math.round((angle / (2 * Math.PI)) * 100);
    if (pct === 0) pct = 100;
    return Math.max(5, Math.min(100, pct));
  };

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPercentage(calcPct(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    setPercentage(calcPct(e.clientX, e.clientY));
  };

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePresetClick = (pct: number) => {
    setPercentage(pct);
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPercentage(Math.max(5, Math.min(100, parseInt(e.target.value, 10))));
  };

  const handleConfirm = () => {
    onConfirm(percentage);
  };

  const pathD = getPiePath(percentage);
  const ringLength = 2 * Math.PI * 82;

  return (
    <div className="plate-selector">
      <div className="plate-selector-title">Ile zjadłeś?</div>

      <div className="plate-svg-container" style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          className="plate-svg"
          viewBox="0 0 180 180"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <ellipse cx="90" cy="95" rx="83" ry="14" fill="rgba(0,0,0,0.08)" />
          <circle cx="90" cy="90" r="83" fill="#EDE8DF" />
          <circle cx="90" cy="90" r="79" fill="#FAF7F2" />
          {pathD && <path d={pathD} fill="#3CAB8F" opacity="0.88" />}
          <circle cx="90" cy="90" r="83" fill="none" stroke="#D4CCBF" strokeWidth="1.5" />
          <circle cx="90" cy="90" r="79" fill="none" stroke="#E8E0D4" strokeWidth="1" />
          {[25, 50, 75].map((tick) => {
            const angle = (tick / 100) * 2 * Math.PI;
            const x1 = 90 + 77 * Math.sin(angle);
            const y1 = 90 - 77 * Math.cos(angle);
            const x2 = 90 + 82 * Math.sin(angle);
            const y2 = 90 - 82 * Math.cos(angle);
            return (
              <line
                key={`tick-${tick}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#B8B0A4"
                strokeWidth="1.5"
              />
            );
          })}
          {percentage > 0 && percentage < 100 && (
            <circle
              cx="90"
              cy="90"
              r="82"
              fill="none"
              stroke="#3CAB8F"
              strokeWidth="3"
              strokeDasharray={`${(percentage / 100) * ringLength} ${ringLength}`}
              strokeDashoffset={ringLength * 0.25}
              strokeLinecap="round"
              opacity="0.6"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            {percentage}%
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            {getDescriptionText(percentage)}
          </div>
        </div>
      </div>

      <div className="plate-hint">Przeciągnij po talerzu lub wybierz poniżej</div>

      <div className="plate-presets">
        {[
          { label: '¼', pct: 25, sub: '25%' },
          { label: '½', pct: 50, sub: '50%' },
          { label: '¾', pct: 75, sub: '75%' },
          { label: '🍽', pct: 100, sub: '100%' },
        ].map(({ label, pct, sub }) => (
          <button
            key={pct}
            className={`plate-preset-btn ${percentage === pct ? 'active' : ''}`}
            onClick={() => handlePresetClick(pct)}
          >
            <span className={pct === 100 ? 'plate-preset-emoji' : 'plate-preset-label'}>
              {label}
            </span>
            <span className="plate-preset-label">{sub}</span>
          </button>
        ))}
      </div>

      <input
        type="range"
        min="5"
        max="100"
        step="5"
        value={percentage}
        onChange={handleSliderChange}
        className="plate-slider"
      />

      <div className="plate-actions">
        <button className="plate-btn-cancel" onClick={onCancel}>
          Anuluj
        </button>
        <button className="plate-btn-confirm" onClick={handleConfirm}>
          Zatwierdź — {percentage}%
        </button>
      </div>
    </div>
  );
}
