import { IonApp, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

function App() {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>pacjentwybiera</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h1 className="text-xl font-semibold">Frontend gotowy</h1>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

export default App;
