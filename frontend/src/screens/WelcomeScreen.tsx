import { useState } from "react";
import type { Screen } from "../types";
import logo from "../assets/logo.png";

interface Props {
  navigate: (s: Screen) => void;
  wellbeing: number;
  setWellbeing: (v: number) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  patientName: string;
}

const QUICK_SYMPTOMS = [
  { key: "nausea", icon: "ti-mood-sick", label: "Nudności" },
  { key: "fatigue", icon: "ti-zzz", label: "Zmęczenie" },
  { key: "appetite", icon: "ti-bowl", label: "Brak apetytu" },
  { key: "mouth", icon: "ti-bandage", label: "Ból jamy ustnej" },
  { key: "dryness", icon: "ti-droplets", label: "Suchość w ustach" },
  { key: "metal", icon: "ti-thermometer", label: "Metaliczny posmak" },
];

function getMascotMood(w: number): { emoji: string; msg: string } {
  if (w <= 2)
    return {
      emoji: "😰",
      msg: "Rozumiem, że dziś ciężko. Dobierzemy menu, które będzie łagodne dla żołądka.",
    };
  if (w <= 4)
    return {
      emoji: "😟",
      msg: "Kiepski dzień? Skupimy się na lekkostrawnych, chłodnych posiłkach.",
    };
  if (w <= 6)
    return {
      emoji: "😐",
      msg: "Trzymasz się! Dobrze dobrane posiłki pomogą utrzymać energię.",
    };
  if (w <= 8)
    return {
      emoji: "🙂",
      msg: "Nieźle! Przy lepszym samopoczuciu możemy zaproponować bogatsze opcje.",
    };
  return {
    emoji: "😊",
    msg: "Super dzień! Twój organizm jest gotowy na pełnowartościowe odżywienie.",
  };
}

export default function WelcomeScreen({
  navigate,
  wellbeing,
  setWellbeing,
  symptoms,
  setSymptoms,
  patientName,
}: Props) {
  const [localWellbeing, setLocalWellbeing] = useState(wellbeing);
  const mood = getMascotMood(localWellbeing);

  const toggle = (key: string) => {
    if (symptoms.includes(key)) {
      setSymptoms(symptoms.filter((s) => s !== key));
    } else {
      setSymptoms([...symptoms, key]);
    }
  };

  const handleStart = () => {
    setWellbeing(localWellbeing);
    navigate("home");
  };

  return (
    <div className="screen active" style={{ background: "var(--bg)" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "32px 20px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={logo}
            alt="Pacjent Wybiera"
            style={{ height: 44, objectFit: "contain" }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="mascot-bubble">
            <div className="mascot-avatar">{mood.emoji}</div>
            <div className="mascot-speech">{mood.msg}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 4,
            }}
          >
            Dzień dobry, {patientName}!
          </div>
          <div
            style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}
          >
            środa, 7 maja 2026 · Dzień 3. cyklu
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            Jak się dziś ogólnie czujesz?
          </div>

          <div className="wellbeing-slider-wrap">
            <div className="wellbeing-labels">
              <span>Źle</span>
              <span className="wb-value">{localWellbeing}/10</span>
              <span>Świetnie</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={localWellbeing}
              onChange={(e) => setLocalWellbeing(Number(e.target.value))}
              className="wellbeing-range"
            />
            <div className="wellbeing-ticks">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`wb-tick ${i + 1 <= localWellbeing ? "on" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            Aktywne objawy dziś
          </div>
          <div className="sym-grid">
            {QUICK_SYMPTOMS.map((s) => (
              <div
                key={s.key}
                className={`sym-btn ${symptoms.includes(s.key) ? "on" : ""}`}
                onClick={() => toggle(s.key)}
              >
                <i className={`ti ${s.icon}`} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto" }}>
          <button className="orange-btn" onClick={handleStart}>
            Rozpocznij dzień
          </button>
          <div className="rodo-note">
            <i className="ti ti-shield-lock" />
            <span>
              Twoje dane przetwarzane są lokalnie. Nie trafiają do chmury.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
