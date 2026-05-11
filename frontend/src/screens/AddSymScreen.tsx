import { useState, type Dispatch, type SetStateAction } from "react";
import SymptomModal from "../components/SymptomModal";
import Navbar from "../components/Navbar";
import type { Screen, SymptomHistoryEntry } from "../types";

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  symptomHistory: SymptomHistoryEntry[];
  setSymptomHistory: Dispatch<SetStateAction<SymptomHistoryEntry[]>>;
}

const ALL_SYMPTOMS = [
  { key: "nausea", icon: "ti-mood-sick", label: "Nudności" },
  { key: "diarrhea", icon: "ti-ripple", label: "Biegunka" },
  { key: "const", icon: "ti-alert-circle", label: "Zaparcia" },
  { key: "mouth", icon: "ti-bandage", label: "Ból jamy ustnej" },
  { key: "taste", icon: "ti-eye-off", label: "Brak smaku" },
  { key: "metal", icon: "ti-thermometer", label: "Metaliczny posmak" },
  { key: "fatigue", icon: "ti-zzz", label: "Zmęczenie" },
  { key: "appetite", icon: "ti-bowl", label: "Brak apetytu" },
  { key: "dryness", icon: "ti-droplets", label: "Suchość w ustach" },
];

export default function AddSymScreen({
  navigate,
  symptoms,
  setSymptoms,
  symptomHistory,
  setSymptomHistory,
}: Props) {
  const [modalSym, setModalSym] = useState<string | null>(null);
  const [symIntensity, setSymIntensity] = useState<Record<string, number>>({});
  const [symNotes, setSymNotes] = useState<Record<string, string>>({});

  const openSym = (key: string) => {
    if (symIntensity[key] === undefined) {
      setSymIntensity((prev) => ({ ...prev, [key]: 50 }));
    }
    setModalSym(key);
  };

  const saveModal = () => {
    if (!modalSym) return;
    setSymptomHistory((prev) => [
      {
        key: modalSym,
        addedAt: new Date().toISOString(),
        scale: symIntensity[modalSym] ?? 50,
        note: symNotes[modalSym]?.trim() || undefined,
      },
      ...prev,
    ]);
    if (!symptoms.includes(modalSym)) {
      setSymptoms([...symptoms, modalSym]);
    }
    setModalSym(null);
  };

  const removeFromHistory = (addedAt: string) => {
    const entry = symptomHistory.find((e) => e.addedAt === addedAt);
    const remaining = symptomHistory.filter((e) => e.addedAt !== addedAt);
    setSymptomHistory(remaining);
    if (entry && !remaining.some((e) => e.key === entry.key)) {
      setSymptoms(symptoms.filter((s) => s !== entry.key));
    }
  };

  const activeSym = ALL_SYMPTOMS.find((s) => s.key === modalSym);

  return (
    <div className="screen active">
      <div className="topbar">
        <div>
          <h1>Dodaj objaw</h1>
          <p>Kliknij objaw, aby zapisać do historii</p>
        </div>
        <button
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => navigate("home")}
        >
          <i
            className="ti ti-x"
            style={{ fontSize: 20, color: "var(--text2)" }}
          />
        </button>
      </div>

      <div className="scroll" style={{ paddingBottom: 92 }}>
        <div className="sym-grid">
          {ALL_SYMPTOMS.map((s) => (
            <div key={s.key} className="sym-btn" onClick={() => openSym(s.key)}>
              <i className={`ti ${s.icon}`} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Historia dnia
          </div>
          {symptomHistory.length === 0 ? (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 11,
                padding: "10px 12px",
                fontSize: 12,
                color: "var(--text2)",
              }}
            >
              Brak wpisów na dziś.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {symptomHistory.map((entry, idx) => {
                const symptom = ALL_SYMPTOMS.find((s) => s.key === entry.key);
                return (
                  <div
                    key={`${entry.key}-${entry.addedAt}-${idx}`}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 11,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <i
                      className={`ti ${symptom?.icon ?? "ti-activity"}`}
                      style={{
                        fontSize: 16,
                        color: "var(--text3)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {symptom?.label ?? entry.key}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color:
                              entry.scale >= 67
                                ? "var(--red)"
                                : entry.scale >= 34
                                  ? "var(--amber)"
                                  : "var(--green)",
                            background:
                              entry.scale >= 67
                                ? "var(--rlight)"
                                : entry.scale >= 34
                                  ? "var(--alight)"
                                  : "var(--glight)",
                            borderRadius: 5,
                            padding: "1px 5px",
                          }}
                        >
                          {entry.scale}%
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text3)" }}>
                          {new Date(entry.addedAt).toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {entry.note && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text2)",
                            marginTop: 3,
                            lineHeight: 1.4,
                          }}
                        >
                          {entry.note}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromHistory(entry.addedAt)}
                      style={{
                        background: "var(--rlight)",
                        border: "1px solid var(--red)",
                        borderRadius: 8,
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className="ti ti-trash"
                        style={{ fontSize: 13, color: "var(--red)" }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          className="orange-btn"
          style={{ marginTop: 16 }}
          onClick={() => navigate("home")}
        >
          Gotowe
        </button>
      </div>
      {modalSym && activeSym && (
        <SymptomModal
          symptom={activeSym}
          intensity={symIntensity[modalSym] ?? 50}
          onIntensityChange={(v) =>
            setSymIntensity({ ...symIntensity, [modalSym]: v })
          }
          note={symNotes[modalSym] ?? ""}
          onNoteChange={(v) => setSymNotes({ ...symNotes, [modalSym]: v })}
          onClose={() => setModalSym(null)}
          onDone={saveModal}
          onRemove={() => setModalSym(null)}
        />
      )}
      <Navbar active="add-sym" navigate={navigate} />
    </div>
  );
}
