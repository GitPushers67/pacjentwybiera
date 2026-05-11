import { useState } from "react";
import type { SymptomEntry } from "../types";

interface Props {
  mealName: string;
  onSave: (symptoms: SymptomEntry[]) => void;
  onSkip: () => void;
}

const SYMPTOM_LIST = [
  { key: "nausea", icon: "ti-mood-sick", label: "Nudności" },
  { key: "diarrhea", icon: "ti-ripple", label: "Biegunka" },
  { key: "const", icon: "ti-alert-circle", label: "Zaparcia" },
  { key: "mouth", icon: "ti-bandage", label: "Ból jamy ustnej" },
  { key: "taste", icon: "ti-eye-off", label: "Brak smaku" },
  { key: "metal", icon: "ti-thermometer", label: "Metal. posmak" },
  { key: "fatigue", icon: "ti-zzz", label: "Zmęczenie" },
  { key: "appetite", icon: "ti-bowl", label: "Brak apetytu" },
  { key: "dryness", icon: "ti-droplets", label: "Suchość" },
];

const SEV_OPTS: { value: 1 | 3 | 5; label: string; color: string }[] = [
  { value: 1, label: "Łagodne", color: "var(--green)" },
  { value: 3, label: "Umiarkowane", color: "var(--amber)" },
  { value: 5, label: "Silne", color: "var(--red)" },
];

export default function PostMealModal({ mealName, onSave, onSkip }: Props) {
  const [selected, setSelected] = useState<Record<string, 1 | 3 | 5>>({});

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key] !== undefined) {
        delete next[key];
      } else {
        next[key] = 1;
      }
      return next;
    });
  };

  const setSeverity = (key: string, sev: 1 | 3 | 5) => {
    setSelected((prev) => ({ ...prev, [key]: sev }));
  };

  const handleSave = () => {
    const symptoms: SymptomEntry[] = Object.entries(selected).map(
      ([key, severity]) => ({ key, severity }),
    );
    onSave(symptoms);
  };

  const selectedKeys = Object.keys(selected);

  return (
    <>
      <div className="modal-backdrop" onClick={onSkip} />
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <div>
            <div
              style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
            >
              Objawy po posiłku
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text2)",
                marginTop: 2,
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {mealName}
            </div>
          </div>
          <button className="modal-close" onClick={onSkip}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text2)", margin: "0 0 12px" }}>
          Zaznacz objawy, które pojawiły się lub nasiliły po tym posiłku.
        </p>

        <div className="sym-grid" style={{ marginBottom: 14 }}>
          {SYMPTOM_LIST.map((sym) => (
            <div
              key={sym.key}
              className={`sym-btn ${selected[sym.key] !== undefined ? "on" : ""}`}
              onClick={() => toggle(sym.key)}
            >
              <i className={`ti ${sym.icon}`} />
              <span>{sym.label}</span>
            </div>
          ))}
        </div>

        {selectedKeys.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 8,
              }}
            >
              Nasilenie:
            </div>
            {selectedKeys.map((key) => {
              const sym = SYMPTOM_LIST.find((s) => s.key === key);
              if (!sym) return null;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text)",
                      width: 88,
                      flexShrink: 0,
                    }}
                  >
                    {sym.label}
                  </span>
                  <div style={{ display: "flex", gap: 4, flex: 1 }}>
                    {SEV_OPTS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSeverity(key, opt.value)}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          borderRadius: 8,
                          border: `1px solid ${selected[key] === opt.value ? opt.color : "var(--border)"}`,
                          background:
                            selected[key] === opt.value
                              ? opt.color
                              : "var(--card)",
                          color:
                            selected[key] === opt.value
                              ? "#fff"
                              : "var(--text2)",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSkip}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 11,
              color: "var(--text2)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Pomiń
          </button>
          <button
            className="orange-btn"
            style={{ flex: 2, margin: 0 }}
            onClick={handleSave}
          >
            {selectedKeys.length > 0
              ? `Zapisz (${selectedKeys.length})`
              : "Brak objawów ✓"}
          </button>
        </div>
      </div>
    </>
  );
}
