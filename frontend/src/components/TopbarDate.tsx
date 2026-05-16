import { formatDateShortPL, getToday } from '../utils';
import type { Screen } from '../types';

const dateStr = formatDateShortPL(getToday());

interface Props {
  navigate?: (s: Screen) => void;
}

export default function TopbarDate({ navigate }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text2)',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        alignSelf: 'center',
      }}>
        {dateStr}
      </span>

      {navigate && (
        <button
          onClick={() => navigate('profile')}
          style={{
            background: 'var(--border)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <i className="ti ti-user" style={{ fontSize: 18, color: 'var(--text2)' }} />
        </button>
      )}
    </div>
  );
}
