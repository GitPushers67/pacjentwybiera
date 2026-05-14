import type { Screen } from '../types';
import { getOrderableDate, formatDateLongPL } from '../utils';

interface Props {
  navigate: (s: Screen) => void;
  onEdit: () => void;
}

export default function ConfirmScreen({ navigate, onEdit }: Props) {
  const orderDate = getOrderableDate();
  const orderDateStr = formatDateLongPL(orderDate);
  const dayName = orderDateStr.split(',')[0];

  const now = new Date();
  const deadline = new Date();
  deadline.setHours(20, 0, 0, 0);
  const canEdit = now < deadline;

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
          Posiłki na <strong>{orderDateStr}</strong> zostały przekazane do kuchni.
        </p>

        {canEdit && (
          <div style={{
            background: 'var(--olight)',
            border: '1.5px solid var(--omid)',
            borderRadius: 13,
            padding: '11px 14px',
            width: '100%',
            textAlign: 'left',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <i className="ti ti-clock" style={{ fontSize: 16, color: 'var(--orange)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--orange)' }}>Możesz edytować do 20:00.</strong><br />
              Zmiany zostaną automatycznie zapisane w systemie kuchni.
            </p>
          </div>
        )}

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 13,
          padding: 13,
          width: '100%',
          textAlign: 'left',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--orange)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Wskazówki na {dayName}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            Jedz co 2–3 godziny w małych porcjach. Pij 2,5 l płynów. Wywietrz pomieszczenie przed każdym posiłkiem.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {canEdit && (
            <button
              onClick={onEdit}
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: 14,
                border: '1.5px solid var(--omid)',
                background: 'var(--bg)',
                color: 'var(--orange)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <i className="ti ti-edit" style={{ fontSize: 15 }} />
              Edytuj zamówienie
            </button>
          )}

          <button className="orange-btn" style={{ margin: 0 }} onClick={() => navigate('home')}>
            Wróć do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
}
