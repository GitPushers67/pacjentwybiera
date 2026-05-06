import type { Meal, PlanDay, Allergen } from './types';

export const meals: Meal[] = [
  {
    id: 'breakfast',
    icon: '🥣',
    title: 'Śniadanie',
    time: 'ok. 8:00',
    timeHour: 8,
    options: [
      {
        name: 'Kleik ryżowy z bananem',
        emoji: '🍌',
        why: 'Bezpieczny przy nudnościach — kleik ryżowy zapiera, banan dostarcza potasu i łagodzi mdłości.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }, { t: '18g białka', c: 'b' }],
        kcal: 280, protein: 18, carbs: 52, fat: 3,
        isRec: true, score: 9,
        scoreReason: 'Predykcja na piątek 8 maja (dzień 5. cyklu): nudności słabną, ale żołądek pozostaje wrażliwy. Kleik BRAT minimalizuje obciążenie — najwyższe dopasowanie do przewidywanego profilu.',
      },
      {
        name: 'Jajecznica na parze z tostami',
        emoji: '🥚',
        why: 'Jajka to najlepiej tolerowane białko przy chemioterapii. Mniej optymalne przy silnych nudnościach.',
        tags: [{ t: '16g białka', c: 'b' }, { t: 'delikatne', c: '' }],
        kcal: 310, protein: 16, carbs: 24, fat: 14,
        isRec: false, score: 5,
        scoreReason: 'Piątek — nawet przy słabnących nudnościach ciepłe białko jaja może nasilić dyskomfort poranny w 5. dniu cyklu. Lepsze po godzinie 10:00.',
      },
    ],
  },
  {
    id: 'lunch2',
    icon: '🍎',
    title: 'II Śniadanie',
    time: 'ok. 10:30',
    timeHour: 10,
    options: [
      {
        name: 'Jogurt naturalny z musem jabłkowym',
        emoji: '🍶',
        why: 'Probiotyki wspierają jelita, pektyny z jabłka łagodzą wrażliwość żołądka. Chłodna konsystencja zmniejsza nudności.',
        tags: [{ t: 'probiotyk', c: 'g' }, { t: 'chłodne', c: 'g' }, { t: '14g białka', c: 'b' }],
        kcal: 180, protein: 14, carbs: 28, fat: 4,
        isRec: true, score: 8,
        scoreReason: 'Predykcja na piątek: flora jelitowa osłabiona po 4. dniu cyklu — probiotyki kluczowe. Chłodna konsystencja bezpieczna przy prognozowanej wrażliwości żołądka.',
      },
      {
        name: 'Kefir z musli i siemieniem lnianym',
        emoji: '🥛',
        why: 'Siemię lniane wspiera motorykę jelit — idealne przy zaparciach. Nie zalecane przy nudnościach.',
        tags: [{ t: 'błonnik', c: 'a' }, { t: '12g białka', c: 'b' }],
        kcal: 220, protein: 12, carbs: 35, fat: 7,
        isRec: false, score: 4,
        scoreReason: 'Piątek — model przewiduje wrażliwość żołądkową. Błonnik z musli zwiększa ryzyko dyskomfortu w 5. dniu cyklu.',
      },
    ],
  },
  {
    id: 'dinner',
    icon: '🍽️',
    title: 'Obiad',
    time: 'ok. 13:00',
    timeHour: 13,
    options: [
      {
        name: 'Indyk gotowany z ryżem białym',
        emoji: '🍗',
        why: 'Chude mięso z wody — najlepiej tolerowane źródło białka przy chemioterapii. Biały ryż stabilizuje żołądek.',
        tags: [{ t: 'wysokobiałkowe', c: 'g' }, { t: 'lekkostrawne', c: 'g' }, { t: '26g białka', c: 'b' }],
        kcal: 320, protein: 26, carbs: 40, fat: 5,
        isRec: true, score: 9,
        scoreReason: 'Predykcja na piątek: apetyt powracający po południu — to optymalne okno białkowe. Model szacuje tolerancję mięsa gotowanego na 91% przy tym profilu cyklu.',
      },
      {
        name: 'Zupa szpinakowa z lanym ciastem',
        emoji: '🥬',
        why: 'Szpinak bogaty w żelazo, gotowana bez smażenia. Ciepła temperatura może nasilić nudności.',
        tags: [{ t: 'lekkostrawne', c: 'g' }, { t: '14g białka', c: 'b' }],
        kcal: 240, protein: 14, carbs: 22, fat: 8,
        isRec: false, score: 5,
        scoreReason: 'Piątek — model przewiduje utrzymanie metalicznego posmaku w 5. dniu. Smak szpinaku nasila ten efekt u 68% pacjentów w tej fazie.',
      },
    ],
  },
  {
    id: 'snack',
    icon: '🍏',
    title: 'Podwieczorek',
    time: 'ok. 16:00',
    timeHour: 16,
    options: [
      {
        name: 'Pieczone jabłko z sucharami',
        emoji: '🍎',
        why: 'Pektyny jabłka łagodzą wrażliwość żołądka. Suchary ze skrobią stabilizują — element diety BRAT.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }],
        kcal: 160, protein: 4, carbs: 36, fat: 1,
        isRec: true, score: 8,
        scoreReason: 'Predykcja na piątek po południu: szczytowa wrażliwość żołądkowa ok. 15:00–17:00 w tym dniu cyklu. Pektyny jabłka i miękka tekstura — optymalne dopasowanie.',
      },
      {
        name: 'Twarożek z musem pomidorowym',
        emoji: '🧀',
        why: 'Twarożek to 20g białka na 100g — świetne uzupełnienie celu. Dobre gdy nudności osłabną.',
        tags: [{ t: 'wysokobiałkowe', c: 'b' }, { t: 'chłodne', c: '' }],
        kcal: 190, protein: 18, carbs: 12, fat: 6,
        isRec: false, score: 6,
        scoreReason: 'Piątek — kwasowość pomidora ryzykowna przy prognozowanej wrażliwości popołudniowej. Dobra opcja jeśli tolerancja będzie lepsza niż przewidywana.',
      },
    ],
  },
  {
    id: 'supper',
    icon: '🌙',
    title: 'Kolacja',
    time: 'ok. 19:00',
    timeHour: 19,
    options: [
      {
        name: 'Ryż z pieczonym jabłkiem',
        emoji: '🍚',
        why: 'Delikatna, jednolita konsystencja — idealna wieczorem przy wrażliwym żołądku.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }],
        kcal: 240, protein: 6, carbs: 50, fat: 2,
        isRec: true, score: 8,
        scoreReason: 'Predykcja na piątek wieczór: organizm po 5. dniu cyklu ma zmniejszoną tolerancję po 19:00. Lekka, jednolita konsystencja minimalizuje ryzyko nocnego dyskomfortu.',
      },
      {
        name: 'Tymbalik z kurczaka z sosem jogurtowym',
        emoji: '🐔',
        why: 'Gotowany kurczak z koperkiem — chude białko, naturalne przyprawy. Gdy nudności osłabną.',
        tags: [{ t: 'wysokobiałkowe', c: 'b' }, { t: 'delikatne', c: '' }],
        kcal: 290, protein: 22, carbs: 14, fat: 9,
        isRec: false, score: 6,
        scoreReason: 'Piątek wieczór — dobra opcja jeśli tolerancja będzie wyższa niż model przewiduje. Białko kurczaka uzupełni dzienny cel, ale ryzyko wyższe niż opcja rekomendowana.',
      },
    ],
  },
];

export const planDays: Record<string, PlanDay> = {
  mon: {
    label: 'Posiłki na poniedziałek',
    sub: 'Dzień 1. cyklu — dzień po wlewie',
    meals: [
      { emoji: '🍌', type: 'Śniadanie', name: 'Kleik ryżowy z bananem', kcal: 280, badge: 'zjedzone', bc: 'g' },
      { emoji: '🍶', type: 'II Śniadanie', name: 'Jogurt z musem jabłkowym', kcal: 180, badge: 'zjedzone', bc: 'g' },
      { emoji: '🥣', type: 'Obiad', name: 'Krupnik ryżowy', kcal: 220, badge: 'częściowo', bc: 'o' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko', kcal: 120, badge: 'zjedzone', bc: 'g' },
      { emoji: '🍚', type: 'Kolacja', name: 'Ryż z jabłkiem', kcal: 240, badge: 'zjedzone', bc: 'g' },
    ],
  },
  tue: {
    label: 'Posiłki na wtorek',
    sub: 'Dzień 2. cyklu',
    meals: [
      { emoji: '🥣', type: 'Śniadanie', name: 'Owsianka z bananem', kcal: 320, badge: 'zjedzone', bc: 'g' },
      { emoji: '🥛', type: 'II Śniadanie', name: 'Kefir z musli', kcal: 220, badge: 'nie zjedzone', bc: 'o' },
      { emoji: '🍲', type: 'Obiad', name: 'Krem z dyni', kcal: 280, badge: 'zjedzone', bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko', kcal: 160, badge: 'zjedzone', bc: 'g' },
      { emoji: '🥑', type: 'Kolacja', name: 'Toast z awokado', kcal: 310, badge: 'częściowo', bc: 'o' },
    ],
  },
  wed: {
    label: 'Posiłki na środę',
    sub: 'Dzień 3. cyklu chemioterapii',
    meals: [
      { emoji: '🥣', type: 'Śniadanie', name: 'Owsianka z bananem', kcal: 320, badge: 'wybrane', bc: 'g' },
      { emoji: '🍶', type: 'II Śniadanie', name: 'Jogurt z musem jabłkowym', kcal: 180, badge: 'wybrane', bc: 'g' },
      { emoji: '🍲', type: 'Obiad', name: 'Krem z dyni', kcal: 280, badge: 'wybrane', bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko', kcal: 160, badge: 'wybrane', bc: 'g' },
      { emoji: '🥑', type: 'Kolacja', name: 'Toast z awokado', kcal: 310, badge: 'wybrane', bc: 'g' },
    ],
  },
  thu: {
    label: 'Posiłki na czwartek',
    sub: 'Dzień wlewu — dieta okołowlewowa',
    meals: [
      { emoji: '🍌', type: 'Śniadanie', name: 'Kleik ryżowy z bananem', kcal: 280, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍶', type: 'II Śniadanie', name: 'Jogurt naturalny', kcal: 140, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍗', type: 'Obiad', name: 'Indyk z ryżem', kcal: 320, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Mus jabłkowy', kcal: 100, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍚', type: 'Kolacja', name: 'Ryż z jabłkiem', kcal: 240, badge: 'rekomendowane', bc: 'g' },
    ],
  },
  fri: {
    label: 'Posiłki na piątek',
    sub: 'W trakcie wyboru — zamówienie do 20:00',
    meals: [
      { emoji: '🍌', type: 'Śniadanie', name: 'Kleik ryżowy z bananem', kcal: 280, badge: 'wybrane', bc: 'g' },
      { emoji: '🍶', type: 'II Śniadanie', name: 'Jogurt z musem jabłkowym', kcal: 180, badge: 'wybrane', bc: 'g' },
      { emoji: '?', type: 'Obiad', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'p' },
      { emoji: '?', type: 'Podwieczorek', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'p' },
      { emoji: '?', type: 'Kolacja', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'p' },
    ],
  },
  sat: {
    label: 'Posiłki na sobotę',
    sub: 'Zamówienie jeszcze niedostępne',
    meals: [
      { emoji: '—', type: 'Śniadanie', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
      { emoji: '—', type: 'Obiad', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
      { emoji: '—', type: 'Kolacja', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
    ],
  },
  sun: {
    label: 'Posiłki na niedzielę',
    sub: 'Zamówienie jeszcze niedostępne',
    meals: [
      { emoji: '—', type: 'Śniadanie', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
      { emoji: '—', type: 'Obiad', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
      { emoji: '—', type: 'Kolacja', name: 'Dostępne wkrótce', kcal: 0, badge: 'wkrótce', bc: 'p' },
    ],
  },
};

export const symptomTips: Record<string, string> = {
  nausea: 'Nudności — wywietrz pomieszczenie przed posiłkiem. Sięgnij po schłodzone musy.',
  taste: 'Zmiana smaku — doprawiaj cytryną lub octem balsamicznym.',
  diarrhea: 'Biegunka — dieta BRAT: kleik ryżowy, banan, pieczone jabłko, tost.',
  mouth: 'Ból jamy ustnej — produkty chłodne i miękkie. Unikaj imbiru i cynamonu.',
  const: 'Zaparcia — kefir, jogurt, owsianka. Minimum 2,5 l płynów.',
  fatigue: 'Zmęczenie — jedz regularnie co 2–3h, nie pomijaj posiłków.',
  appetite: 'Brak apetytu — małe porcje, bogato odżywcze. Koktajle białkowe.',
  dryness: 'Suchość w ustach — pij małymi łykami często. Ssij kostki lodu.',
  metal: 'Metaliczny posmak — używaj plastikowych sztućców, jedz schłodzone dania.',
};

export const allergensList: Allergen[] = [
  { key: 'gluten', label: 'Gluten', icon: 'ti-wheat' },
  { key: 'dairy', label: 'Nabiał', icon: 'ti-droplet' },
  { key: 'eggs', label: 'Jaja', icon: 'ti-egg' },
  { key: 'nuts', label: 'Orzechy', icon: 'ti-nut' },
  { key: 'fish', label: 'Ryby', icon: 'ti-fish' },
  { key: 'shellfish', label: 'Skorupiaki', icon: 'ti-ripple' },
  { key: 'soy', label: 'Soja', icon: 'ti-plant' },
  { key: 'celery', label: 'Seler', icon: 'ti-leaf' },
  { key: 'mustard', label: 'Musztarda', icon: 'ti-bottle' },
  { key: 'sesame', label: 'Sezam', icon: 'ti-circle-dot' },
  { key: 'citrus', label: 'Cytrusy', icon: 'ti-lemon' },
  { key: 'grapefruit', label: 'Grejpfrut', icon: 'ti-forbid' },
];

export function getDailyTargets(weightKg: number) {
  return {
    kcal: Math.round(weightKg * 27.5),
    protein: Math.round(weightKg * 1.4),
    carbs: 220,
    fat: 60,
  };
}

export const DAILY_TARGETS = getDailyTargets(65);
