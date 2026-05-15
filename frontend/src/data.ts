import type { Meal, PlanDay, Allergen } from './types';

// Dane z API: https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules
// dietId=2388, dietVariantId=4881, dietVariantCaloriesId=18414, menuScheduleId=7354
// Data: 2026-05-15 (piątek)
export const meals: Meal[] = [
  {
    id: 'breakfast',
    icon: '🥣',
    title: 'Śniadanie',
    time: 'ok. 8:00',
    timeHour: 8,
    options: [
      {
        name: 'Szpinakowe muffinki z fetą, podane z łososiowym twaróżkiem bez laktozy i gotowaną marchewką',
        emoji: '🥗',
        why: 'Szpinak dostarcza żelaza, łosoś — kwasów omega-3 wspierających odporność. Muffin łagodny, można jeść ciepły lub schłodzony.',
        tags: [{ t: '19g białka', c: 'b' }, { t: 'omega-3', c: 'g' }, { t: 'ryby', c: '' }],
        kcal: 341, protein: 19, carbs: 38, fat: 14,
        isRec: true, score: 8,
        scoreReason: 'Dawka kwasów omega-3 i żelaza w pierwszym posiłku dnia — wspiera regenerację. Skyr i łosoś zwiększają biodostępność białka rano.',
        ingredients: 'Marchew, Mąka pszenna, Szpinak, Jogurt naturalny 1,5%, Twaróg bez laktozy, Ser Feta, Serek naturalny, Masa jajowa pasteryzowana, Łosoś wędzony, Mleko bez laktozy, Olej rzepakowy, Oliwa z wytłoczyn oliwek, Koper, Proszek do pieczenia, Sól, Chrzan tarty, Pieprz czarny mielony',
        allergensText: 'Zboża zawierające gluten, Jaja, Mleko i p. p, Ryby',
        weight: '221g',
      },
      {
        name: 'Omlet z bananem, jabłkiem i cynamonem ze skyrem i musem jabłkowo-gruszkowym',
        emoji: '🍳',
        why: 'Banan stabilizuje żołądek i dostarcza potasu. Omlet z jajek — łatwo przyswajalne białko z 26g na porcję. Podawać ciepłe.',
        tags: [{ t: '26g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 405, protein: 26, carbs: 53, fat: 11,
        isRec: false, score: 6,
        scoreReason: 'Wysokobiałkowa opcja z bananem — dobra gdy nie ma nudności. W dni wlewu i bezpośrednio po nim lepiej wybrać opcję rekomendowaną.',
        ingredients: 'Skyr naturalny, Masa jajowa pasteryzowana, Banany, Jabłka, Gruszka, Jabłka prażone, Płatki jęczmienne, Sok z cytryny 100%, Erytrytol, Cynamon, Kardamon mielony',
        allergensText: 'Jaja, Zboża zawierające gluten, Mleko i p. p',
        weight: '390g',
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
        name: 'Ciasto jogurtowe z truskawkami',
        emoji: '🍰',
        why: 'Lekka słodka przekąska z probiotycznym jogurtem. Truskawki dostarczają witaminę C. Bezpieczna na zimno.',
        tags: [{ t: '5g białka', c: 'b' }, { t: 'słodkie', c: '' }, { t: 'na zimno', c: 'g' }],
        kcal: 207, protein: 5, carbs: 33, fat: 7,
        isRec: true, score: 7,
        scoreReason: 'Lekka, słodka przekąska bezpieczna przy wrażliwym żołądku. Jogurt zapewnia probiotyki między głównymi posiłkami.',
        ingredients: 'Mąka pszenna, Jogurt naturalny 1,5%, Truskawki, Masa jajowa pasteryzowana, Cukier, Olej rzepakowy, Proszek do pieczenia',
        allergensText: 'Zboża zawierające gluten, Jaja, Mleko i p. p',
        weight: '80g',
      },
      {
        name: 'Zupa krem z cukinii z kulkami mozzarelli',
        emoji: '🥣',
        why: 'Cukinia jest wyjątkowo łagodna dla żołądka. Wegetariańska, gorąca zupa — dobra gdy smak schodzi na drugi plan.',
        tags: [{ t: '10g białka', c: 'b' }, { t: 'wegetariańskie', c: 'g' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 201, protein: 10, carbs: 19, fat: 10,
        isRec: false, score: 6,
        scoreReason: 'Wegetariańska zupa kremowa — dobra przy metalicznym posmaku (neutralny smak warzyw). Ciepła, wymaga dobrego samopoczucia.',
        ingredients: 'Woda, Cukinia, Ser mozzarella kuleczki mini, Ziemniaki, Marchew, Seler, Pietruszka, Por, Olej rzepakowy, Mąka ziemniaczana, Natka pietruszki, Przyprawa warzywna (bez glutaminianu sodu), Przyprawa do zup (bez glutaminianu), Sól, Bulion warzywny, Oregano suszone, Pieprz czarny mielony',
        allergensText: 'Seler, Mleko i p. p',
        weight: '385g',
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
        name: 'Dorsz na parze podany z pesto bazyliowym, puree z batatów i szpinakiem z sosem vinegrette',
        emoji: '🐟',
        why: 'Dorsz gotowany na parze — najłagodniejsza forma białka rybnego. Bataty dostarczają beta-karotenu i energii. 28g białka.',
        tags: [{ t: '28g białka', c: 'b' }, { t: 'na parze', c: 'g' }, { t: 'ryby', c: '' }],
        kcal: 502, protein: 28, carbs: 42, fat: 25,
        isRec: true, score: 9,
        scoreReason: 'Dorsz z pary to wzorcowe danie białkowe — minimalny tłuszcz, wysoka biodostępność, brak silnych aromatów. Bataty uzupełniają beta-karoten.',
        ingredients: 'Filet z dorsza czarnego mrożony, Bataty, Ziemniaki, Pesto bazyliowe (bazylia, oliwa z oliwek extra vergine, olej rzepakowy, Ser Grana Padano DOP, orzeszki piniowe, czosnek), Masło 82%, Szpinak, Śmietana 12%, Oliwa z wytłoczyn oliwek, Sok z cytryny 100%, Mąka ziemniaczana, Jogurt naturalny 1,5%, Sól, Miód, Pieprz czarny mielony, Pieprz cytrynowy, Gałka muszkatołowa mielona, Koper suszony, Natka pietruszki suszona',
        allergensText: 'Ryby, Mleko i p. p, Jaja',
        weight: '313g',
      },
      {
        name: 'Ravioletti buraczkowe z kozim serem podane z sosem jogurtowo-koperkowym i rukolą',
        emoji: '🍝',
        why: 'Buraki wspierają regenerację krwi, kozi ser jest łatwiej tolerowany niż krowi. Gorące makaronowe danie.',
        tags: [{ t: '25g białka', c: 'b' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 499, protein: 25, carbs: 58, fat: 18,
        isRec: false, score: 6,
        scoreReason: 'Ravioletti z burakami dostarczają folianów i żelaza, ale makaron może być cięższy przy osłabionej perystaltyce. Bezpieczne gdy czujesz się dobrze.',
        ingredients: 'Ravioletti buraczkowe ze świeżym kozim serem (semolina z pszenicy durum, ser ricotta, ser kozi, masa jajowa pasteryzowana, woda, bułka tarta, buraki ćwikłowe suszone, sól, przyprawy), Jogurt naturalny 1,5%, Rukola, Olej rzepakowy, Koper, Sól, Kurkuma',
        allergensText: 'Zboża zawierające gluten, Jaja, Mleko i p. p',
        weight: '270g',
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
        name: 'Krupnik jęczmienny z kawałkami kurczaka',
        emoji: '🍲',
        why: 'Lekka zupa z kaszą — ciepła, syta, bezpieczna przy wrażliwości żołądkowej. Kurczak dostarcza chudego białka. Porcja 400g.',
        tags: [{ t: '17g białka', c: 'b' }, { t: 'zupa', c: 'g' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 221, protein: 17, carbs: 29, fat: 5,
        isRec: true, score: 8,
        scoreReason: 'Krupnik z kaszą i kurczakiem — kompletne mini-danie białkowo-węglowodanowe. Seler może nasilać metaliczny posmak u wrażliwych.',
        ingredients: 'Woda, Filet z kurczaka, Marchew, Ziemniaki, Kasza jęczmienna, Seler, Pietruszka, Por, Olej rzepakowy, Natka pietruszki, Przyprawa warzywna (bez glutaminianu sodu), Sól, Przyprawa do zup (bez glutaminianu), Bulion warzywny, Majeranek, Lubczyk suszony, Natka pietruszki suszona, Zioła prowansalskie, Pieprz czarny mielony',
        allergensText: 'Seler, Zboża zawierające gluten',
        weight: '400g',
      },
      {
        name: 'Kleik ryżowy z musem malinowym',
        emoji: '🍚',
        why: 'Kleik ryżowy to element diety BRAT — stabilizuje żołądek. Maliny zawierają antyoksydanty, łagodna słodycz.',
        tags: [{ t: '12g białka', c: 'b' }, { t: 'kleik BRAT', c: 'g' }, { t: 'słodkie', c: '' }],
        kcal: 193, protein: 12, carbs: 30, fat: 3,
        isRec: false, score: 7,
        scoreReason: 'Kleik BRAT stabilizuje jelita po biegunkowym epizodzie. Maliny i skyr razem dają białko + antyoksydanty bez obciążenia.',
        ingredients: 'Mleko 2%, Skyr naturalny, Maliny, Ryż biały, Ksylitol, Miód, Woda, Krem orzechowy, Cynamon',
        allergensText: 'Mleko i p. p, Orzechy',
        weight: '210g',
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
        name: 'Pasztet warzywny z pieczywem pszennym, roszponką i cukinią',
        emoji: '🥙',
        why: 'Lekka wegetariańska kolacja z pieczywem — serwowana na zimno, idealna gdy apetyt słaby. Roszponka dodaje witamin.',
        tags: [{ t: '10g białka', c: 'b' }, { t: 'wegetariańskie', c: 'g' }, { t: 'na zimno', c: '' }],
        kcal: 297, protein: 10, carbs: 48, fat: 8,
        isRec: true, score: 7,
        scoreReason: 'Warzywna kolacja na zimno — idealna wieczorem przy zmęczeniu żucia lub bólu jamy ustnej. Niski tłuszcz, wysoki błonnik.',
        ingredients: 'Cukinia, Chleb pszenny (Mąka pszenna, woda, sól, drożdże, mąka żytnia), Seler, Marchew, Masa jajowa pasteryzowana, Jabłka, Roszponka, Kasza manna, Olej rzepakowy, Sól, Babka jajowata, Majeranek, Zioła prowansalskie',
        allergensText: 'Seler, Jaja, Zboża zawierające gluten',
        weight: '270g',
      },
      {
        name: 'Zapiekanka ziemniaczana z marchewką i mozzarellą z dipem jogurtowo-ziołowym i pieczoną cukinią',
        emoji: '🧀',
        why: 'Syta ciepła kolacja z nabiałem i warzywami. Ziemniaki dają energię, mozzarella — wapń. Dobra gdy apetyt wraca wieczorem.',
        tags: [{ t: '21g białka', c: 'b' }, { t: 'zapiekanka', c: '' }, { t: 'podawać ciepłe', c: '' }],
        kcal: 404, protein: 21, carbs: 42, fat: 18,
        isRec: false, score: 6,
        scoreReason: 'Syta ciepła kolacja — lepsza gdy apetyt wraca pod wieczór. Mozzarella i śmietanka zwiększają kaloryczność, co jest korzystne przy niedożywieniu.',
        ingredients: 'Ziemniaki, Cukinia, Marchew, Ser mozzarella, Jogurt naturalny 1,5%, Masa jajowa pasteryzowana, Śmietanka, Rukola, Koper, Olej rzepakowy, Sól, Oregano suszone, Majeranek, Tymianek, Zioła prowansalskie, Pieprz biały, Natka pietruszki, Bazylia suszona, Pieprz czarny mielony',
        allergensText: 'Jaja, Mleko i p. p',
        weight: '358g',
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
        name: 'OnkoShake mango-kokos',
        emoji: '🥭',
        why: 'Specjalistyczny koktajl z 21g białka serwatkowego. Mango i kokos łagodzą metaliczny posmak. Kluczowe przy problemach z apetytem.',
        tags: [{ t: '21g białka', c: 'b' }, { t: 'koktajl specjalistyczny', c: 'g' }, { t: 'na zimno', c: '' }],
        kcal: 270, protein: 21, carbs: 25, fat: 10,
        isRec: true, score: 8,
        scoreReason: 'OnkoShake to specjalistyczny koktajl białkowy do suplementacji przy utracie apetytu. Mango-kokos jest dobrze tolerowany nawet przy metalicznym posmaku.',
        ingredients: 'Mleko bez laktozy, Pulpa mango, Mleczko kokosowe, Koncentrat białek serwatkowych, Kardamon mielony',
        allergensText: 'Soja, Mleko i p. p',
        weight: '250ml',
      },
      {
        name: 'Onkoshake brzoskwinia-pomarańcza-jabłko-dynia-marchew',
        emoji: '🍑',
        why: 'Koktajl proteinowy z warzywami i owocami — beta-karoten, witaminy, 19g białka. Mniej słodki niż opcja mango.',
        tags: [{ t: '19g białka', c: 'b' }, { t: 'koktajl proteinowy', c: 'g' }, { t: 'na zimno', c: '' }],
        kcal: 193, protein: 19, carbs: 20, fat: 5,
        isRec: false, score: 7,
        scoreReason: 'Wariantowa receptura z warzywami — nieco mniej kalorii, ale bogata w beta-karoten. Dobra przy trudnościach z warzywami w stałej postaci.',
        ingredients: 'Mleko bez laktozy, Sok jabłkowy, Brzoskwinie, Sok pomarańczowy, Jabłko, Odżywka białkowa, Marchew, Dynia',
        allergensText: 'Mleko i p. p',
        weight: '245ml',
      },
    ],
  },
  {
    id: 'shot',
    icon: '🌿',
    title: 'OnkoShot',
    time: 'rano na czczo',
    timeHour: 7,
    options: [
      {
        name: 'OnkoShot len-owoce leśne',
        emoji: '🫐',
        why: 'Siemię lniane wspiera motorykę jelit i dostarcza lignanów — antyoksydantów. Skoncentrowany shot immunostymulujący w 100ml.',
        tags: [{ t: 'omega-3', c: 'g' }, { t: 'antyoksydanty', c: 'g' }, { t: 'na zimno', c: '' }],
        kcal: 55, protein: 1, carbs: 12, fat: 2,
        isRec: true, score: 8,
        scoreReason: 'OnkoShot z siemieniem lnianym — lecznicza dawka lignanów i kwasów omega-3 w 100ml. Owoce leśne maskują gorzkawy smak oleju lnianego.',
        ingredients: 'Woda, Mieszanka owoców leśnych, Miód, Siemię lniane, Olej lniany',
        allergensText: '',
        weight: '100ml',
      },
      {
        name: 'Onkoshot aronia-jabłko',
        emoji: '🍎',
        why: 'Aronia ma jeden z najwyższych poziomów antyoksydantów wśród owoców. Nasiona chia dodają błonnik i wspierają wchłanianie.',
        tags: [{ t: 'antyoksydanty', c: 'g' }, { t: 'chia', c: '' }, { t: 'na zimno', c: '' }],
        kcal: 54, protein: 1, carbs: 13, fat: 1,
        isRec: false, score: 7,
        scoreReason: 'Aronia ma potwierdzone działanie antyoksydacyjne i immunostymulujące w onkologii. Nasiona chia wspomagają wchłanianie z jelit.',
        ingredients: 'Jabłko, Sok jabłkowy, Aronia, Nasiona chia',
        allergensText: '',
        weight: '100ml',
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
