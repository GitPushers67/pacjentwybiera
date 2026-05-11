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
      <button className={`nb ${active === 'nutrition' ? 'on' : ''}`} onClick={() => navigate('nutrition')}>
        <i className="ti ti-chart-bar" />
        <span>Makra</span>
      </button>
      <button className={`nb ${active === 'profile' ? 'on' : ''}`} onClick={() => navigate('profile')}>
        <i className="ti ti-user" />
        <span>Profil</span>
      </button>
    </div>
  );
}
