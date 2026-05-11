# Plan zmian w interfejsie Frontend

## 1. Cel zadania
Uproszczenie interfejsu użytkownika (UI) w celu zwiększenia czytelności menu głównego, przy jednoczesnym zachowaniu pełnej informacji analitycznej w procesie zamawiania posiłków.

## 2. Zakres zmian

### A. Dolny pasek nawigacji (`Navbar.tsx`)
- **Dodanie nowej zakładki**: Wprowadzenie ikony "Objawy" (`ti-mood-sick`) do głównego paska nawigacji.
- **Dostępność**: Umożliwienie szybkiego przejścia do raportowania samopoczucia z dowolnego miejsca w aplikacji.

### B. Ekran Główny (`HomeScreen.tsx`)
- **Usunięcie statystyk makro**: Skasowanie pigułek z sumą kalorii i białka z góry ekranu.
- **Uproszczenie kart posiłków (`MealCard`)**: Usunięcie tagów informacyjnych o kcal i białku pod nazwą posiłku.
- **Nowa sekcja "Samopoczucie"**: 
  - Usunięcie siatki ikon pojedynczych objawów.
  - Dodanie **szerokiej karty** z pytaniem "Jak się dziś czujesz?", która przenosi użytkownika do dedykowanego ekranu raportowania (`AddSymScreen`).

### C. Ekran Zamówień (`OrderScreen.tsx`)
- **Zachowanie danych**: Pozostawienie wszystkich wartości odżywczych (kcal, B, W, T) na kartach posiłków oraz w podsumowaniu na dole ekranu.
- **Uzasadnienie**: Podczas planowania i zamawiania pacjent potrzebuje pełnej wiedzy o tym, co wybiera.

## 3. Korzyści
- **Mniejszy "szum" informacyjny**: Pacjent skupia się na tym, co ma zjeść teraz, a nie na liczeniu gramów i kalorii na każdym kroku.
- **Czytelność**: Interfejs staje się bardziej nowoczesny i mniej przytłaczający.
- **Intuicyjność**: Wyraźny przycisk "Jak się dziś czujesz?" zachęca do regularnego raportowania stanu zdrowia.

## 4. Status realizacji
- [x] Edycja `Navbar.tsx`
- [x] Edycja `HomeScreen.tsx`
- [ ] Weryfikacja wizualna
