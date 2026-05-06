import { useState } from 'react';
import Navbar from '../components/Navbar';
import type { Screen } from '../types';
import { symptomTips } from '../data';

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
}

const SYMPTOMS = [
  { key: 'nausea', icon: 'ti-mood-sick', label: 'Nudności' },
  { key: 'taste', icon: 'ti-tongue', label: 'Brak smaku' },
  { key: 'diarrhea', icon: 'ti-ripple', label: 'Biegunka' },
  { key: 'mouth', icon: 'ti-tooth', label: 'Ból jamy ustnej' },
  { key: 'const', icon: 'ti-alert-circle', label: 'Zaparcia' },
];

function HomeMealCard({
  emoji, type, name, kcal, protein, tags,
}: {
  emoji: string; type: string; name: string; kcal: number; protein: number;
  tags: Array<{ t: string; c: string }>;
}) {
  const [liked, setLiked] = useState(false);
  const [act, setAct] = useState<'ok' | 'no' | null>(null);

  return (
    <div className="hmc">
      <div className="hmc-top">
        <div className="hmc-emoji">{emoji}</div>
        <div className="hmc-info">
          <div className="hmc-type">{type}</div>
          <div className="hmc-name">{name}</div>
        </div>
        <button className={`hmc-heart ${liked ? 'on' : ''}`} onClick={() => setLiked(!liked)}>
          <i className="ti ti-heart" />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
        {tags.map((tag) => (
          <span key={tag.t} className={`tag ${tag.c}`}>{tag.t}</span>
        ))}
      </div>
      <div className="hmc-foot">
        <span className="hmc-kcal">{kcal} kcal · {protein}g białka</span>
        <div className="hmc-acts">
          <div
            className={`act-btn ${act === 'ok' ? 'ok-on' : ''}`}
            onClick={() => setAct(act === 'ok' ? null : 'ok')}
          >
            <i className="ti ti-check" />
          </div>
          <div
            className={`act-btn ${act === 'no' ? 'no-on' : ''}`}
            onClick={() => setAct(act === 'no' ? null : 'no')}
          >
            <i className="ti ti-x" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ navigate, symptoms, setSymptoms }: Props) {
  const toggleSym = (key: string) => {
    if (symptoms.includes(key)) {
      setSymptoms(symptoms.filter((s) => s !== key));
    } else {
      setSymptoms([...symptoms, key]);
    }
  };

  const tip = symptoms.length > 0
    ? symptomTips[symptoms[symptoms.length - 1]]
    : 'Wybierz objawy, a dostaniesz spersonalizowane porady żywieniowe.';

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Dzień dobry!</h1>
          <p>środa, 6 maja 2026</p>
        </div>
        <div className="streak-pill">
          <i className="ti ti-flame" />
          <span>5</span>
          <small>dni</small>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 9 }}>
          Jak się teraz czujesz?
        </div>
        <div className="sym-grid">
          {SYMPTOMS.map((s) => (
            <div
              key={s.key}
              className={`sym-btn ${symptoms.includes(s.key) ? 'on' : ''}`}
              onClick={() => toggleSym(s.key)}
            >
              <i className={`ti ${s.icon}`} />
              <span>{s.label}</span>
            </div>
          ))}
          <div className="add-sym-btn" onClick={() => navigate('add-sym')}>
            <i className="ti ti-plus" />
            <span>Dodaj objaw</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="tip-card">
          <div className="tip-head">
            <i className="ti ti-bulb" />
            <span>Porada dla ciebie</span>
          </div>
          <p>{tip}</p>
        </div>
      </div>

      <div className="scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Dzisiejsze menu</span>
          <a style={{ fontSize: 12, color: 'var(--orange)', cursor: 'pointer' }} onClick={() => navigate('plan')}>
            Plan tygodnia →
          </a>
        </div>

        <HomeMealCard
          emoji="🥣" type="Śniadanie" name="Owsianka z bananem" kcal={320} protein={12}
          tags={[{ t: 'łagodne', c: 'g' }, { t: 'lekkostrawne', c: 'g' }]}
        />
        <HomeMealCard
          emoji="🍲" type="Obiad" name="Krem z dyni" kcal={280} protein={8}
          tags={[{ t: 'kremowe', c: '' }, { t: 'ciepłe', c: 'o' }]}
        />

        <div className="stat-row" style={{ marginTop: 4 }}>
          <div className="stat-c">
            <div className="sv green">47g</div>
            <div className="sl">Białko dziś</div>
          </div>
          <div className="stat-c">
            <div className="sv">75%</div>
            <div className="sl">Cel kaloryczny</div>
          </div>
        </div>

        <button className="orange-btn" onClick={() => navigate('order')}>
          Zamów posiłki na pojutrze →
        </button>
      </div>

      <Navbar active="home" navigate={navigate} />
    </div>
  );
}
