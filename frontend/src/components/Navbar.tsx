import type { Screen } from '../types';

interface Props {
  active: Screen;
  navigate: (s: Screen) => void;
}

export default function Navbar({ active, navigate }: Props) {
  return (
    <div className="navbar">
      <button className={`nb ${active === 'home' ? 'on' : ''}`} onClick={() => navigate('home')}>
        <i className="ti ti-home" />
        <span>Główna</span>
      </button>
      <button className={`nb ${active === 'plan' ? 'on' : ''}`} onClick={() => navigate('plan')}>
        <i className="ti ti-calendar" />
        <span>Plan</span>
      </button>
      <button className={`nb ${active === 'order' ? 'on' : ''}`} onClick={() => navigate('order')}>
        <i className="ti ti-shopping-cart" />
        <span>Zamów</span>
      </button>
      <button className={`nb ${active === 'add-sym' ? 'on' : ''}`} onClick={() => navigate('add-sym')}>
        <i className="ti ti-mood-sick" />
        <span>Objawy</span>
      </button>
      <button className={`nb ${active === 'chat' ? 'on' : ''}`} onClick={() => navigate('chat')}>
        <i className="ti ti-message-circle" />
        <span>Chat</span>
      </button>
    </div>
  );
}
