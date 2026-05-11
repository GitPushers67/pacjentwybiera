import { useState } from 'react';
import type { Screen } from '../types';

interface Props {
  navigate: (s: Screen) => void;
  mealName?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  ingredients?: string;
}

type EatenStatus = 'full' | 'partial' | 'none' | null;

export default function WasteAnalysisScreen({
  navigate,
  mealName = 'Posiłek',
  calories = 300,
  protein = 15,
  fat = 10,
  carbs = 40,
  ingredients = 'test ingredient',
}: Props) {
  const [eatenStatus, setEatenStatus] = useState<EatenStatus>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEatenChoice = (status: EatenStatus) => {
    setEatenStatus(status);
    setSelectedFile(null);
    setError(null);

    if (status === 'full') {
      console.log('✓ Zjedzone w całości:', mealName);
      navigate('home');
    } else if (status === 'none') {
      console.log('✗ Niezjedzone:', mealName);
      // Możliwe: zapisz 0% w bazie
      navigate('home');
    }
    // Jeśli 'partial' - czekamy na upload zdjęcia
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Tylko pliki obrazów (JPG, PNG)');
        return;
      }
      setSelectedFile(file);
      setError(null);
      console.log('📸 Wybrany plik:', file.name);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Nie wybrałeś zdjęcia');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('dish_name', mealName);
      formData.append('calories_kcal', String(calories));
      formData.append('protein_grams', String(protein));
      formData.append('fat_grams', String(fat));
      formData.append('carbs_grams', String(carbs));
      formData.append('weight_grams', '300');
      formData.append('ingredients', ingredients);

      console.log('🚀 Wysyłam do backendu:', {
        dish_name: mealName,
        calories_kcal: calories,
        protein_grams: protein,
        fat_grams: fat,
        carbs_grams: carbs,
        file: selectedFile.name,
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
      console.log('📊 Analiza:', {
        waste_percentage: data.analysis?.waste_percentage,
        missing_nutrients: data.analysis?.missing_nutrients,
        recommendation: data.recommendation,
      });

      // TODO: Wyświetl wynik na ekranie
      alert(`✓ Analiza: ${data.summary}\n\n${JSON.stringify(data.analysis, null, 2)}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('❌ Błąd podczas analizy:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        {/* Bez wyboru - pokazuj pytanie */}
        {eatenStatus === null && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--olight)',
                border: '2px solid var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <i className="ti ti-utensils" style={{ fontSize: 32, color: 'var(--orange)' }} />
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Jak było z posiłkiem?
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 24 }}>
              {mealName} • {calories} kcal • {protein}g białka
            </p>

            <div style={{ width: '100%', display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button className="orange-btn" onClick={() => handleEatenChoice('full')}>
                ✓ Zjedzone w całości
              </button>
              <button
                className="orange-btn"
                style={{ background: 'var(--amber)', color: 'var(--text)' }}
                onClick={() => handleEatenChoice('partial')}
              >
                ⚠ Częściowo zjedzone
              </button>
              <button
                className="orange-btn"
                style={{ background: 'var(--text2)', color: 'white' }}
                onClick={() => handleEatenChoice('none')}
              >
                ✗ Niezjedzone
              </button>
            </div>
          </>
        )}

        {/* Jeśli częściowo zjedzone - pokazuj upload */}
        {eatenStatus === 'partial' && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--alight)',
                border: '2px solid var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <i className="ti ti-camera" style={{ fontSize: 32, color: 'var(--amber)' }} />
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Przesłij zdjęcie talerza
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 24 }}>
              Zrób zdjęcie tego, co zostało. System przeanalizuje resztki.
            </p>

            {/* File input */}
            <label
              style={{
                width: '100%',
                padding: '24px',
                border: `2px dashed var(--amber)`,
                borderRadius: 13,
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--alight)',
                marginBottom: 16,
                transition: 'all 0.2s',
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={loading}
              />
              {selectedFile ? (
                <>
                  <i className="ti ti-check" style={{ fontSize: 32, color: 'var(--amber)', display: 'block', marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text2)' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <i className="ti ti-upload" style={{ fontSize: 32, color: 'var(--amber)', display: 'block', marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                    Kliknij by wybrać zdjęcie
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text2)' }}>
                    JPG lub PNG
                  </p>
                </>
              )}
            </label>

            {error && (
              <div
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--rlight)',
                  color: 'var(--red)',
                  borderRadius: 8,
                  fontSize: 12,
                  marginBottom: 16,
                  border: '1px solid var(--red)',
                }}
              >
                ⚠ {error}
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button
                className="orange-btn"
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                style={{ opacity: selectedFile && !loading ? 1 : 0.5, cursor: selectedFile && !loading ? 'pointer' : 'not-allowed' }}
              >
                {loading ? '⟳ Analizowanie...' : '📸 Przesyłam do analizy'}
              </button>
              <button
                className="orange-btn"
                style={{ background: 'var(--text2)', color: 'white' }}
                onClick={() => {
                  setEatenStatus(null);
                  setSelectedFile(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Cofnij
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

