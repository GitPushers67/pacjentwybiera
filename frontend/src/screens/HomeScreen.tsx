import {
  useEffect,
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import Navbar from "../components/Navbar";
import { MealCard } from "../components/MealCard";
import type { EatenStatus, Meal, PatientProfile, Screen, MealCardState } from "../types";
import { meals as fallbackMeals } from "../data";
import { getToday, formatDateForAPI } from "../utils";
import { fetchMenuForDate } from "../api";
import logo from "../assets/logo.png";

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

function getCurrentMealId(): string {
  const h = new Date().getHours();
  if (h < 9) return "breakfast";
  if (h < 12) return "lunch2";
  if (h < 15) return "dinner";
  if (h < 18) return "snack";
  return "supper";
}

export default function HomeScreen({
  navigate,
  eatenMap,
  setEatenMap,
}: Props) {
  const [apiMeals, setApiMeals] = useState<Meal[] | null>(null);
  const [mealStates, setMealStates] = useState<Record<string, MealCardState>>({});

  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    fetchMenuForDate(formatDateForAPI(today)).then(setApiMeals);
  }, [today]);

  const meals = apiMeals ?? fallbackMeals;

  const currentMealId = getCurrentMealId();

  const getMealState = (
    mealId: string,
    stateMap: Record<string, MealCardState> = mealStates,
  ): MealCardState => {
    const localState = stateMap[mealId];
    if (localState) return localState;

    if (eatenMap[mealId] === "full") {
      return { status: "eaten", partialPct: 100, showPlate: false };
    }

    return { status: "pending", partialPct: 50, showPlate: false };
  };

  const handleSetMealStatus = (mealId: string, status: MealCardState["status"]) => {
    setMealStates((prev) => ({
      ...prev,
      [mealId]: {
        ...getMealState(mealId, prev),
        ...prev[mealId],
        status,
        showPlate: false,
        partialPct:
          status === "eaten"
            ? 100
            : (prev[mealId]?.partialPct ?? getMealState(mealId, prev).partialPct ?? 50),
      },
    }));
    setEatenMap((prev) => ({ ...prev, [mealId]: status === "eaten" ? "full" : "none" }));
  };

  const handleUpdatePartialPct = (mealId: string, pct: number) => {
    setMealStates((prev) => ({
      ...prev,
      [mealId]: {
        ...getMealState(mealId, prev),
        ...prev[mealId],
        partialPct: pct,
      },
    }));
  };

  const handleShowPlate = (mealId: string, show: boolean) => {
    setMealStates((prev) => ({
      ...prev,
      [mealId]: {
        ...getMealState(mealId, prev),
        ...prev[mealId],
        showPlate: show,
      },
    }));
  };

  const handleResetStatus = (mealId: string) => {
    setMealStates((prev) => ({
      ...prev,
      [mealId]: {
        status: 'pending',
        partialPct: 50,
        showPlate: false,
      },
    }));
    setEatenMap((prev) => ({ ...prev, [mealId]: "none" }));
  };

  return (
    <div className="screen active">
      <div className="topbar" style={{ alignItems: "center" }}>
        <img
          src={logo}
          alt="Pacjent Wybiera"
          style={{ height: 58, objectFit: "contain" }}
        />
        <div className="streak-pill">
          <i className="ti ti-flame" />
          <span>5</span>
          <small>dni</small>
        </div>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <button
          onClick={() => navigate("add-sym")}
          style={{
            width: "100%",
            border: "1px solid var(--border)",
            background: "#fff",
            borderRadius: 14,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            Jak się dziś czujesz?
          </div>
          <i
            className="ti ti-chevron-right"
            style={{ fontSize: 16, color: "var(--text2)" }}
          />
        </button>
      </div>

      <div className="scroll">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 9,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            Dzisiejsze menu
          </span>
          <a
            style={{ fontSize: 12, color: "var(--orange)", cursor: "pointer" }}
            onClick={() => navigate("plan")}
          >
            Plan →
          </a>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--orange)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <i className="ti ti-clock" style={{ fontSize: 12 }} />
          Aktualny posiłek
        </div>
        {meals
          .filter((m) => m.id === currentMealId)
          .map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isCurrent
              state={getMealState(meal.id)}
              onSetStatus={(status) => handleSetMealStatus(meal.id, status)}
              onUpdatePartialPct={(pct) => handleUpdatePartialPct(meal.id, pct)}
              onShowPlate={(show) => handleShowPlate(meal.id, show)}
              onReset={() => handleResetStatus(meal.id)}
            />
          ))}

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "14px 0 6px",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <i className="ti ti-list" style={{ fontSize: 12 }} />
          Pozostałe posiłki
        </div>
        {meals
          .filter((m) => m.id !== currentMealId)
          .map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isCurrent={false}
              state={getMealState(meal.id)}
              onSetStatus={(status) => handleSetMealStatus(meal.id, status)}
              onUpdatePartialPct={(pct) => handleUpdatePartialPct(meal.id, pct)}
              onShowPlate={(show) => handleShowPlate(meal.id, show)}
              onReset={() => handleResetStatus(meal.id)}
            />
          ))}

        <button
          className="orange-btn"
          style={{ marginTop: 4 }}
          onClick={() => navigate("order")}
        >
          Zamów posiłki na piątek, 8 maja →
        </button>
      </div>

      <Navbar active="home" navigate={navigate} />
    </div>
  );
}
