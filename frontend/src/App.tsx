import { useState } from 'react';
import { IonApp } from '@ionic/react';
import type { Screen } from './types';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import OrderScreen from './screens/OrderScreen';
import AddSymScreen from './screens/AddSymScreen';
import ProfileScreen from './screens/ProfileScreen';
import ConfirmScreen from './screens/ConfirmScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [symptoms, setSymptoms] = useState<string[]>(['nausea']);
  const [choices, setChoices] = useState<Record<string, number>>({});

  const navigate = (s: Screen) => setScreen(s);

  return (
    <IonApp>
      <div className="app-wrap">
        <div className="phone">
          {screen === 'home' && (
            <HomeScreen navigate={navigate} symptoms={symptoms} setSymptoms={setSymptoms} />
          )}
          {screen === 'plan' && <PlanScreen navigate={navigate} />}
          {screen === 'order' && (
            <OrderScreen navigate={navigate} choices={choices} setChoices={setChoices} />
          )}
          {screen === 'add-sym' && (
            <AddSymScreen navigate={navigate} symptoms={symptoms} setSymptoms={setSymptoms} />
          )}
          {screen === 'profile' && <ProfileScreen navigate={navigate} />}
          {screen === 'confirm' && <ConfirmScreen navigate={navigate} />}
        </div>
      </div>
    </IonApp>
  );
}
