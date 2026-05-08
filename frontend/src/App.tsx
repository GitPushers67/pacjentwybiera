import { useState } from 'react';
import { IonApp } from '@ionic/react';
import type { Screen, EatenStatus, PatientProfile, Meal } from './types';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import OrderScreen from './screens/OrderScreen';
import AddSymScreen from './screens/AddSymScreen';
import ProfileScreen from './screens/ProfileScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AllergensScreen from './screens/AllergensScreen';
import NutritionScreen from './screens/NutritionScreen';
import OnboardingScreen from './screens/OnboardingScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>(['nausea']);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [orderMeals, setOrderMeals] = useState<Meal[] | null>(null);
  const [wellbeing, setWellbeing] = useState(6);
  const [eatenMap, setEatenMap] = useState<Record<string, EatenStatus>>({
    breakfast: 'full',
  });

  const navigate = (s: Screen) => setScreen(s);

  const handleOnboardingComplete = (p: PatientProfile) => {
    setPatient(p);
  };

  const updateAllergens = (allergens: string[]) => {
    if (patient) setPatient({ ...patient, allergens });
  };

  return (
    <IonApp>
      <div className="app-wrap">
        <div className="phone">
          {screen === 'onboarding' && (
            <OnboardingScreen navigate={navigate} onComplete={handleOnboardingComplete} />
          )}
          {screen === 'welcome' && patient && (
            <WelcomeScreen
              navigate={navigate}
              wellbeing={wellbeing}
              setWellbeing={setWellbeing}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              patientName={patient.firstName}
            />
          )}
          {screen === 'home' && patient && (
            <HomeScreen
              navigate={navigate}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              wellbeing={wellbeing}
              choices={choices}
              eatenMap={eatenMap}
              setEatenMap={setEatenMap}
              patient={patient}
            />
          )}
          {screen === 'plan' && (
            <PlanScreen navigate={navigate} choices={choices} orderMeals={orderMeals} />
          )}
          {screen === 'order' && (
            <OrderScreen navigate={navigate} choices={choices} setChoices={setChoices} setOrderMeals={setOrderMeals} />
          )}
          {screen === 'add-sym' && (
            <AddSymScreen navigate={navigate} symptoms={symptoms} setSymptoms={setSymptoms} />
          )}
          {screen === 'profile' && patient && (
            <ProfileScreen navigate={navigate} patient={patient} />
          )}
          {screen === 'allergens' && patient && (
            <AllergensScreen
              navigate={navigate}
              allergens={patient.allergens}
              setAllergens={updateAllergens}
            />
          )}
          {screen === 'nutrition' && patient && (
            <NutritionScreen
              navigate={navigate}
              choices={choices}
              eatenMap={eatenMap}
              patient={patient}
            />
          )}
          {screen === 'confirm' && <ConfirmScreen navigate={navigate} />}
        </div>
      </div>
    </IonApp>
  );
}
