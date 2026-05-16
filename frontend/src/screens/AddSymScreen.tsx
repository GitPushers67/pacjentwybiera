import { useState, type Dispatch, type SetStateAction } from "react";
import SymptomModal from "../components/SymptomModal";
import Navbar from "../components/Navbar";
import type { Screen, SymptomHistoryEntry } from "../types";
import TopbarDate from "../components/TopbarDate";
import { addSymptomEntry, deleteSymptomEntry } from "../services/symptoms";

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
  symptomHistory: SymptomHistoryEntry[];
  setSymptomHistory: Dispatch<SetStateAction<SymptomHistoryEntry[]>>;
  streak?: number;
}

function scaleLbl(v: number) {
  if (v >= 67) return 'Bardzo silny';
  if (v >= 34) return 'Silny';
  return 'Słaby';
}

const ALL_SYMPTOMS = [
  { key: "nausea",       icon: "ti-mood-sick",   label: "Nudności" },
  { key: "diarrhea",     icon: "ti-ripple",       label: "Biegunka" },
  { key: "const",        icon: "ti-alert-circle", label: "Zaparcia" },
  { key: "mouth",        icon: "ti-bandage",      label: "Pieczenie w jamie ustnej" },
  { key: "taste",        icon: "ti-eye-off",      label: "Brak smaku" },
  { key: "taste_change", icon: "ti-sparkles",    label: "Zmiana smaku" },
  { key: "metal",        icon: "ti-thermometer",  label: "Metaliczny posmak" },
  { key: "fatigue",      icon: "ti-zzz",          label: "Zmęczenie" },
  { key: "appetite",     icon: "ti-bowl",         label: "Brak apetytu" },
  { key: "dryness",      icon: "ti-droplets",     label: "Suchość w ustach" },
];

export default function AddSymScreen({
  navigate,
  symptoms,
  setSymptoms,
  symptomHistory,
  setSymptomHistory,
}: Props) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayHistory = symptomHistory.filter(e => new Date(e.addedAt) >= todayStart);

  const [modalSym, setModalSym] = useState<string | null>(null);
  const [symIntensity, setSymIntensity] = useState<Record<string, number>>({});
  const [symNotes, setSymNotes] = useState<Record<string, string>>({});

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIntensity, setCustomIntensity] = useState(50);
  const [customNote, setCustomNote] = useState("");

  const openSym = (key: string) => {
    if (symIntensity[key] === undefined) {
      setSymIntensity((prev) => ({ ...prev, [key]: 50 }));
    }
    setModalSym(key);
  };

  const saveModal = async () => {
    if (!modalSym) return;
    const now = new Date().toISOString();
    const optimistic: SymptomHistoryEntry = {
      key: modalSym,
      addedAt: now,
      scale: symIntensity[modalSym] ?? 50,
      note: symNotes[modalSym]?.trim() || undefined,
    };
    setSymptomHistory((prev) => [optimistic, ...prev]);
    if (!symptoms.includes(modalSym)) {
      setSymptoms([...symptoms, modalSym]);
    }
    setModalSym(null);

    const saved = await addSymptomEntry(optimistic);
    if (saved) {
      setSymptomHistory((prev) =>
        prev.map((e) => (e.addedAt === now && e.key === modalSym ? { ...e, id: saved.id } : e)),
      );
    }
  };

  const removeFromHistory = async (entry: SymptomHistoryEntry) => {
    const remaining = symptomHistory.filter((e) => e !== entry);
    setSymptomHistory(remaining);
    const todayRemaining = remaining.filter(e => new Date(e.addedAt) >= todayStart);
    if (!todayRemaining.some((e) => e.key === entry.key)) {
      setSymptoms(symptoms.filter((s) => s !== entry.key));
    }
    if (entry.id) {
      await deleteSymptomEntry(entry.id);
    }
  };

  const saveCustom = async () => {
    const name = customName.trim();
    if (!name) return;
    const key = `custom_${name}`;
    const now = new Date().toISOString();
    const optimistic: SymptomHistoryEntry = {
      key,
      addedAt: now,
      scale: customIntensity,
      note: customNote.trim() || undefined,
    };
    setSymptomHistory((prev) => [optimistic, ...prev]);
    if (!symptoms.includes(key)) setSymptoms([...symptoms, key]);
    setShowCustomModal(false);
    setCustomName("");
    setCustomIntensity(50);
    setCustomNote("");

    const saved = await addSymptomEntry(optimistic);
    if (saved) {
      setSymptomHistory((prev) =>
        prev.map((e) => (e.addedAt === now && e.key === key ? { ...e, id: saved.id } : e)),
      );
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TopbarDate navigate={navigate} />
          </div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => navigate("home")}
          >
            <i className="ti ti-x" style={{ fontSize: 20, color: "var(--text2)" }} />
          </button>
        </div>
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

        <button
          onClick={() => setShowCustomModal(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "11px 0",
            marginBottom: 12,
            background: "var(--card)",
            border: "1.5px dashed var(--border)",
            borderRadius: 13,
            cursor: "pointer",
          }}
        >
          <i
            className="ti ti-plus"
            style={{ fontSize: 15, color: "var(--text3)" }}
          />
          <span
            style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}
          >
            Inny objaw
          </span>
        </button>

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
          {todayHistory.length === 0 ? (
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
              {todayHistory.map((entry, idx) => {
                const symptom = ALL_SYMPTOMS.find((s) => s.key === entry.key);
                const displayLabel =
                  symptom?.label ??
                  (entry.key.startsWith("custom_")
                    ? entry.key.slice(7)
                    : entry.key);
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
                          {displayLabel}
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
                          {scaleLbl(entry.scale)}
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
                      onClick={() => removeFromHistory(entry)}
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
      {showCustomModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowCustomModal(false)}
          />
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-header">
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "var(--olight)",
                    border: "1px solid var(--omid)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="ti ti-pencil-plus"
                    style={{ fontSize: 18, color: "var(--orange)" }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  Inny objaw
                </span>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowCustomModal(false)}
              >
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                Nazwa objawu
              </div>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder=""
                autoFocus
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid var(--border)",
                  borderRadius: 11,
                  padding: "9px 10px",
                  fontSize: 13,
                  color: "var(--text)",
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Nasilenie objawu
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      customIntensity >= 67
                        ? "var(--red)"
                        : customIntensity >= 34
                          ? "var(--amber)"
                          : "var(--green)",
                  }}
                >
                  {scaleLbl(customIntensity)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={customIntensity}
                onChange={(e) => setCustomIntensity(Number(e.target.value))}
                className="wellbeing-range"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                }}
              >
                <span style={{ fontSize: 10, color: "var(--text3)" }}>0%</span>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>
                  100%
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                Notatka
              </div>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Opcjonalny opis objawu..."
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid var(--border)",
                  borderRadius: 11,
                  padding: "9px 10px",
                  fontSize: 12,
                  color: "var(--text)",
                  resize: "vertical",
                  background: "#fff",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowCustomModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 11,
                  color: "var(--text2)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Anuluj
              </button>
              <button
                className="orange-btn"
                style={{
                  flex: 2,
                  margin: 0,
                  opacity: customName.trim() ? 1 : 0.45,
                }}
                onClick={saveCustom}
              >
                Dodaj objaw
              </button>
            </div>
          </div>
        </>
      )}

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
