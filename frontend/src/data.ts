import type { Meal, PlanDay } from './types';

export const meals: Meal[] = [
  {
    id: 'breakfast',
    icon: '🥣',
    title: 'Śniadanie',
    time: 'ok. 8:00',
    options: [
      {
        name: 'Kleik ryżowy z bananem',
        emoji: '🍌',
        why: 'Bezpieczny przy nudnościach — kleik ryżowy zapiera, banan dostarcza potasu i łagodzi mdłości.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }, { t: '18g białka', c: 'b' }],
        kcal: 280,
        protein: 18,
        isRec: true,
      },
      {
        name: 'Jajecznica na parze z tostami',
        emoji: '🥚',
        why: 'Jajka to najlepiej tolerowane białko przy chemioterapii. Mniej optymalne przy silnych nudnościach.',
        tags: [{ t: '16g białka', c: 'b' }, { t: 'delikatne', c: '' }],
        kcal: 310,
        protein: 16,
        isRec: false,
      },
    ],
  },
  {
    id: 'lunch2',
    icon: '🍎',
    title: 'II Śniadanie',
    time: 'ok. 10:30',
    options: [
      {
        name: 'Jogurt naturalny z musem jabłkowym',
        emoji: '🍶',
        why: 'Probiotyki wspierają jelita, pektyny z jabłka łagodzą wrażliwość żołądka. Chłodna konsystencja zmniejsza nudności.',
        tags: [{ t: 'probiotyk', c: 'g' }, { t: 'chłodne', c: 'g' }, { t: '14g białka', c: 'b' }],
        kcal: 180,
        protein: 14,
        isRec: true,
      },
      {
        name: 'Kefir z musli i siemieniem lnianym',
        emoji: '🥛',
        why: 'Siemię lniane wspiera motorykę jelit — idealne przy zaparciach. Nie zalecane przy nudnościach.',
        tags: [{ t: 'błonnik', c: 'a' }, { t: '12g białka', c: 'b' }],
        kcal: 220,
        protein: 12,
        isRec: false,
      },
    ],
  },
  {
    id: 'dinner',
    icon: '🍽️',
    title: 'Obiad',
    time: 'ok. 13:00',
    options: [
      {
        name: 'Indyk gotowany z ryżem białym',
        emoji: '🍗',
        why: 'Chude mięso z wody — najlepiej tolerowane źródło białka przy chemioterapii. Biały ryż stabilizuje żołądek.',
        tags: [{ t: 'wysokobiałkowe', c: 'g' }, { t: 'lekkostrawne', c: 'g' }, { t: '26g białka', c: 'b' }],
        kcal: 320,
        protein: 26,
        isRec: true,
      },
      {
        name: 'Zupa szpinakowa z lanym ciastem',
        emoji: '🥬',
        why: 'Szpinak bogaty w żelazo, gotowana bez smażenia. Ciepła temperatura może nasilić nudności.',
        tags: [{ t: 'lekkostrawne', c: 'g' }, { t: '14g białka', c: 'b' }],
        kcal: 240,
        protein: 14,
        isRec: false,
      },
    ],
  },
  {
    id: 'snack',
    icon: '🍏',
    title: 'Podwieczorek',
    time: 'ok. 16:00',
    options: [
      {
        name: 'Pieczone jabłko z sucharami',
        emoji: '🍎',
        why: 'Pektyny jabłka łagodzą wrażliwość żołądka. Suchary ze skrobią stabilizują — element diety BRAT.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }],
        kcal: 160,
        protein: 4,
        isRec: true,
      },
      {
        name: 'Twarożek z musem pomidorowym',
        emoji: '🧀',
        why: 'Twarożek to 20g białka na 100g — świetne uzupełnienie celu. Dobre gdy nudności osłabną.',
        tags: [{ t: 'wysokobiałkowe', c: 'b' }, { t: 'chłodne', c: '' }],
        kcal: 190,
        protein: 18,
        isRec: false,
      },
    ],
  },
  {
    id: 'supper',
    icon: '🌙',
    title: 'Kolacja',
    time: 'ok. 19:00',
    options: [
      {
        name: 'Ryż z pieczonym jabłkiem',
        emoji: '🍚',
        why: 'Delikatna, jednolita konsystencja — idealna wieczorem przy wrażliwym żołądku.',
        tags: [{ t: 'dieta BRAT', c: 'g' }, { t: 'lekkostrawne', c: 'g' }],
        kcal: 240,
        protein: 6,
        isRec: true,
      },
      {
        name: 'Tymbalik z kurczaka z sosem jogurtowym',
        emoji: '🐔',
        why: 'Gotowany kurczak z koperkiem — chude białko, naturalne przyprawy. Gdy nudności osłabną.',
        tags: [{ t: 'wysokobiałkowe', c: 'b' }, { t: 'delikatne', c: '' }],
        kcal: 290,
        protein: 22,
        isRec: false,
      },
    ],
  },
];

export const planDays: Record<string, PlanDay> = {
  mon: {
    label: 'Posiłki na poniedziałek',
    sub: 'Dzień 1. cyklu — dzień po wlewie',
    meals: [
      { emoji: '🍌', type: 'Śniadanie', name: 'Kleik ryżowy z bananem', kcal: 280, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍶', type: 'II Śniadanie', name: 'Jogurt z musem jabłkowym', kcal: 180, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🥣', type: 'Obiad', name: 'Krupnik ryżowy', kcal: 220, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko', kcal: 120, badge: 'rekomendowane', bc: 'g' },
      { emoji: '🍚', type: 'Kolacja', name: 'Ryż z jabłkiem', kcal: 240, badge: 'rekomendowane', bc: 'g' },
    ],
  },
  tue: {
    label: 'Posiłki na wtorek',
    sub: 'Dzień 2. cyklu',
    meals: [
      { emoji: '🥣', type: 'Śniadanie', name: 'Owsianka z bananem', kcal: 320, badge: 'wybrane', bc: 'g' },
      { emoji: '🥛', type: 'II Śniadanie', name: 'Kefir z musli', kcal: 220, badge: 'alternatywa', bc: 'o' },
      { emoji: '🍲', type: 'Obiad', name: 'Krem z dyni', kcal: 280, badge: 'wybrane', bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko', kcal: 160, badge: 'wybrane', bc: 'g' },
      { emoji: '🥑', type: 'Kolacja', name: 'Toast z awokado', kcal: 310, badge: 'wybrane', bc: 'g' },
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
