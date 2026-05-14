import Navbar from '../components/Navbar';
import TopbarDate from '../components/TopbarDate';
import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
}

const FAKE_MESSAGES = [
  { from: 'bot', text: 'Dzień dobry! Jak się dzisiaj czujesz?' },
  { from: 'user', text: 'Mam nudności po wczorajszej chemii' },
  { from: 'bot', text: 'Rozumiem. Polecam lekkie, łatwe do strawienia posiłki. Czy masz ochotę na kleik ryżowy lub tosty?' },
  { from: 'user', text: 'Może tosty' },
  { from: 'bot', text: 'Świetnie! Dodałam to do Twojego planu. Pamiętaj o małych porcjach.' },
];

export default function ChatScreen({ navigate }: Props) {
  return (
    <div className="screen active">
      <div className="topbar">
        <div><h1>Chat z dietetykiem</h1></div>
        <TopbarDate navigate={navigate} />
      </div>

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Blurred fake chat */}
        <div style={{ filter: 'blur(5px)', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none', userSelect: 'none' }}>
          {FAKE_MESSAGES.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.from === 'user' ? 'var(--orange)' : 'var(--card)',
                color: msg.from === 'user' ? '#fff' : 'var(--text)',
                fontSize: 14,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                border: msg.from === 'bot' ? '1px solid var(--border)' : 'none',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {/* Fake input */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            <div style={{
              flex: 1,
              background: 'var(--bg)',
              borderRadius: 22,
              padding: '10px 16px',
              fontSize: 14,
              color: 'var(--text3)',
            }}>
              Napisz wiadomość...
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <i className="ti ti-send" style={{ fontSize: 18, color: '#fff' }} />
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '24px',
          background: 'rgba(248, 250, 252, 0.55)',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--olight)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i className="ti ti-lock" style={{ fontSize: 28, color: 'var(--orange)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
              Rozszerzona funkcjonalność
            </p>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0, lineHeight: 1.5 }}>
              Rozmowa z dietetykiem będzie dostępna w pełnej wersji aplikacji. Nasz specjalista odpowie na Twoje pytania dotyczące diety podczas leczenia.
            </p>
          </div>
        </div>
      </div>

      <Navbar active="chat" navigate={navigate} />
    </div>
  );
}
