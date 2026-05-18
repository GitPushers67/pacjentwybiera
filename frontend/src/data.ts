import type { Meal, PlanDay, Allergen } from './types';

// Dane z API: https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules
// dietId=2388, dietVariantId=4881, dietVariantCaloriesId=18414, menuScheduleId=7392
// Data: 2026-05-18 (poniedziałek)
export const meals: Meal[] = [
  {
    id: 'shot',
    icon: '🌿',
    title: 'OnkoShot',
    time: 'rano na czczo',
    timeHour: 7,
    options: [
      {
        name: 'OnkoShot kurkuma-imbir',
        emoji: '🌿',
        why: 'Kurkuma i imbir działają przeciwzapalnie. Shot przyjmowany na czczo maksymalizuje wchłanianie kurkuminoidów.',
        tags: [{ t: '1g białka', c: 'b' }, { t: 'na zimno', c: 'g' }],
        kcal: 42, protein: 1, carbs: 10, fat: 0,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: '',
        weight: '110g',
      },
      {
        name: 'OnkoShot pieczona śliwka',
        emoji: '🌿',
        why: 'Śliwka dostarcza antyoksydantów i wspomaga perystaltykę jelit. Dobra alternatywa przy nietolerancji imbiru.',
        tags: [{ t: 'antyoksydanty', c: 'g' }, { t: 'na zimno', c: 'g' }],
        kcal: 66, protein: 0, carbs: 16, fat: 0,
        isRec: false, score: 6,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: '',
        weight: '100g',
      },
    ],
  },
  {
    id: 'breakfast',
    icon: '🥣',
    title: 'Śniadanie',
    time: 'ok. 8:00',
    timeHour: 8,
    options: [
      {
        name: 'Mini bajgiel z twarożkiem buraczkowym',
        emoji: '🥣',
        why: 'Buraki wspierają regenerację krwi, twaróg dostarcza wapnia. Podawane na zimno — bezpieczne przy nudnościach.',
        tags: [{ t: '19g białka', c: 'b' }, { t: 'na zimno', c: 'g' }, { t: 'wegetariańskie', c: 'g' }],
        kcal: 288, protein: 19, carbs: 41, fat: 7,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: 'Zboża z glutenem, Mleko',
        weight: '184g',
      },
      {
        name: 'Jaglanka borówkowa z chałwą',
        emoji: '🥣',
        why: 'Kasza jaglana jest lekkostrawna i alkaliczna. Borówki dostarczają antyoksydantów. Podawana ciepło.',
        tags: [{ t: '10g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 298, protein: 10, carbs: 50, fat: 7,
        isRec: false, score: 6,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Mleko, Jaja',
        weight: '220g',
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
        name: 'Mango sticky rice',
        emoji: '🍎',
        why: 'Ryż kleisty z mango dostarcza energii i jest łagodny dla żołądka. Mango łagodzi metaliczny posmak. Podawany na zimno.',
        tags: [{ t: '7g białka', c: 'b' }, { t: 'na zimno', c: 'g' }, { t: 'wegetariańskie', c: 'g' }],
        kcal: 222, protein: 7, carbs: 34, fat: 6,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: 'Mleko',
        weight: '237g',
      },
      {
        name: 'Zupa zacierkowa z kawałkami kurczaka',
        emoji: '🍎',
        why: 'Lekka gorąca zupa z makaronem — syta, dobrze tolerowana przy osłabieniu. Kurczak dostarcza chudego białka.',
        tags: [{ t: '19g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 211, protein: 19, carbs: 26, fat: 4,
        isRec: false, score: 6,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Zboża z glutenem, Seler',
        weight: '405g',
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
        name: 'Gulasz z indyka z ryżem',
        emoji: '🍽️',
        why: 'Indyk to najłagodniejsze białko mięsne — 37g w porcji. Ryż uzupełnia węglowodany. Brak silnych alergenów.',
        tags: [{ t: '37g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 502, protein: 37, carbs: 66, fat: 11,
        isRec: true, score: 9,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: '',
        weight: '490g',
      },
      {
        name: 'Łosoś pieczony z marchewką',
        emoji: '🍽️',
        why: 'Łosoś dostarcza kwasów omega-3 wspierających odporność. Marchew — beta-karoten. Alternatywa dla nielubiących drobiu.',
        tags: [{ t: '31g białka', c: 'b' }, { t: 'ryby', c: '' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 499, protein: 31, carbs: 57, fat: 18,
        isRec: false, score: 7,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Ryby',
        weight: '361g',
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
        name: 'Zupa krem z zielonych warzyw',
        emoji: '🍏',
        why: 'Krem z zielonych warzyw dostarcza żelaza i folianów. Wegetariańska, gorąca — syta i lekka jednocześnie.',
        tags: [{ t: '12g białka', c: 'b' }, { t: 'wegetariańskie', c: 'g' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 195, protein: 12, carbs: 15, fat: 11,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: 'Seler, Mleko',
        weight: '435g',
      },
      {
        name: 'Shake marchew-brzoskwinia-banan',
        emoji: '🍏',
        why: 'Wysokobiałkowy shake z warzywami. Beta-karoten z marchewki wspiera regenerację. Dobra opcja gdy nie masz apetytu na zupę.',
        tags: [{ t: '23g białka', c: 'b' }, { t: 'na zimno', c: 'g' }, { t: 'wegetariańskie', c: 'g' }],
        kcal: 247, protein: 23, carbs: 33, fat: 4,
        isRec: false, score: 6,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Soja, Mleko',
        weight: '330g',
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
        name: 'Greckie orzotto z kurczakiem',
        emoji: '🌙',
        why: 'Orzo z kurczakiem — lekkie danie wieczorne z 17g białka. Ciepłe, syte, dobrze tolerowane przed snem.',
        tags: [{ t: '17g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 318, protein: 17, carbs: 32, fat: 13,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: 'Mleko, Zboża z glutenem',
        weight: '305g',
      },
      {
        name: 'Pieczeń drobiowa z cukinią',
        emoji: '🌙',
        why: 'Lekka pieczeń drobiowa z cukinią — serwowana na zimno. Dobra gdy wieczorem lepiej tolerujesz chłodne dania.',
        tags: [{ t: '17g białka', c: 'b' }, { t: 'na zimno', c: 'g' }],
        kcal: 274, protein: 17, carbs: 40, fat: 6,
        isRec: false, score: 6,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Jaja, Zboża z glutenem, Mleko',
        weight: '213g',
      },
    ],
  },
  {
    id: 'shake',
    icon: '🥤',
    title: 'Koktajl',
    time: 'dowolna pora',
    timeHour: 12,
    options: [
      {
        name: 'OnkoShake owoce leśne',
        emoji: '🥤',
        why: 'Specjalistyczny koktajl z 18g białka serwatkowego. Owoce leśne dostarczają antyoksydantów. Kluczowy przy problemach z apetytem.',
        tags: [{ t: '18g białka', c: 'b' }, { t: 'na zimno', c: 'g' }],
        kcal: 169, protein: 18, carbs: 12, fat: 3,
        isRec: true, score: 8,
        scoreReason: 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.',
        allergensText: 'Mleko',
        weight: '250g',
      },
      {
        name: 'OnkoShake aronia-jabłko-gruszka',
        emoji: '🥤',
        why: 'Aronia ma potwierdzone działanie immunostymulujące. Wariant z jabłkiem i gruszką — łagodny, bez intensywnych aromatów.',
        tags: [{ t: '25g białka', c: 'b' }, { t: 'na zimno', c: 'g' }, { t: 'wegetariańskie', c: 'g' }],
        kcal: 234, protein: 25, carbs: 22, fat: 6,
        isRec: false, score: 7,
        scoreReason: 'Opcja alternatywna dostępna na życzenie pacjenta.',
        allergensText: 'Mleko',
        weight: '253g',
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
    label: 'Dzisiejsze menu',
    sub: 'Posiłki zostały zamówione wcześniej — serwowane dziś',
    meals: [
      { emoji: '🥗', type: 'Śniadanie', name: 'Szpinakowe muffinki z fetą, łososiowy twaróżek', kcal: 341, badge: 'zjedzone', bc: 'g' },
      { emoji: '🍰', type: 'II Śniadanie', name: 'Ciasto jogurtowe z truskawkami', kcal: 207, badge: 'zjedzone', bc: 'g' },
      { emoji: '🐟', type: 'Obiad', name: 'Dorsz na parze z puree z batatów i szpinakiem', kcal: 502, badge: 'zjedzone', bc: 'g' },
      { emoji: '🍲', type: 'Podwieczorek', name: 'Krupnik jęczmienny z kurczakiem', kcal: 221, badge: 'zjedzone', bc: 'g' },
      { emoji: '🥙', type: 'Kolacja', name: 'Pasztet warzywny z pieczywem i roszponką', kcal: 297, badge: 'oczekuje', bc: 'o' },
    ],
  },
  sat: {
    label: 'Posiłki na jutro — sobota',
    sub: 'Zamówione wcześniej — serwowane jutro',
    meals: [
      { emoji: '🍖', type: 'Śniadanie',    name: 'Pasztet drobiowy z pieczywem pszennym i słupkami pieczonej papryki',    kcal: 408, badge: 'zamówiono', bc: 'g' },
      { emoji: '🥤', type: 'II Śniadanie', name: 'Koktajl a\'la Kubuś',                                                    kcal: 201, badge: 'zamówiono', bc: 'g' },
      { emoji: '🍲', type: 'Obiad',        name: 'Klopsiki wołowo-wieprzowe z puree selerowo-ziemniaczanym',               kcal: 504, badge: 'zamówiono', bc: 'g' },
      { emoji: '🥤', type: 'Podwieczorek', name: 'Shake białkowy marchew-brzoskwinia-banan',                               kcal: 247, badge: 'zamówiono', bc: 'g' },
      { emoji: '🍞', type: 'Kolacja',      name: 'Pasta z miruny z warzywami z pszenną bagietką i gotowanymi jarzynami',  kcal: 316, badge: 'zamówiono', bc: 'g' },
      { emoji: '🥭', type: 'Koktajl',      name: 'Onkoshake aronia-mango-jabłko',                                          kcal: 206, badge: 'zamówiono', bc: 'g' },
      { emoji: '🍊', type: 'OnkoShot',     name: 'Onkoshot brzoskwinia-pomarańcza-jabłko-dynia-marchew',                  kcal:  44, badge: 'zamówiono', bc: 'g' },
    ],
  },
  sun: {
    label: 'Zamów na niedzielę',
    sub: 'Zamówienie otwarte — wybierz posiłki do 20:00',
    meals: [
      { emoji: '?', type: 'Śniadanie',    name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'II Śniadanie', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'Obiad',        name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'Podwieczorek', name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'Kolacja',      name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'Koktajl',      name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
      { emoji: '?', type: 'OnkoShot',     name: 'Nie wybrano jeszcze', kcal: 0, badge: 'oczekuje', bc: 'o' },
    ],
  },
};

// Mock data dla 3 dni wstecz (indeks 0 = najstarszy = dziś-3, 2 = wczoraj = dziś-1)
export const pastMockDays: PlanDay[] = [
  {
    label: 'Posiłki sprzed 3 dni',
    sub: 'Dzień 1. cyklu — po wlewie chemioterapii',
    meals: [
      { emoji: '🥗', type: 'Śniadanie',    name: 'Twarożek buraczkowy z pieczywem pszennym i warzywami sezonowymi',    kcal: 281, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍮', type: 'II Śniadanie', name: 'Malinowy budyń jaglany z frużeliną borówkową',                       kcal: 211, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍗', type: 'Obiad',        name: 'Gulasz z indyka z kuskusem perłowym i pieczarkami',                  kcal: 502, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🧀', type: 'Podwieczorek', name: 'Miodowy twarożek pomarańczowy z waflami ryżowymi',                   kcal: 198, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🥙', type: 'Kolacja',      name: 'Bajgiel z twarożkiem, filetem z kurczaka i rukolą',                  kcal: 305, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🫐', type: 'Koktajl',      name: 'OnkoShake z aronią, jabłkiem i gruszką',                             kcal: 234, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🌿', type: 'OnkoShot',     name: 'OnkoShot kurkuma-imbir',                                             kcal:  42, badge: 'zjedzone',    bc: 'g' },
    ],
  },
  {
    label: 'Posiłki sprzed 2 dni',
    sub: 'Dzień 2. cyklu — regeneracja po wlewie',
    meals: [
      { emoji: '🍳', type: 'Śniadanie',    name: 'Omlet z bananem, jabłkiem i cynamonem ze skyrem naturalnym',         kcal: 405, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🥣', type: 'II Śniadanie', name: 'Barszczyk czerwony zabielany z puszystymi kluseczkami',               kcal: 239, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🐟', type: 'Obiad',        name: 'Łosoś pieczony z koperkiem, puree z grochu z pęczakiem i szpinak',   kcal: 498, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🥣', type: 'Podwieczorek', name: 'Zupa krem z pietruszki, gruszki i dyni z grzankami żytnimi',         kcal: 189, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍚', type: 'Kolacja',      name: 'Greckie orzotto z kurczakiem zapiekane z fetą i suszonymi pomidorami',kcal: 318, badge: 'częściowo',  bc: 'o' },
      { emoji: '🫐', type: 'Koktajl',      name: 'OnkoShake owoce leśne',                                               kcal: 169, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍑', type: 'OnkoShot',     name: 'Onkoshot z pieczoną śliwką',                                          kcal:  66, badge: 'zjedzone',    bc: 'g' },
    ],
  },
  {
    label: 'Posiłki z wczoraj',
    sub: 'Dzień wlewu — dieta okołowlewowa (lekkostrawna)',
    meals: [
      { emoji: '🍚', type: 'Śniadanie',    name: 'Kleik ryżowy z mlekiem bez laktozy, miodem i startą skórką cytrynową',kcal: 180, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍎', type: 'II Śniadanie', name: 'Mus jabłkowy z cynamonem i kardamonem',                               kcal:  95, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍲', type: 'Obiad',        name: 'Krupnik ryżowy z indykiem i natką pietruszki',                        kcal: 220, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍎', type: 'Podwieczorek', name: 'Pieczone jabłko z cynamonem, miodem i orzechami laskowymi',           kcal: 120, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🍚', type: 'Kolacja',      name: 'Ryż biały z duszonym jabłkiem i cynamonem',                           kcal: 215, badge: 'nie zjedzone', bc: '' },
      { emoji: '🥭', type: 'Koktajl',      name: 'OnkoShake mango-kokos',                                               kcal: 270, badge: 'zjedzone',    bc: 'g' },
      { emoji: '🌱', type: 'OnkoShot',     name: 'OnkoShot len-owoce leśne',                                            kcal:  55, badge: 'zjedzone',    bc: 'g' },
    ],
  },
];

export const symptomTips: Record<string, string> = {
  nausea: 'Nudności — wywietrz pomieszczenie przed posiłkiem. Sięgnij po schłodzone musy.',
  taste: 'Brak smaku — wzmacniaj aromat potraw ziołami i cytryną.',
  taste_change: 'Zmiana smaku — doprawiaj cytryną lub octem balsamicznym. Unikaj metalicznych sztućców.',
  diarrhea: 'Biegunka — dieta BRAT: kleik ryżowy, banan, pieczone jabłko, tost.',
  mouth: 'Pieczenie w jamie ustnej — produkty chłodne i miękkie. Unikaj imbiru i cynamonu.',
  const: 'Zaparcia — kefir, jogurt, owsianka. Minimum 2,5 l płynów.',
  fatigue: 'Zmęczenie — jedz regularnie co 2–3h, nie pomijaj posiłków.',
  appetite: 'Brak apetytu — małe porcje, bogato odżywcze. Koktajle białkowe.',
  dryness: 'Suchość w ustach — pij małymi łykami często. Ssij kostki lodu.',
  metal: 'Metaliczny posmak — używaj plastikowych sztućców, jedz schłodzone dania.',
};

export const allergensList: Allergen[] = [
  { key: 'gluten',    label: 'Zboża zawierające gluten',          icon: 'ti-wheat' },
  { key: 'shellfish', label: 'Skorupiaki',                         icon: 'ti-ripple' },
  { key: 'eggs',      label: 'Jaja',                               icon: 'ti-egg' },
  { key: 'fish',      label: 'Ryby',                               icon: 'ti-fish' },
  { key: 'peanuts',   label: 'Orzeszki ziemne',                    icon: 'ti-nut' },
  { key: 'soy',       label: 'Soja',                               icon: 'ti-plant' },
  { key: 'dairy',     label: 'Mleko',                              icon: 'ti-droplet' },
  { key: 'nuts',      label: 'Orzechy',                            icon: 'ti-trees' },
  { key: 'celery',    label: 'Seler',                              icon: 'ti-leaf' },
  { key: 'mustard',   label: 'Gorczyca',                           icon: 'ti-bottle' },
  { key: 'sesame',    label: 'Sezam',                              icon: 'ti-circle-dot' },
  { key: 'sulphites', label: 'Dwutlenek siarki i siarczyny',       icon: 'ti-flask' },
  { key: 'lupin',     label: 'Łubin',                              icon: 'ti-flower' },
  { key: 'molluscs',  label: 'Mięczaki',                           icon: 'ti-wave-sine' },
];

interface DailyTargetsInput {
  weightKg: number;
  heightCm: number;
  birthYear: number;
  sex: 'female' | 'male' | '';
}

const MALE_SWE_OFFSET = 5;
const FEMALE_SWE_OFFSET = -161;

function getAgeFromBirthYear(birthYear: number): number {
  if (!Number.isFinite(birthYear)) return 0;
  const currentYear = new Date().getFullYear();
  return Math.max(0, Math.min(120, currentYear - birthYear));
}

export function getDailyTargets({ weightKg, heightCm, birthYear, sex }: DailyTargetsInput) {
  if (sex === '') {
    return {
      kcal: Math.round(weightKg * 27.5),
      protein: Math.round(weightKg * 1.2),
      carbs: 220,
      fat: 60,
    };
  }

  const age = getAgeFromBirthYear(birthYear);
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const swe = base + (sex === 'male' ? MALE_SWE_OFFSET : FEMALE_SWE_OFFSET);

  return {
    kcal: Math.round(swe),
    protein: Math.round(weightKg * 1.2),
    carbs: 220,
    fat: 60,
  };
}

export const DAILY_TARGETS = getDailyTargets({
  weightKg: 65,
  heightCm: 170,
  birthYear: 1970,
  sex: 'female',
});

export interface MockSymptom {
  key: string;
  hour: number;
  minute: number;
  scale: number;
  note?: string;
}

export const pastMockSymptoms: Record<number, MockSymptom[]> = {
  [-4]: [
    { key: 'taste',   hour:  9, minute: 15, scale: 40, note: 'Jedzenie smakuje metalicznie, szczególnie mięso' },
    { key: 'const',   hour: 11, minute:  0, scale: 35 },
  ],
  [-3]: [
    { key: 'nausea',   hour:  8, minute: 45, scale: 30 },
    { key: 'appetite', hour: 12, minute: 30, scale: 50, note: 'Brak chęci do jedzenia obiadu, zjadłem połowę' },
    { key: 'fatigue',  hour: 17, minute:  0, scale: 55 },
  ],
  [-2]: [
    { key: 'metal',   hour: 10, minute:  0, scale: 45, note: 'Metaliczny posmak po śniadaniu' },
    { key: 'fatigue', hour: 14, minute: 30, scale: 55 },
  ],
  [-1]: [
    { key: 'nausea',  hour:  9, minute: 30, scale: 70, note: 'Silne nudności po wlewie chemioterapii' },
    { key: 'fatigue', hour: 15, minute:  0, scale: 60 },
    { key: 'dryness', hour: 20, minute:  0, scale: 40 },
  ],
};
