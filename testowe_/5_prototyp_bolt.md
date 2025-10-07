Cel PoC:
Zweryfikować podstawową funkcjonalność generowania fiszek przy użyciu AI – użytkownik podaje tekst (do 5000 znaków), a system wysyła request do GPT-4.1 API, przetwarza odpowiedź i wyświetla maksymalnie 30 fiszek z ograniczeniami:

Front fiszki: max 200 znaków
Tył fiszki: max 500 znaków
Zakres funkcjonalności:

Interfejs umożliwiający wklejenie tekstu przez użytkownika;
Wyświetlenie licznika znaków oraz przycisku "Generate";
Pokazanie loading spinnera podczas generowania;
Odebranie odpowiedzi w formacie JSON z tablicą fiszek oraz sugerowaną nazwą folderu;
Prezentacja wygenerowanych fiszek w prostej liście.
Stos technologiczny:

Frontend: Astro + React, TypeScript, Tailwind CSS
Backend: Supabase (minimalne wykorzystanie – np. do symulacji requestu do AI lub jako API proxy)
AI: Integracja z usługą Openrouter.ai (symulacja lub prawdziwe wywołanie API)
Wymagania dodatkowe:

Żadne dodatkowe funkcje (takie jak rejestracja, logowanie, pełne CRUD operacje, czy sesja nauki) nie powinny być uwzględnione.
Całość ma stanowić minimalną, działającą wersję PoC.
Kroki realizacji:

Przygotowanie szkieletu projektu w Astro z React.
Implementacja strony głównej z polem tekstowym, licznikiem znaków i przyciskiem "Generate".
Dodanie mechanizmu wyświetlania loading spinnera podczas wywołania API.
Integracja z usługą AI (możliwa symulacja) – wysłanie zapytania i przetwarzanie otrzymanej odpowiedzi.
Prezentacja wygenerowanych fiszek (lista z frontem i tyłem) wraz z sugerowaną nazwą folderu.
Przekazanie planu do zatwierdzenia przed rozpoczęciem tworzenia PoC.
Prośba o akceptację:
"Przed przystąpieniem do finalnej implementacji, proszę o przejrzenie powyższego planu i potwierdzenie, czy odpowiada on Twoim oczekiwaniom dotyczącym PoC. Czy mogę kontynuować z implementacją zgodnie z tym planem?"
