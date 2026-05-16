import type { Meal } from '../types';
import { getOption } from '../utils';

const MEAL_ALTERNATIVES: Record<string, { name: string; tip: string }> = {
  breakfast: { name: 'Kleik ryżowy z miodem i bananem', tip: 'Ugotuj ½ szklanki ryżu w 2 szklankach mleka, dodaj łyżkę miodu i pokrojonego banana. Gotowe w 15 minut.' },
  lunch2:    { name: 'Jogurt naturalny z musem owocowym', tip: 'Zmiksuj jogurt z dojrzałym bananem lub brzoskwinią. Łatwe do przełknięcia, bogate w białko.' },
  dinner:    { name: 'Zupa krem z dyni lub marchewki', tip: 'Ugotuj warzywa, zmiksuj z odrobiną masła i śmietany. Ciepła, łagodna, łatwa do jedzenia.' },
  snack:     { name: 'Pieczone jabłko z cynamonem', tip: 'Jabłko piecz 20 min w 180°C. Miękkie, słodkie, bezpieczne przy wrażliwym żołądku.' },
  supper:    { name: 'Twarożek z rzodkiewką i szczypiorkiem', tip: 'Lekka kolacja na zimno. Twaróg dostarcza białka, nie obciąża żołądka przed snem.' },
  shake:     { name: 'Koktajl bananowo-mleczny', tip: 'Zmiksuj banana z mlekiem i łyżką miodu. Szybkie 200 kcal i 8g białka w szklance.' },
  shot:      { name: 'Woda z cytryną i miodem', tip: 'Sok z ½ cytryny + łyżka miodu w ciepłej wodzie. Nawadnia i dostarcza witaminę C.' },
};

interface Props {
  meal: Meal;
  optionIdx: number;
  onClose: () => void;
}

export default function MealDetailModal({ meal, optionIdx, onClose }: Props) {
  const opt = getOption(meal, optionIdx);
  const alt = MEAL_ALTERNATIVES[meal.id];
  const isRecommended = opt.isRec;

  const macros = [
    { val: opt.kcal,    lbl: 'kcal',    cls: 'mc-kcal', icon: 'ti-flame' },
    { val: opt.protein, lbl: 'białko',  cls: 'mc-prot', icon: 'ti-meat' },
    { val: opt.carbs,   lbl: 'węgle',   cls: 'mc-carb', icon: 'ti-wheat' },
    { val: opt.fat,     lbl: 'tłuszcz', cls: 'mc-fat',  icon: 'ti-droplet' },
  ];

  // Treść "Co Ci to daje" — konkretna dla rekomendowanej vs alternatywnej
  const whyText = opt.why;
  const scoreText = opt.scoreReason;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet" style={{ overflowY: 'auto', maxHeight: '85%' }}>
        <div className="modal-handle" />

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: isRecommended ? 'var(--glight)' : 'var(--olight)',
              border: `1px solid ${isRecommended ? 'var(--gmid)' : 'var(--omid)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {opt.emoji}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {meal.title} · {meal.time}
                </div>
                {isRecommended ? (
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', background: 'var(--glight)', border: '1px solid var(--gmid)', borderRadius: 6, padding: '1px 5px' }}>
                    Rekomendowane
                  </span>
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--orange)', background: 'var(--olight)', border: '1px solid var(--omid)', borderRadius: 6, padding: '1px 5px' }}>
                    Alternatywa
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, maxWidth: 220 }}>
                {opt.name}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Makroskładniki */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
          {macros.map(({ val, lbl, cls, icon }) => (
            <div key={lbl} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'var(--bg)', borderRadius: 11, padding: '9px 4px',
              border: '1px solid var(--border)',
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: 13, color: 'var(--text3)' }} />
              <div className={`cmi-mc ${cls}`} style={{ width: '100%', fontSize: 12, textAlign: 'center' }}>{val}</div>
              <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* Tagi */}
        {opt.tags && opt.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {opt.tags.map((tag) => (
              <span key={tag.t} className={`tag ${tag.c}`}>{tag.t}</span>
            ))}
          </div>
        )}

        {/* Dlaczego to danie */}
        <div style={{
          background: isRecommended ? 'var(--glight)' : 'var(--olight)',
          border: `1px solid ${isRecommended ? 'var(--gmid)' : 'var(--omid)'}`,
          borderRadius: 13, padding: '11px 13px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <i className={`ti ${isRecommended ? 'ti-heart-rate-monitor' : 'ti-info-circle'}`}
              style={{ fontSize: 13, color: isRecommended ? 'var(--green)' : 'var(--orange)' }} />
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: isRecommended ? 'var(--green)' : 'var(--orange)',
            }}>
              {isRecommended ? 'Dlaczego to danie?' : 'O tej opcji'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
            {whyText}
          </p>
          {scoreText && (
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: '6px 0 0', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6 }}>
              {scoreText}
            </p>
          )}
        </div>

        {/* Składniki */}
        {opt.ingredients && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Składniki
            </div>
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.55, margin: 0 }}>
              {opt.ingredients}
            </p>
          </div>
        )}

        {/* Alergeny */}
        {opt.allergensText && (
          <div style={{
            background: 'var(--alight)', border: '1px solid #f5c775',
            borderRadius: 11, padding: '8px 12px', marginBottom: 12,
            display: 'flex', gap: 7, alignItems: 'flex-start',
          }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 13, color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', marginBottom: 2 }}>Alergeny</div>
              <p style={{ fontSize: 11, color: 'var(--text)', margin: 0 }}>{opt.allergensText}</p>
            </div>
          </div>
        )}

        {/* Alternatywa gdy nie ma ochoty */}
        {alt && (
          <div style={{
            background: 'var(--olight)', border: '1px solid var(--omid)',
            borderRadius: 13, padding: '11px 13px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <i className="ti ti-chef-hat" style={{ fontSize: 13, color: 'var(--orange)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gdy nie masz ochoty — zrób sam
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{alt.name}</div>
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>{alt.tip}</p>
          </div>
        )}

        <button className="orange-btn" onClick={onClose}>Zamknij</button>
      </div>
    </>
  );
}
