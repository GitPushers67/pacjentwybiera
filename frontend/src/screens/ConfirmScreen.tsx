import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

export default function ConfirmScreen({ navigate }: Props) {
  return (
    <div className="screen active">
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--glight)',
          border: '2px solid var(--gmid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <i className="ti ti-check" style={{ fontSize: 32, color: 'var(--green)' }} />
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          Zamówienie złożone!
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
          Posiłki na piątek, 8 maja przekazane do kuchni.
        </p>

        <div style={{
          background: 'var(--olight)',
          borderRadius: 13,
          padding: 13,
          width: '100%',
          textAlign: 'left',
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Wskazówki na piątek
          </p>
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
            Jedz co 2–3 godziny w małych porcjach. Pij 2,5 l płynów. Wywietrz pomieszczenie przed każdym posiłkiem.
          </p>
        </div>

        <button className="orange-btn" onClick={() => navigate('home')}>
          Wróć do strony głównej
        </button>
      </div>
    </div>
  );
}
