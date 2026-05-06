# PacjentWybiera — CLAUDE.md

Aplikacja mobilna dla onkologicznych pacjentów szpitala do wybierania posiłków zgodnych z ich etapem leczenia i aktualnymi objawami. AI predykuje samopoczucie i rekomenduje dietę.

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | React 19 + TypeScript + Vite |
| UI framework | Ionic React (`@ionic/react`) |
| Styling | Tailwind CSS + custom CSS variables |
| Ikony | Tabler Icons (webfont z CDN) |
| Routing | React state (prosty screen switcher) |
| Backend | Python (FastAPI / main.py) |
| Konteneryzacja | Docker + docker-compose |

## Struktura projektu

```
pacjentwybiera/
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # root — stan nawigacji + globalny stan
│   │   ├── main.tsx            # entry point, setupIonicReact
│   │   ├── index.css           # cały design system (CSS variables + klasy)
│   │   ├── types.ts            # interfejsy TypeScript
│   │   ├── data.ts             # mockowane dane: posiłki, plan tygodnia, tipy
│   │   ├── components/
│   │   │   └── Navbar.tsx      # dolna nawigacja (4 zakładki)
│   │   └── screens/
│   │       ├── HomeScreen.tsx      # strona główna: objawy + dzisiejsze menu
│   │       ├── PlanScreen.tsx      # plan tygodnia z wyborem dnia
│   │       ├── OrderScreen.tsx     # zamówienie ze swipe kartami posiłków
│   │       ├── AddSymScreen.tsx    # rozszerzony wybór objawów
│   │       ├── ProfileScreen.tsx   # profil pacjenta + seria raportowania
│   │       └── ConfirmScreen.tsx   # potwierdzenie zamówienia
│   ├── index.html              # ładuje Tabler Icons CDN
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── main.py                 # Python backend
│   ├── api.md                  # dokumentacja API
│   └── docker-compose.yml
└── onkomenu_infinite_swipe.html  # oryginalny prototyp HTML (źródło prawdy dla UI)
```

## Design system

Wszystkie kolory i tokeny definiuje `:root` w `src/index.css`:

```
--bg, --card, --border          # tła i obramowania
--orange, --olight, --omid      # kolor akcentu (główny)
--green, --glight, --gmid       # sukces / rekomendowane
--red, --rlight                 # odrzucone
--amber, --alight               # ostrzeżenia
--text, --text2, --text3        # hierarchia tekstu
```

Klasy CSS (nie Tailwind) odwzorowują prototyp 1:1. Tailwind jest dostępny ale używany minimalnie.

## Nawigacja

`App.tsx` zarządza aktywnym ekranem przez `useState<Screen>`. Nie ma React Routera — `navigate(screen)` podmienia komponent:

```ts
type Screen = 'home' | 'plan' | 'order' | 'add-sym' | 'profile' | 'confirm'
```

## Stan aplikacji (mockowany)

W `App.tsx`:
- `symptoms: string[]` — aktywne objawy pacjenta (wpływają na tip)
- `choices: Record<string, number>` — indeks wybranej opcji dla każdego slotu posiłku

## Swipe kart (OrderScreen)

`MealSlot` w `OrderScreen.tsx` obsługuje gest przeciągania przez `onPointerDown/Move/Up`. Próg wyzwolenia: ±45px. Animacja wyjścia 220ms → aktualizacja stanu → animacja wejścia.

## Uruchomienie

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # produkcja
```

## Dane mockowane

Wszystko w `src/data.ts`:
- `meals[]` — 5 slotów posiłków, każdy z 2 opcjami (rekomendowana + alternatywa)
- `planDays{}` — plan 7 dni tygodnia
- `symptomTips{}` — porady dopasowane do objawu

## Dodawanie nowych ekranów

1. Dodaj wartość do `type Screen` w `src/types.ts`
2. Stwórz plik `src/screens/NazwaScreen.tsx` (props: `navigate`)
3. Dodaj `{screen === 'nazwa' && <NazwaScreen ... />}` w `App.tsx`
4. Jeśli ekran ma dolny navbar, wstaw `<Navbar active="..." navigate={navigate} />`
