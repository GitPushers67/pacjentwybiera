import { useEffect, useRef, useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import Navbar from '../components/Navbar';
import SymptomModal from '../components/SymptomModal';
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

const SYMPTOMS = [
  { key: 'nausea', icon: 'ti-mood-sick', label: 'Nudności' },
  { key: 'appetite', icon: 'ti-bowl', label: 'Brak apetytu' },
  { key: 'diarrhea', icon: 'ti-ripple', label: 'Biegunka' },
];

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
  const getColor = () => {
    if (value === 'full') return 'var(--green)';
    if (value === 'partial') return 'var(--amber)';
    return 'var(--red)';
  };

  const getLabel = () => {
    if (value === 'full') return 'Zjedzone';
    if (value === 'partial') return 'Częściowo';
    return 'Nie zjedzone';
  };

  const handleClick = () => {
    const cycle: EatenStatus[] = ['full', 'partial', 'none'];
    const idx = cycle.indexOf(value);
    const next = cycle[(idx + 1) % cycle.length];
    onChange(next);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        background: getColor(),
        border: 'none',
        borderRadius: 22,
        padding: '7px 13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        flexShrink: 0,
        boxShadow: `0 2px 8px ${getColor()}50`,
        transition: 'all 0.2s',
      }}
    >
      <i
        className={`ti ${value === 'full' ? 'ti-check' : value === 'partial' ? 'ti-minus' : 'ti-x'}`}
        style={{ fontSize: 12, color: '#fff' }}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
        {getLabel()}
      </span>
    </button>
  );
}

function MealCard({ meal, isCurrent, choices, status, camState, onEaten, onCamera, onPartial }: {
  meal: Meal;
  isCurrent?: boolean;
  choices: Record<string, number>;
  status: EatenStatus;
  camState: CamState;
  onEaten: (v: EatenStatus) => void;
  onCamera: () => void;
  onPartial: () => void;
}) {
  const opt = getOption(meal, choices[meal.id] ?? 0);
  
  const handleEatenChange = (v: EatenStatus) => {
    onEaten(v);
    if (v === 'partial') {
      setTimeout(() => onPartial(), 0);
    }
  };
  
  return (
    <div className={`hmc ${isCurrent ? 'hmc-current ' : ''}${status === 'full' ? 'hmc-eaten' : status === 'partial' ? 'hmc-partial' : 'hmc-not-eaten'}`}>
      <div className="hmc-top">
        <div className="hmc-info">
          <div className="hmc-type">{meal.title} · {meal.time}</div>
          <div className="hmc-name">{opt.name}</div>
        </div>
        <EatenToggle value={status} onChange={handleEatenChange} />
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="tag b">{opt.protein}g białka</span>
        <span className="tag o">{opt.kcal} kcal</span>
      </div>
      {status !== 'partial' ? (
        <CameraButton camState={camState} onPress={onCamera} />
      ) : (
        <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
          ⏳ Oczekuje na zdjęcie...
        </div>
      )}
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

export default function HomeScreen({ navigate, symptoms, setSymptoms, choices, eatenMap, setEatenMap }: Props) {
  const [modalSym, setModalSym] = useState<string | null>(null);
  const [symIntensity, setSymIntensity] = useState<Record<string, number>>({});
  const [cameraMap, setCameraMap] = useState<Record<string, CamState>>({});
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const now = useNow();
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Waste analysis upload
  const [uploadMealId, setUploadMealId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => getToday(), []);

  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    fetchMenuForDate(formatDateForAPI(today)).then(setApiMeals);
  }, [today]);

  const meals = apiMeals ?? fallbackMeals;

  const openSym = (key: string) => {
    if (!symptoms.includes(key)) setSymptoms([...symptoms, key]);
    setModalSym(key);
  };

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

  // Obsługa uploadu zdjęcia dla analizy resztek
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadMealId) {
      console.log('📸 Wybrany plik:', file.name, 'dla posiłku:', uploadMealId);
      setSelectedFile(file);
      handleUploadAnalysis(file);
    }
  };

  const handleUploadAnalysis = async (file: File) => {
    if (!uploadMealId) return;

    setUploadLoading(true);
    const meal = meals.find(m => m.id === uploadMealId);
    if (!meal) return;

    const opt = getOption(meal, choices[uploadMealId] ?? 0);

    try {
      // Parsuj weight z formatu "221g" → 221
      const weightStr = opt.weight?.replace(/[^0-9.]/g, '') || '300';
      const weightGrams = parseFloat(weightStr);

      // Uproszczenie składników na kluczowe słowa
      const ingredientsList = (opt.ingredients || '')
        .split(',')
        .map(i => i.trim())
        .slice(0, 10)
        .join(',');

      const formData = new FormData();
      formData.append('image', file);
      // Wysyłamy składniki jako class_constraints zamiast dish_name
      formData.append('class_constraints', ingredientsList);
      formData.append('calories_kcal', String(opt.kcal));
      formData.append('protein_grams', String(opt.protein));
      formData.append('fat_grams', String(opt.fat));
      formData.append('carbs_grams', String(opt.carbs));
      formData.append('weight_grams', String(weightGrams)); // Realna waga z menu
      formData.append('reference_weight', String(weightGrams)); // Dla LogMeal
      formData.append('reference_object', 'true'); // Włącz detekcję widelca

      console.log('📋 Parametry przesyłane:', {
        dish: opt.name,
        weight_grams: weightGrams,
        class_constraints: ingredientsList,
        calories: opt.kcal,
        protein: opt.protein,
      });

      const response = await fetch('http://localhost:8000/api/logmeal/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error:', response.status, errorText);
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Odpowiedź z backendu:', data);

      // ✅ Obsługa fallback mode (LogMeal nie rozpoznał resztek)
      if (data.error === 'unrecognized_image') {
        console.warn('⚠️ FALLBACK MODE:', data.message);
        console.warn('📝 Prosimy o ręczne określenie procent zjedzenia');
        return;
      }

      // ✅ Normalny flow - LogMeal rozpoznał resztki
      console.log('📊 Analiza zjedzenia:', {
        consumed_percent: data.analysis?.consumed_percent,
        missing_nutrients: data.analysis?.missing_nutrients,
        recommendation: data.recommendation,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('❌ Błąd podczas analizy:', errorMsg);
    } finally {
      setUploadLoading(false);
      setUploadMealId(null);
      setSelectedFile(null);
    }
  };

  const currentMealId = getCurrentMealId();

  const totalKcalEaten    = meals.reduce((s, m) => s + getOption(m, choices[m.id] ?? 0).kcal    * (eatenMap[m.id] === 'full' ? 1 : 0), 0);
  const totalProteinEaten = meals.reduce((s, m) => s + getOption(m, choices[m.id] ?? 0).protein * (eatenMap[m.id] === 'full' ? 1 : 0), 0);

  const activeSym = SYMPTOMS.find((s) => s.key === modalSym);

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
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 9 }}>
          Jak się teraz czujesz?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SYMPTOMS.map((s) => (
            <div
              key={s.key}
              className={`sym-btn ${symptoms.includes(s.key) ? 'on' : ''}`}
              style={{ flex: 1 }}
              onClick={() => openSym(s.key)}
            >
              <i className={`ti ${s.icon}`} />
              <span>{s.label}</span>
            </div>
          ))}
          <div className="add-sym-btn" style={{ flex: 1 }} onClick={() => navigate('add-sym')}>
            <i className="ti ti-plus" />
            <span>Więcej</span>
          </div>
        </div>
      </div>


      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8 }}>
        <div className="home-stat-pill home-stat-orange">
          <i className="ti ti-flame" style={{ fontSize: 13, color: 'var(--orange)' }} />
          <span className="hsp-val">{totalKcalEaten}</span>
          <span className="hsp-lbl">kcal spożyte</span>
        </div>
        <div className="home-stat-pill home-stat-blue">
          <i className="ti ti-barbell" style={{ fontSize: 13, color: '#3b82f6' }} />
          <span className="hsp-val">{totalProteinEaten}g</span>
          <span className="hsp-lbl">białka spożyte</span>
        </div>
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
            onPartial={() => { setUploadMealId(meal.id); fileInputRef.current?.click(); }}
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
            onPartial={() => { setUploadMealId(meal.id); fileInputRef.current?.click(); }}
          />
        ))}

        <button className="orange-btn" style={{ marginTop: 4 }} onClick={() => navigate('order')}>
          Zamów posiłki na piątek, 8 maja →
        </button>
      </div>

      {modalSym && activeSym && (
        <SymptomModal
          symptom={activeSym}
          intensity={symIntensity[modalSym] ?? 3}
          onIntensityChange={(v) => setSymIntensity({ ...symIntensity, [modalSym]: v })}
          onClose={() => setModalSym(null)}
          onRemove={() => { setSymptoms(symptoms.filter((s) => s !== modalSym)); setModalSym(null); }}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Navbar active="home" navigate={navigate} />
    </div>
  );
}
