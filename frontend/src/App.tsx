import { useState, useEffect } from "react";
import { IonApp } from "@ionic/react";
import type {
  Screen,
  EatenStatus,
  PatientProfile,
  Meal,
  SymptomHistoryEntry,
  NotEatenReason,
} from "./types";
import { supabase } from "./lib/supabase";
import { getPatient } from "./services/patients";
import { getSymptomEntries } from "./services/symptoms";
import HomeScreen from "./screens/HomeScreen";
import PlanScreen from "./screens/PlanScreen";
import OrderScreen from "./screens/OrderScreen";
import AddSymScreen from "./screens/AddSymScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ConfirmScreen from "./screens/ConfirmScreen";
import AllergensScreen from "./screens/AllergensScreen";
import NutritionScreen from "./screens/NutritionScreen";
import ChatScreen from "./screens/ChatScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import LandingScreen from "./screens/LandingScreen";

// DEV_MODE = true  → pomija auth + onboarding, startuje na home z mock-pacjentem
// DEV_MODE = false → pełny flow: login → onboarding → welcome → home
const DEV_MODE = false;

const DEV_PATIENT: PatientProfile = {
  firstName: "Kacper",
  lastName: "Testowy",
  sex: "male",
  birthYear: 1980,
  weightKg: 72,
  heightCm: 178,
  cancerType: "Rak płuca",
  treatmentType: "chemo",
  allergens: [],
};

const GUEST_PATIENT: PatientProfile = {
  firstName: "Gość",
  lastName: "",
  sex: "male",
  birthYear: 1975,
  weightKg: 70,
  heightCm: 170,
  cancerType: "Rak płuca",
  treatmentType: "chemo",
  allergens: [],
};

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(
    DEV_MODE ? "home" : "landing",
  );
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(
    DEV_MODE ? DEV_PATIENT : null,
  );
  const [symptoms, setSymptoms] = useState<string[]>(DEV_MODE ? ["nausea"] : []);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [orderMeals, setOrderMeals] = useState<Meal[] | null>(null);
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistoryEntry[]>([]);
  const [eatenMap, setEatenMap] = useState<Record<string, EatenStatus>>({});
  const [editingOrder, setEditingOrder] = useState(false);
  const [authChecked, setAuthChecked] = useState(DEV_MODE);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [streak] = useState(7); // mock — w produkcji liczyć z bazy
  // Gdy pacjent wybierze "złe samopoczucie" → navigate do objawów → wróć z otwartym panelem alternatywy
  const [pendingAlternativeMealId, setPendingAlternativeMealId] = useState<string | null>(null);

  const handleToggleFavorite = (mealId: string) => {
    setFavorites((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId],
    );
  };

  const handleNotEatenReason = (_mealId: string, _reason: NotEatenReason) => {
    // Powód zapisany — alternatywa obsługiwana bezpośrednio w MealFeedbackModal
  };

  useEffect(() => {
    if (DEV_MODE) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData();
      } else {
        setScreen("landing");
        setAuthChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsGuest(false);
        setGuestId(null);
        setScreen("landing");
        setPatient(null);
        setSymptomHistory([]);
        setSymptoms([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isGuest || !guestId) return;
    localStorage.setItem(`guest_${guestId}_symptoms`, JSON.stringify(symptoms));
  }, [isGuest, guestId, symptoms]);

  useEffect(() => {
    if (!isGuest || !guestId) return;
    localStorage.setItem(`guest_${guestId}_choices`, JSON.stringify(choices));
  }, [isGuest, guestId, choices]);

  useEffect(() => {
    if (!isGuest || !guestId) return;
    localStorage.setItem(`guest_${guestId}_eatenMap`, JSON.stringify(eatenMap));
  }, [isGuest, guestId, eatenMap]);

  async function loadUserData() {
    const [profile, entries] = await Promise.all([
      getPatient(),
      getSymptomEntries(sevenDaysAgo(), new Date().toISOString()),
    ]);

    setAuthChecked(true);

    if (!profile) {
      setScreen("onboarding");
      return;
    }

    setPatient(profile);
    setSymptomHistory(entries);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEntries = entries.filter(e => new Date(e.addedAt) >= todayStart);
    setSymptoms([...new Set(todayEntries.map((e) => e.key))]);
    setScreen("home");
  }

  const navigate = (s: Screen) => {
    if (s !== 'order') setEditingOrder(false);
    // Gdy wracamy do home z add-sym i mamy pending alternative — zostaw stan
    // W innych przypadkach czyść
    if (s !== 'home') setPendingAlternativeMealId(null);
    setScreen(s);
  };

  const editOrder = () => {
    setEditingOrder(true);
    setScreen('order');
  };

  const handleOnboardingComplete = (p: PatientProfile) => {
    setPatient(p);
  };

  const handleGuest = () => {
    let id = localStorage.getItem('guest_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('guest_session_id', id);
    }

    const storedPatient = localStorage.getItem(`guest_${id}_patient`);
    const guestPatient: PatientProfile = storedPatient
      ? JSON.parse(storedPatient)
      : GUEST_PATIENT;
    if (!storedPatient) {
      localStorage.setItem(`guest_${id}_patient`, JSON.stringify(GUEST_PATIENT));
    }

    const storedSymptoms = localStorage.getItem(`guest_${id}_symptoms`);
    const guestSymptoms: string[] = storedSymptoms ? JSON.parse(storedSymptoms) : [];

    const storedChoices = localStorage.getItem(`guest_${id}_choices`);
    const guestChoices: Record<string, number> = storedChoices ? JSON.parse(storedChoices) : {};

    const storedEaten = localStorage.getItem(`guest_${id}_eatenMap`);
    const guestEaten: Record<string, EatenStatus> = storedEaten ? JSON.parse(storedEaten) : {};

    setIsGuest(true);
    setGuestId(id);
    setPatient(guestPatient);
    setSymptoms(guestSymptoms);
    setChoices(guestChoices);
    setEatenMap(guestEaten);
    setAuthChecked(true);
    setScreen('home');
  };

  const handleLogin = () => {
    loadUserData();
  };

  const updateAllergens = (allergens: string[]) => {
    if (patient) setPatient({ ...patient, allergens });
  };

  if (!authChecked) {
    return (
      <IonApp>
        <div className="app-wrap">
          <div className="phone" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-loader-2" style={{ fontSize: 32, color: 'var(--orange)', animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <div className="app-wrap">
        <div className="phone">
          {screen === "landing" && (
            <LandingScreen onGuest={handleGuest} onLogin={() => setScreen("login")} />
          )}
          {screen === "login" && (
            <LoginScreen onLogin={handleLogin} />
          )}
          {screen === "onboarding" && (
            <OnboardingScreen
              navigate={navigate}
              onComplete={handleOnboardingComplete}
            />
          )}
{screen === "home" && patient && (
            <HomeScreen
              navigate={navigate}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              choices={choices}
              eatenMap={eatenMap}
              setEatenMap={setEatenMap}
              patient={patient}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              streak={streak}
              onNotEatenReason={handleNotEatenReason}
              pendingAlternativeMealId={pendingAlternativeMealId}
              onAlternativeHandled={() => setPendingAlternativeMealId(null)}
            />
          )}
          {screen === "plan" && (
            <PlanScreen
              navigate={navigate}
              choices={choices}
              orderMeals={orderMeals}
              symptomHistory={symptomHistory}
              streak={streak}
            />
          )}
          {screen === "order" && patient && (
            <OrderScreen
              navigate={navigate}
              choices={choices}
              setChoices={setChoices}
              setOrderMeals={setOrderMeals}
              patient={patient}
              symptoms={symptoms}
              symptomHistory={symptomHistory}
              eatenMap={eatenMap}
              editMode={editingOrder}
              streak={streak}
            />
          )}
          {screen === "add-sym" && (
            <AddSymScreen
              navigate={navigate}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              symptomHistory={symptomHistory}
              setSymptomHistory={setSymptomHistory}
              streak={streak}
            />
          )}
          {screen === "profile" && patient && (
            <ProfileScreen navigate={navigate} patient={patient} streak={streak} />
          )}
          {screen === "allergens" && patient && (
            <AllergensScreen
              navigate={navigate}
              allergens={patient.allergens}
              setAllergens={updateAllergens}
            />
          )}
          {screen === "nutrition" && patient && (
            <NutritionScreen
              navigate={navigate}
              choices={choices}
              eatenMap={eatenMap}
              patient={patient}
            />
          )}
          {screen === "chat" && <ChatScreen navigate={navigate} />}
          {screen === "confirm" && <ConfirmScreen navigate={navigate} onEdit={editOrder} />}
        </div>
      </div>
    </IonApp>
  );
}
