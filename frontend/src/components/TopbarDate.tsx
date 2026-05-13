import { formatDateLongPL, getToday } from '../utils';

const dateStr = formatDateLongPL(getToday());

export default function TopbarDate() {
  return (
    <span style={{
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text2)',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
      alignSelf: 'center',
    }}>
      {dateStr}
    </span>
  );
}
