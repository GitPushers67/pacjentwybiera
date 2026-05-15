interface Props {
  streak: number;
}

export default function StreakBanner({ streak }: Props) {
  if (streak === 0) return null;

  const getMessage = (s: number) => {
    if (s === 1) return 'Dobry start! Kontynuuj jutro.';
    if (s < 3) return 'Dobra passa! Tak trzymaj.';
    if (s < 7) return 'Świetna seria! Twoje ciało to czuje.';
    if (s < 14) return 'Niesamowite! Tydzień konsekwencji.';
    return 'Mistrz regularności! Jesteś wzorem.';
  };

  const getColor = (s: number) => {
    if (s < 3) return { bg: 'var(--olight)', border: 'var(--omid)', text: 'var(--orange)', icon: 'ti-flame' };
    if (s < 7) return { bg: 'var(--glight)', border: 'var(--gmid)', text: 'var(--green)', icon: 'ti-flame' };
    return { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.3)', text: '#7c3aed', icon: 'ti-award' };
  };

  const c = getColor(streak);

  return (
    <div style={{
      margin: '0 16px 12px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`ti ${c.icon}`} style={{ fontSize: 18, color: c.text }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: c.text, lineHeight: 1 }}>{streak}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>
            {streak === 1 ? 'dzień z rzędu' : streak < 5 ? 'dni z rzędu' : 'dni z rzędu'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
          {getMessage(streak)}
        </div>
      </div>
    </div>
  );
}
