import { useState } from 'react';
import type { Screen, PatientProfile } from '../types';
import { allergensList } from '../data';
import logo from '../assets/logo.png';
import { upsertPatient } from '../services/patients';

interface Props {
  navigate: (s: Screen) => void;
  onComplete: (p: PatientProfile) => void;
}

const CANCER_TYPES = [
  { key: 'breast', label: 'Rak piersi' },
  { key: 'colon', label: 'Rak jelita grubego' },
  { key: 'lung', label: 'Rak płuca' },
  { key: 'stomach', label: 'Rak żołądka' },
  { key: 'lymphoma', label: 'Chłoniak' },
  { key: 'leukemia', label: 'Białaczka' },
  { key: 'other', label: 'Inny' },
];

const TREATMENT_TYPES: { key: PatientProfile['treatmentType']; label: string }[] = [
  { key: 'chemo', label: 'Chemioterapia' },
  { key: 'radio', label: 'Radioterapia' },
  { key: 'surgery', label: 'Chirurgia' },
  { key: 'combined', label: 'Leczenie skojarzone' },
];

const TOTAL_STEPS = 3;

export default function OnboardingScreen({ navigate, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<PatientProfile['sex']>('');
  const [birthYear, setBirthYear] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [treatmentType, setTreatmentType] = useState<PatientProfile['treatmentType']>('');
  const [allergens, setAllergens] = useState<string[]>([]);

  const canNext1 = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canNext2 = Number(weightKg) >= 20 && Number(weightKg) <= 350 && sex !== '';

  const toggleAllergen = (key: string) => {
    setAllergens(allergens.includes(key) ? allergens.filter(a => a !== key) : [...allergens, key]);
  };

  const handleComplete = async () => {
    const profile: PatientProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      birthYear: Number(birthYear) || 1970,
      weightKg: Number(weightKg) || 65,
      heightCm: Number(heightCm) || 170,
      cancerType,
      treatmentType,
      allergens,
    };
    await upsertPatient(profile);
    onComplete(profile);
    navigate('home');
  };

  return (
    <div className="screen active" style={{ background: 'var(--bg)', overflowY: 'auto' }}>
      <div className="onboard-wrap">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img
            src={logo}
            alt="Pacjent Wybiera"
            style={{ height: 52, objectFit: 'contain' }}
          />
        </div>
        <div className="onboard-step-indicators">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`onboard-step-dot ${i + 1 <= step ? 'active' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Miło Cię poznać!
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                Podaj swoje dane, abyśmy mogli personalizować menu i obliczać Twoje dzienne zapotrzebowanie.
              </p>
            </div>

            <label className="onboard-label required">Imię</label>
            <input
              className="onboard-input"
              type="text"
              placeholder="np. Jan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />

            <label className="onboard-label required">Nazwisko</label>
            <input
              className="onboard-input"
              type="text"
              placeholder="np. Kowalski"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <label className="onboard-label">Rok urodzenia</label>
            <input
              className="onboard-input"
              type="number"
              placeholder="np. 1965"
              min={1920} max={2010}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Dane medyczne
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                Waga, wzrost, wiek i płeć są potrzebne do obliczenia dziennego zapotrzebowania kalorycznego.
                Cel białka wyliczamy jako 1,2 g/kg masy ciała.
              </p>
            </div>

            <label className="onboard-label required">Waga (kg)</label>
            <input
              className="onboard-input"
              type="number"
              placeholder="np. 68"
              min={20} max={350}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              autoFocus
            />

            <label className="onboard-label">Wzrost (cm)</label>
            <input
              className="onboard-input"
              type="number"
              placeholder="np. 172"
              min={100} max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />

            <label className="onboard-label">Płeć</label>
            <select
              className="onboard-select"
              value={sex}
              onChange={(e) => setSex(e.target.value as PatientProfile['sex'])}
            >
              <option value="">— wybierz —</option>
              <option value="female">Kobieta</option>
              <option value="male">Mężczyzna</option>
            </select>

            <label className="onboard-label">Rodzaj nowotworu</label>
            <select
              className="onboard-select"
              value={cancerType}
              onChange={(e) => setCancerType(e.target.value)}
            >
              <option value="">— wybierz —</option>
              {CANCER_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>

            <label className="onboard-label">Aktualny rodzaj leczenia</label>
            <select
              className="onboard-select"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value as PatientProfile['treatmentType'])}
            >
              <option value="">— wybierz —</option>
              {TREATMENT_TYPES.map((t) => (
                <option key={t.key} value={t.key!}>{t.label}</option>
              ))}
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Alergie i wykluczenia
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                Zaznacz produkty, które należy wykluczyć z Twojego menu. Możesz to zmienić w Profilu.
              </p>
            </div>

            <div className="allergen-grid">
              {allergensList.map((a) => (
                <button
                  key={a.key}
                  className={`allergen-btn ${allergens.includes(a.key) ? 'on' : ''}`}
                  onClick={() => toggleAllergen(a.key)}
                >
                  <i className={`ti ${a.icon}`} />
                  <span>{a.label}</span>
                  {allergens.includes(a.key) && (
                    <i className="ti ti-check allergen-check" />
                  )}
                </button>
              ))}
            </div>

            {allergens.length > 0 && (
              <div style={{
                marginTop: 12,
                padding: '8px 12px',
                background: 'var(--rlight)',
                borderRadius: 10,
                border: '1px solid var(--red)',
                fontSize: 11,
                color: 'var(--red)',
              }}>
                <i className="ti ti-ban" style={{ marginRight: 5 }} />
                Wykluczone: {allergens
                  .map((k) => allergensList.find((a) => a.key === k)?.label)
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 1 && (
              <button
                className="outline-btn"
                style={{ flex: 1 }}
                onClick={() => setStep(step - 1)}
              >
                ← Wróć
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                className="orange-btn"
                style={{ flex: 1 }}
                disabled={step === 1 ? !canNext1 : step === 2 ? !canNext2 : false}
                onClick={() => setStep(step + 1)}
              >
                Dalej →
              </button>
            ) : (
              <button className="orange-btn" style={{ flex: 1 }} onClick={handleComplete}>
                Gotowe — zacznij dzień!
              </button>
            )}
          </div>

          <div className="rodo-note" style={{ marginTop: 12 }}>
            <i className="ti ti-shield-lock" />
            <span>Twoje dane przetwarzane są lokalnie i nie trafiają do chmury. Zgodność z RODO.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
