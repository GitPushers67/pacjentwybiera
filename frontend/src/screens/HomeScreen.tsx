import { useEffect, useRef, useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import Navbar from '../components/Navbar';
import type { EatenStatus, Meal, PatientProfile, Screen } from '../types';
import { meals as fallbackMeals } from '../data';
import { getOption, getToday, formatDateForAPI } from '../utils';
import { fetchMenuForDate } from '../api';
import logo from '../assets/logo.png';

type CamState = 'idle' | 'scanning' | 'done';

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  wellbeing: number;
  choices: Record<string, number>;
  eatenMap: Record<string, EatenStatus>;
  setEatenMap: Dispatch<SetStateAction<Record<string, EatenStatus>>>;
  patient: PatientProfile;
}

const CAM_LABEL: Record<CamState, string> = {
  idle:     'Zrób zdjęcie — AI wykryje co zjedzone',
  scanning: 'Analizuję zdjęcie...',
  done:     'AI: posiłek rozpoznany ✓',
};

function CameraButton({ camState, onPress }: { camState: CamState; onPress: () => void }) {
  const icon = camState === 'scanning' ? 'ti-loader-2 cam-spin' : camState === 'done' ? 'ti-check' : 'ti-camera';
  return (
    <button className={`camera-scan-btn ${camState}`} onClick={onPress}>
      <i className={`ti ${icon}`} style={{ fontSize: 13 }} />
      <span>{CAM_LABEL[camState]}</span>
    </button>
  );
}

function EatenToggle({ value, onChange }: { value: EatenStatus; onChange: (v: EatenStatus) => void }) {
  const eaten = value === 'full';
  return (
    <button
      onClick={() => onChange(eaten ? 'none' : 'full')}
      style={{
        background: eaten ? 'var(--green)' : 'var(--red)',
        border: 'none',
        borderRadius: 22,
        padding: '7px 13px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        flexShrink: 0,
        boxShadow: eaten
          ? '0 2px 8px rgba(45,125,90,0.35)'
          : '0 2px 8px rgba(192,57,43,0.35)',
      }}
    >
      <i className={`ti ${eaten ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 12, color: '#fff' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
        {eaten ? 'Zjedzone' : 'Nie zjedzone'}
      </span>
    </button>
  );
}

function MealCard({ meal, isCurrent, choices, status, camState, onEaten, onCamera }: {
  meal: Meal;
  isCurrent?: boolean;
  choices: Record<string, number>;
  status: EatenStatus;
  camState: CamState;
  onEaten: (v: EatenStatus) => void;
  onCamera: () => void;
}) {
  const opt = getOption(meal, choices[meal.id] ?? 0);
  return (
    <div className={`hmc ${isCurrent ? 'hmc-current ' : ''}${status === 'full' ? 'hmc-eaten' : 'hmc-not-eaten'}`}>
      <div className="hmc-top">
        <div className="hmc-info">
          <div className="hmc-type">{meal.title} · {meal.time}</div>
          <div className="hmc-name">{opt.name}</div>
        </div>
        <EatenToggle value={status} onChange={onEaten} />
      </div>
      <CameraButton camState={camState} onPress={onCamera} />
    </div>
  );
}

function getCurrentMealId(): string {
  const h = new Date().getHours();
  if (h < 9) return 'breakfast';
  if (h < 12) return 'lunch2';
  if (h < 15) return 'dinner';
  if (h < 18) return 'snack';
  return 'supper';
}

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function HomeScreen({ navigate, choices, eatenMap, setEatenMap }: Props) {
  const [cameraMap, setCameraMap] = useState<Record<string, CamState>>({});
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const now = useNow();
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const today = useMemo(() => getToday(), []);

  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    fetchMenuForDate(formatDateForAPI(today)).then(setApiMeals);
  }, [today]);

  const meals = apiMeals ?? fallbackMeals;

  const triggerCamera = (mealId: string) => {
    if (cameraMap[mealId] === 'scanning') return;
    setCameraMap(prev => ({ ...prev, [mealId]: 'scanning' }));
    const t1 = setTimeout(() => {
      setCameraMap(prev => ({ ...prev, [mealId]: 'done' }));
      setEatenMap(prev => ({ ...prev, [mealId]: 'full' }));
      const t2 = setTimeout(() => setCameraMap(prev => ({ ...prev, [mealId]: 'idle' })), 2800);
      timerRefs.current.push(t2);
    }, 2200);
    timerRefs.current.push(t1);
  };

  const currentMealId = getCurrentMealId();

  return (
    <div className="screen active">
      <div className="topbar" style={{ alignItems: 'center' }}>
        <img
          src={logo}
          alt="Pacjent Wybiera"
          style={{ height: 44, objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              {now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
              środa, 7 maja
            </div>
          </div>
          <div className="streak-pill">
            <i className="ti ti-flame" />
            <span>5</span>
            <small>dni</small>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => navigate('add-sym')}
          style={{
            width: '100%',
            border: '1px solid var(--border)',
            background: '#fff',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Jak się dziś czujesz?
          </div>
          <i className="ti ti-chevron-right" style={{ fontSize: 16, color: 'var(--text2)' }} />
        </button>
      </div>

      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Dzisiejsze menu</span>
          <a style={{ fontSize: 12, color: 'var(--orange)', cursor: 'pointer' }} onClick={() => navigate('plan')}>
            Plan →
          </a>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="ti ti-clock" style={{ fontSize: 12 }} />
          Aktualny posiłek
        </div>
        {meals.filter((m) => m.id === currentMealId).map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            isCurrent
            choices={choices}
            status={eatenMap[meal.id] ?? 'none'}
            camState={cameraMap[meal.id] ?? 'idle'}
            onEaten={(v) => setEatenMap(prev => ({ ...prev, [meal.id]: v }))}
            onCamera={() => triggerCamera(meal.id)}
          />
        ))}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="ti ti-list" style={{ fontSize: 12 }} />
          Pozostałe posiłki
        </div>
        {meals.filter((m) => m.id !== currentMealId).map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            choices={choices}
            status={eatenMap[meal.id] ?? 'none'}
            camState={cameraMap[meal.id] ?? 'idle'}
            onEaten={(v) => setEatenMap(prev => ({ ...prev, [meal.id]: v }))}
            onCamera={() => triggerCamera(meal.id)}
          />
        ))}

        <button className="orange-btn" style={{ marginTop: 4 }} onClick={() => navigate('order')}>
          Zamów posiłki na piątek, 8 maja →
        </button>
      </div>

      <Navbar active="home" navigate={navigate} />
    </div>
  );
}
