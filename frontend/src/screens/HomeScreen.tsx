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
import { getToday, formatDateForAPI, addDays } from "../utils";
import { fetchMenuForDateCached } from "../api";
import logo from "../assets/logo.png";
import TopbarDate from "../components/TopbarDate";
import { ensureDayMeals, getMealLogs, updateMealStatus } from "../services/mealLogs";

interface Props {
  navigate: (s: Screen) => void;
  symptoms: string[];
  setSymptoms: (s: string[]) => void;
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
  const [mealLogIds, setMealLogIds] = useState<Record<string, string>>({});

  const today = useMemo(() => getToday(), []);

  useEffect(() => {
    const dateStr = formatDateForAPI(today);

    fetchMenuForDateCached(dateStr).then(async (fetchedMeals) => {
      const mealsForMapping = fetchedMeals ?? fallbackMeals;
      if (fetchedMeals) setApiMeals(fetchedMeals);

      const logs = fetchedMeals
        ? await ensureDayMeals(dateStr, fetchedMeals)
        : await getMealLogs(dateStr);

      const idMap: Record<string, string> = {};
      const states: Record<string, MealCardState> = {};
      for (const log of logs) {
        const meal = mealsForMapping.find((m) => m.title === log.meal_slot);
        if (meal) {
          idMap[meal.id] = log.id;
          states[meal.id] = {
            status: log.status,
            partialPct: log.partial_pct ?? 50,
            showPlate: false,
          };
        }
      }
      setMealLogIds(idMap);
      setMealStates(states);

      // prefetch + pre-populate DB dla pojutrza w tle
      const dayAfterTomorrow = formatDateForAPI(addDays(today, 2));
      fetchMenuForDateCached(dayAfterTomorrow).then((futureMeals) => {
        if (futureMeals) ensureDayMeals(dayAfterTomorrow, futureMeals);
      });
    });
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
    const partialPct = status === "eaten" ? 100 : (mealStates[mealId]?.partialPct ?? 50);

    setMealStates((prev) => ({
      ...prev,
      [mealId]: { ...prev[mealId], status, showPlate: false, partialPct },
    }));
    setEatenMap((prev) => ({ ...prev, [mealId]: status === "eaten" ? "full" : "none" }));

    const logId = mealLogIds[mealId];
    if (logId) {
      updateMealStatus(logId, status, status === "partial" ? partialPct : undefined);
    }
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
        <TopbarDate navigate={navigate} />
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
