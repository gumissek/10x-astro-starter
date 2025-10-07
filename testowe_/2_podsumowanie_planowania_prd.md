Podsumowanie rozmowy - Planowanie PRD dla aplikacji fiszek edukacyjnych
Decyzje podjęte przez użytkownika
Grupa biznesowa i użytkownicy
Docelowi użytkownicy: osoby uczące się języków obcych (konkretnie: polski → angielski)

Brak określonego timeline - projekt edukacyjny do nauki programowania

Brak płatnych subskrypcji w MVP

Brak limitów dla liczby folderów i fiszek na użytkownika

Technologia i architektura
Stack technologiczny: FastAPI (backend), React (frontend), PostgreSQL (baza danych)

Model AI: GPT-4.1 przez API do generowania fiszek

Structured output JSON: {flashcards: [{front:"...", back:"..."}, ...], suggested_folder_name: "..."}

Autoryzacja: email + hasło (bez weryfikacji emailowej)

JWT tokens z ważnością 24 godziny

Tylko light mode w MVP

Brak funkcji reset hasła w MVP

JavaScript na frontendzie (nie TypeScript), type hints w FastAPI

Feature-based struktura folderów React

Model danych
Tabela users: id, email, hashed_password, reset_code

Tabela folders: id, name, user_id

Tabela flashcards: id, front, back, folder_id, user_id, created_at, last_reviewed_at, review_count, correct_count

CASCADE DELETE przy usuwaniu folderów

Funkcjonalności generowania fiszek
Input: 5000 znaków maksymalnie (tekst w języku angielskim)

Output: maksymalnie 30 fiszek z jednego inputu

AI może zwrócić mniej niż 30 fiszek (akceptowalna dowolna liczba 1-30)

Przód fiszki: tekst po angielsku (max 200 znaków)

Tył fiszki: tłumaczenie po polsku (max 500 znaków)

AI sugeruje nazwę folderu na podstawie treści

Wygenerowane fiszki nie są automatycznie zapisywane - wymagają akceptacji

Fiszki znikają po zamknięciu karty (session-based)

Loading state: spinner + tekst "generowanie może trwać dłuższą chwilę"

Błędy API logowane tylko do konsoli

Funkcjonalności CRUD fiszek
Użytkownik może akceptować/edytować/odrzucić wygenerowane fiszki

Po review przycisk "Save X flashcards to folder"

Dropdown z wyborem istniejącego folderu lub utworzeniem nowego

Manualne tworzenie fiszek: formularz (front + back + wybór folderu) → Save

Edycja zapisanych fiszek przez przycisk "Edit" → modal z formularzem → Save

Duplikaty fiszek są dozwolone

Walidacja: front required + max 200 znaków, back required + max 500 znaków

Licznik znaków na żywo pod każdym polem textarea

Organizacja i foldery
Podział fiszek na foldery tematyczne

Nazwa folderu: maksymalnie 25 znaków

Użytkownik może zmieniać nazwę folderu po utworzeniu

Usuwanie folderu z fiszkami: modal z ostrzeżeniem + przyciski Cancel/Delete

Brak zagnieżdżonych folderów (płaska struktura)

Widok i nawigacja
Dashboard: przycisk "+ New Flashcards", grid/lista folderów

Dla każdego folderu: nazwa + ilość fiszek + przycisk "Study Now"

Lista fiszek w folderze: rozwijana lista (akordeon)

Tooltip po najechaniu myszką: pierwsze 50 znaków back content

Empty state gdy brak folderów: instrukcje + przycisk generowania

Sesja nauki
Jedna fiszka wyświetlana na pełnym ekranie

Flow: pokazanie front → użytkownik myśli → klika "Show Answer" → widzi back → ocenia się (dobrze/źle)

Sesja: 20 fiszek

Losowy wybór fiszek na podstawie najstarszych których jeszcze nie było (last_reviewed_at)

Zapisywanie statystyk: review_count (zawsze +1) i correct_count (tylko przy "dobrze")

Animacja success: zielony checkmark ✓ (500ms) + zielone tło fade

Animacja fail: czerwony X + shake animation karty

Automatyczne przejście do następnej fiszki po 500ms

Progress bar u góry: "12/20 cards"

Ekran podsumowania po sesji: "Session Complete!" + statystyki (Total, Correct, Wrong) + przyciski "Study Again" i "Back to Dashboard"

Brak keyboard shortcuts w MVP

Walidacja i bezpieczeństwo
Rejestracja: walidacja formatu email (regex), hasło minimum 8 znaków

Walidacja inline (real-time) z pokazywaniem błędów pod polami

Wszystkie endpoints chronione JWT tokenem (oprócz /register i /login)

CORS: whitelist konkretnych domen w production

Dopasowane rekomendacje
Przyjęte rekomendacje z pełną akceptacją
Model AI i koszty: Użycie GPT-4.1 przez API dla generowania fiszek (koszt ~$0.02-0.05 per request przy 30 fiszkach)

Limit tekstu wejściowego: 5000 znaków z licznikiem na interfejie

Format fiszek: Klasyczny przód-tył bez dodatkowych typów (luki, wielokrotny wybór)

Organizacja: Proste talie/foldery już w MVP jako podstawowa potrzeba użytkowników

Proces akceptacji AI-fiszek: Lista 30 fiszek z przyciskami Accept/Edit/Reject + button "Save X flashcards to folder" na końcu

Model danych: Standardowa struktura relacyjna users → folders → flashcards z odpowiednimi foreign keys

Zapisywanie statystyk: Kolumny review_count i correct_count dla przyszłego algorytmu spaced repetition

Structured output: JSON mode GPT-4.1 z tablicą obiektów fiszek + sugerowana nazwa folderu

Wybór folderu: Dropdown z listą istniejących + opcja "Create new folder"

UX sesji nauki: Fullscreen card style, jedna fiszka na ekran

Prompt engineering: Chain-of-thought prompting z instrukcjami dla GPT-4.1

Animacje feedback: Zielony checkmark + fade dla success, czerwony X + shake dla fail (500ms)

Edycja fiszek: Modal z formularzem, wymaga kliknięcia Save (bez auto-save)

Usuwanie folderów: Modal z ostrzeżeniem + CASCADE DELETE w bazie

Dashboard design: Prosty layout z przyciskiem "+ New Flashcards" i gridem folderów

Loading state AI: Spinner + komunikat o czasie generowania

Obsługa błędów API: Logowanie do konsoli z informacyjnymi komunikatami

Tooltip preview: Pierwsze 50 znaków back content (bez scrolla)

Limit sesji nauki: 20 fiszek

Ekran podsumowania: Statystyki po zakończeniu sesji + opcje "Study Again"/"Back to Dashboard"

Walidacja formularzy: Inline validation z licznikami znaków i regex dla email

Light mode tylko: Skip dark mode w MVP

Brak reset hasła: Pominięcie tej funkcjonalności w MVP

Connection pooling: SQLAlchemy z asyncpg i poolingiem (4-10 connections)

JWT lifetime: 24 godziny bez refresh tokens w MVP

Environment variables: Klucz API w .env lokalnie, platform secrets w production

Hosting: Rozdzielone serwisy (Vercel/Netlify dla frontu, Railway/Render dla backendu, Neon.tech dla PostgreSQL)

CORS setup: Whitelist konkretnych domen w production

Bezpieczeństwo endpoints: JWT token wymagany dla wszystkich oprócz /register i /login

Empty state: Guided onboarding z instrukcjami dla nowych użytkowników

Rekomendacje odrzucone lub zmodyfikowane
Keyboard shortcuts - odrzucone w MVP

Weryfikacja email - odrzucona w MVP

Reset hasła - odrzucony w MVP

TypeScript na frontendzie - odrzucony, zostaje JavaScript

Automated testing - odrzucone w MVP, tylko manualne testowanie

Limit nazwy folderu - zmodyfikowane z 50 na 25 znaków

Tooltip content - zmodyfikowane z 150 na 50 znaków

Tryby sesji nauki - zmodyfikowane, tylko 20 fiszek (bez 15-minutowego limitu czasowego ani "All cards")

Szczegółowe podsumowanie planowania PRD
Główny problem
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

Grupa docelowa
Osoby uczące się języków obcych, konkretnie polskojęzyczni użytkownicy uczący się angielskiego. MVP skupia się na jednym kierunku językowym: angielski (przód fiszki) → polski (tył fiszki).

Kluczowe wymagania funkcjonalne

1. Generowanie fiszek przez AI
   Użytkownik wkleja tekst po angielsku (max 5000 znaków) do pola textarea z licznikiem

System wysyła request do GPT-4.1 API z chain-of-thought promptingiem

AI analizuje tekst i ekstrahuje do 30 kluczowych słówek/zwrotów z kontekstem

Response w formacie JSON: tablica fiszek + sugerowana nazwa folderu

Loading state: spinner + komunikat informacyjny

Obsługa błędów: timeout, rate limit, invalid JSON z odpowiednimi komunikatami

2. Proces akceptacji wygenerowanych fiszek
   Lista 30 (lub mniej) fiszek do przeglądu

Każda fiszka ma przyciski: Accept / Edit / Reject

Edit otwiera inline formularz z polami front (max 200 znaków) i back (max 500 znaków)

Na dole listy: przycisk "Save X flashcards to folder" (X = liczba zaakceptowanych)

Dropdown do wyboru istniejącego folderu lub utworzenia nowego

AI-sugerowana nazwa folderu (max 25 znaków) jako domyślna wartość

Fiszki zapisywane do bazy dopiero po kliknięciu Save

Session-based storage: fiszki znikają po zamknięciu karty bez zapisu

3. Manualne tworzenie fiszek
   Formularz z trzema polami: Front (textarea, max 200 znaków), Back (textarea, max 500 znaków), Folder (dropdown)

Liczniki znaków na żywo: "45/200"

Walidacja inline: wszystkie pola required

Przycisk Save disabled gdy walidacja nie przechodzi

Dropdown z listą istniejących folderów użytkownika + opcja "Create new folder"

Duplikaty dozwolone (brak sprawdzania)

4. Zarządzanie fiszkami (CRUD)
   Przeglądanie: Lista rozwijana (akordeon) w widoku folderu

Po najechaniu myszką: tooltip z pierwszymi 50 znakami back content

Po kliknięciu: rozwinięcie pokazujące pełny back content + przyciski Edit/Delete

Edycja: Modal z formularzem (front, back, folder) + przycisk "Save changes"

Usuwanie: Pojedyncze fiszki przez ikonę kosza w roziniętym widoku

5. Zarządzanie folderami
   Tworzenie: Podczas zapisywania fiszek lub przez dashboard

Przeglądanie: Grid/lista na dashboardzie z nazwą + ilością fiszek + button "Study Now"

Edycja nazwy: Opcja "Rename folder" w menu kontekstowym (3 kropki)

Usuwanie: Modal z ostrzeżeniem "Delete folder 'X' and Y flashcards inside? This cannot be undone" + przyciski Cancel/Delete

Walidacja nazwy: max 25 znaków, dozwolone: litery, cyfry, spacje, myślniki, podkreślenia

6. Sesja nauki (Study Mode)
   Inicjacja: Przycisk "Study Now" przy każdym folderze

UI: Jedna fiszka fullscreen na środku ekranu

Flow:

Pokazanie tylko front fiszki

Użytkownik myśli o odpowiedzi

Klika "Show Answer"

Widzi back fiszki

Ocenia się: "Got it wrong" lub "Got it right"

Animacja feedback (500ms): zielony checkmark + fade (right) lub czerwony X + shake (wrong)

Automatyczne przejście do następnej fiszki

Progress tracking: Progress bar u góry "12/20 cards"

Statystyki: Inkrementacja review_count (zawsze) i correct_count (tylko przy "right")

Limit: 20 fiszek na sesję

Algorytm wyboru: Losowy wybór spośród najstarszych niepowtarzanych (sortowanie po last_reviewed_at ASC)

Zakończenie: Ekran podsumowania z statystykami (Total: 20, Correct: 16, Wrong: 4) + przyciski "Study Again" i "Back to Dashboard"

7. System kont użytkowników
   Rejestracja: Email + hasło (min 8 znaków)

Walidacja: Inline validation z regex dla email, sprawdzanie długości hasła

Logowanie: Email + hasło → zwraca JWT token

JWT: Access token ważny 24 godziny, bez refresh tokens

Bezpieczeństwo: bcrypt do hashowania haseł, JWT token w localStorage na frontendzie

Autoryzacja: Wszystkie endpoints chronione JWT oprócz /register i /login

8. Dashboard
   Empty state: Ikona + tekst "No folders yet" + przycisk "+ Generate Flashcards with AI"

Widok z folderami:

Przycisk "+ New Flashcards" na górze

Grid/lista folderów

Każdy folder: nazwa, ilość fiszek, button "Study Now"

Kluczowe historie użytkownika
US1: Generowanie fiszek przez AI
Jako użytkownik uczący się angielskiego
Chcę wkleić angielski tekst i automatycznie otrzymać fiszki z tłumaczeniami
Aby zaoszczędzić czas na manualnym tworzeniu fiszek

Acceptance Criteria:

Mogę wkleić do 5000 znaków tekstu w języku angielskim

Widzę licznik pozostałych znaków

Po kliknięciu "Generate" widzę loading spinner z komunikatem

Otrzymuję listę do 30 fiszek do przeglądu

AI sugeruje nazwę folderu na podstawie treści

Mogę zaakceptować, edytować lub odrzucić każdą fiszkę

Widzę przycisk "Save X flashcards" gdzie X to liczba zaakceptowanych

US2: Akceptacja wygenerowanych fiszek
Jako użytkownik
Chcę przejrzeć i zaakceptować tylko te AI-wygenerowane fiszki, które mi pasują
Aby mieć kontrolę nad jakością moich materiałów do nauki

Acceptance Criteria:

Widzę listę wszystkich wygenerowanych fiszek (przód i tył)

Mogę kliknąć "Accept" aby zaakceptować fiszkę bez zmian

Mogę kliknąć "Edit" aby zmodyfikować treść przed akceptacją

Mogę kliknąć "Reject" aby usunąć fiszkę z listy

Widzę licznik zaakceptowanych fiszek

Mogę wybrać folder z dropdown lub utworzyć nowy

Po kliknięciu "Save" fiszki trafiają do bazy danych

US3: Manualne tworzenie fiszki
Jako użytkownik
Chcę stworzyć własną fiszkę manualnie
Aby dodać specyficzne słówka których AI nie wyłapało

Acceptance Criteria:

Mogę otworzyć formularz tworzenia fiszki

Wypełniam pole Front (max 200 znaków) i Back (max 500 znaków)

Widzę licznik znaków dla każdego pola

Wybieram folder z dropdown lub tworzę nowy

Przycisk Save jest disabled gdy pola są nieprawidłowe

Po zapisaniu fiszka pojawia się w wybranym folderze

US4: Edycja zapisanej fiszki
Jako użytkownik
Chcę edytować zapisane fiszki
Aby poprawić błędy lub zaktualizować treść

Acceptance Criteria:

Mogę kliknąć "Edit" przy dowolnej fiszce w liście

Otwarty modal pokazuje obecną treść front i back

Mogę zmienić treść z zachowaniem limitów znaków

Mogę zmienić folder przypisania

Po kliknięciu "Save changes" zmiany są zapisywane

Mogę kliknąć "Cancel" aby anulować

US5: Sesja nauki z fiszkami
Jako użytkownik
Chcę ćwiczyć z moimi fiszkami w trybie nauki
Aby utrwalić wiedzę poprzez aktywne przypominanie

Acceptance Criteria:

Klikam "Study Now" przy wybranym folderze

Widzę pierwszą fiszkę (tylko przód) na pełnym ekranie

Myślę o odpowiedzi i klikam "Show Answer"

Widzę tył fiszki z tłumaczeniem

Oceniam się: "Got it wrong" lub "Got it right"

Widzę animację feedback (zielony checkmark lub czerwony X)

Po 500ms automatycznie ładuje się następna fiszka

Widzę progress "12/20 cards" u góry

Po 20 fiszkach widzę ekran podsumowania ze statystykami

Mogę kliknąć "Study Again" lub "Back to Dashboard"

US6: Organizacja w foldery
Jako użytkownik
Chcę organizować fiszki w foldery tematyczne
Aby łatwiej zarządzać różnymi obszarami nauki

Acceptance Criteria:

Mogę utworzyć nowy folder podczas zapisywania fiszek

Widzę wszystkie moje foldery na dashboardzie

Dla każdego folderu widzę nazwę i ilość fiszek

Mogę zmienić nazwę folderu (max 25 znaków)

Mogę usunąć folder (z ostrzeżeniem o usunięciu fiszek)

Usunięcie folderu kasuje wszystkie jego fiszki (CASCADE)

US7: Rejestracja i logowanie
Jako nowy użytkownik
Chcę założyć konto
Aby przechowywać moje fiszki w chmurze

Acceptance Criteria:

Podaję email i hasło (min 8 znaków)

System waliduje format email (regex)

Widzę błędy walidacji inline pod polami

Po udanej rejestracji jestem automatycznie zalogowany

Otrzymuję JWT token ważny 24 godziny

Token jest używany do autoryzacji wszystkich requestów

Kryteria sukcesu i metryki
Kryterium 1: Akceptacja AI-generowanych fiszek
Cel: 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika

Sposób mierzenia:

Event tracking: ai_flashcard_generated, ai_flashcard_accepted, ai_flashcard_rejected

Kalkulacja: accepted / (accepted + rejected) \* 100

Agregacja co tydzień/miesiąc

Dashboard w analytics (Mixpanel/Posthog)

Uwaga: Edytowane fiszki liczą się jako zaakceptowane

Kryterium 2: Wykorzystanie AI w tworzeniu fiszek
Cel: Użytkownicy tworzą 75% fiszek z wykorzystaniem AI (nie manualnie)

Sposób mierzenia:

Kolumna source w tabeli flashcards: 'ai_generated' lub 'manual'

Query: COUNT(_) WHERE source='ai_generated' / COUNT(_) \* 100

Per użytkownik i globalnie

Tracking w analytics

Dodatkowe metryki sukcesu (nice to have):
User retention: % użytkowników wracających po 7/30 dniach

Session completion rate: % rozpoczętych sesji nauki które kończą się na ekranie podsumowania

Average session length: średni czas trwania sesji nauki

Flashcards per user: średnia liczba fiszek stworzonych przez użytkownika

Study frequency: jak często użytkownicy wracają do nauki

Architektura techniczna
Backend (FastAPI)
Framework: FastAPI z Python 3.10+

ORM: SQLAlchemy z asyncpg

Database: PostgreSQL (Neon.tech w production)

Authentication: JWT tokens, bcrypt do hashowania haseł

Connection pooling: 4-10 connections w poolingu

CORS: Whitelist frontendowych domen

External API: OpenAI GPT-4.1 API

Environment variables: os.getenv() dla secrets

Główne endpoints:

POST /register - rejestracja użytkownika

POST /login - logowanie, zwraca JWT

POST /generate-flashcards - generowanie fiszek przez AI (protected)

GET /flashcards - lista fiszek użytkownika (protected)

POST /flashcards - tworzenie fiszki (protected)

PUT /flashcards/{id} - edycja fiszki (protected)

DELETE /flashcards/{id} - usunięcie fiszki (protected)

GET /folders - lista folderów (protected)

POST /folders - tworzenie folderu (protected)

PUT /folders/{id} - edycja folderu (protected)

DELETE /folders/{id} - usunięcie folderu z CASCADE (protected)

POST /study-session - rozpoczęcie sesji nauki (protected)

PUT /flashcards/{id}/review - aktualizacja statystyk po review (protected)

Frontend (React)
Framework: React 18+ z JavaScript (nie TypeScript w MVP)

State management: React hooks (useState, useEffect, useContext)

Routing: React Router

HTTP client: Axios lub Fetch API

Styling: CSS/SCSS lub Tailwind CSS

Folder structure: Feature-based (components/, hooks/, services/, utils/)

Główne komponenty:

Auth (Register, Login)

Dashboard (FolderList, EmptyState)

FlashcardGenerator (TextInput, FlashcardPreview, AcceptanceFlow)

FlashcardList (FlashcardItem, EditModal)

StudySession (FlashcardCard, ProgressBar, SummaryScreen)

FolderManager (CreateFolder, EditFolder, DeleteModal)

Database Schema
sql
CREATE TABLE users (
id SERIAL PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
hashed_password VARCHAR(255) NOT NULL,
reset_code VARCHAR(255),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE folders (
id SERIAL PRIMARY KEY,
name VARCHAR(25) NOT NULL,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE flashcards (
id SERIAL PRIMARY KEY,
front VARCHAR(200) NOT NULL,
back VARCHAR(500) NOT NULL,
folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
source VARCHAR(20) DEFAULT 'manual', -- 'ai_generated' or 'manual'
created_at TIMESTAMP DEFAULT NOW(),
last_reviewed_at TIMESTAMP,
review_count INTEGER DEFAULT 0,
correct_count INTEGER DEFAULT 0
);

CREATE INDEX idx_flashcards_folder ON flashcards(folder_id);
CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_last_reviewed ON flashcards(last_reviewed_at);
Deployment
Frontend: Vercel lub Netlify (darmowy tier)

Backend: Railway.app lub Render (darmowy tier)

Database: Neon.tech (darmowa baza serverless PostgreSQL)

CI/CD: Git push → automatyczny deploy

Secrets management: Platform environment variables

Flow użytkownika - główne ścieżki
Ścieżka 1: Pierwsze użycie (Onboarding)
Użytkownik wchodzi na stronę

Klika "Register"

Podaje email + hasło

System waliduje i tworzy konto

Automatyczne przekierowanie do dashboardu

Empty state: "No folders yet. Create your first flashcards!"

Klika "+ Generate Flashcards with AI"

Wkleja angielski tekst (np. artykuł)

Klika "Generate"

Widzi loading spinner

Po 10-30s otrzymuje listę 25 fiszek + sugerowaną nazwę folderu "Technology Vocabulary"

Przegląda fiszki, akceptuje większość, edytuje 2-3, odrzuca 5

Klika "Save 20 flashcards to folder"

Fiszki zapisane, powrót do dashboardu

Widzi folder "Technology Vocabulary (20 flashcards)"

Klika "Study Now"

Przechodzi sesję nauki z 20 fiszkami

Widzi ekran podsumowania: "Correct: 14, Wrong: 6"

Klika "Back to Dashboard"

Ścieżka 2: Powracający użytkownik
Logowanie email + hasło

Dashboard z listą folderów

Widzi "Technology Vocabulary (20 flashcards)" + "Business English (15 flashcards)"

Klika "Study Now" przy "Technology Vocabulary"

Sesja nauki z 20 losowymi fiszkami z tego folderu

Po sesji: ekran podsumowania

Klika "Back to Dashboard"

Decyduje się dodać więcej fiszek

Klika "+ New Flashcards"

Wkleja nowy tekst z zakresu technologii

Generuje fiszki, akceptuje je

W dropdownie wybiera istniejący folder "Technology Vocabulary"

Klika "Save 18 flashcards"

Folder teraz ma 38 fiszek

Ścieżka 3: Manualne tworzenie i edycja
Użytkownik w widoku folderu "Business English"

Widzi listę 15 fiszek

Najechanie myszką na fiszkę → tooltip z 50 znakami tłumaczenia

Kliknięcie → rozwinięcie pełnej treści

Zauważa błąd w jednej fiszce

Klika "Edit"

Modal z formularzem, poprawia tłumaczenie

Klika "Save changes"

Fiszka zaktualizowana

Decyduje dodać własną fiszkę

Otwiera formularz manualnego tworzenia

Front: "close the deal", Back: "sfinalizować transakcję"

Wybiera folder "Business English" z dropdown

Klika "Save"

Nowa fiszka pojawia się na liście

Ograniczenia i założenia MVP
Co NIE wchodzi w zakres MVP:
Zaawansowany algorytm spaced repetition (FSRS, SM-2) - tylko prosty losowy wybór najstarszych

Import plików (PDF, DOCX, itp.) - tylko copy-paste tekstu

Współdzielenie zestawów fiszek między użytkownikami

Integracje z innymi platformami edukacyjnymi

Aplikacje mobilne (tylko web)

Wielojęzyczność - tylko angielski→polski

Dark mode

Reset hasła funkcjonalny (tylko placeholder w bazie)

Keyboard shortcuts podczas nauki

TypeScript na frontendzie

Automated testing

Refresh tokens dla JWT

Zaawansowana analytics (tylko podstawowe event tracking)

Profile użytkownika z ustawieniami

Eksport fiszek do Anki/Quizlet

Obrazki w fiszkach

Audio pronunciation

Tryby nauki inne niż klasyczny flashcard (matching, multiple choice)

Założenia:
Użytkownicy mają dostęp do internetu i nowoczesnej przeglądarki

Tekst wejściowy jest w miarę poprawny angielski (nie sprawdzamy jakości)

Użytkownicy akceptują 24-godzinną sesję JWT (nie muszą logować się codziennie)

GPT-4.1 API jest dostępne i działa stabilnie

Koszt API (~$0.02-0.05 per generation) jest akceptowalny dla projektu nauki

Użytkownicy są polskojęzyczni i uczą się angielskiego

Pojedynczy użytkownik nie przekroczy rozsądnych limitów (np. 100 generowań dziennie)

Nierozwiązane kwestie wymagające dalszego wyjaśnienia

1. Szczegóły promptu dla GPT-4.1
   Problem: Nie określono dokładnej treści system prompt i user prompt dla API

Wymaga doprecyzowania:

Dokładna treść system prompt (rola AI, instrukcje)

Format user prompt z tekstem użytkownika

Czy uwzględniamy poziom zaawansowania (A1, B2, itp.)

Czy AI ma filtrować wulgaryzmy/nieodpowiednie treści

Jak obsługiwać tekst po polsku gdy oczekujemy angielskiego

Sugestia: Przygotować 2-3 wersje prompta i przetestować na różnych tekstach

2. Rate limiting i abuse prevention
   Problem: Brak określenia jak chronić się przed nadużyciami API

Wymaga doprecyzowania:

Czy wprowadzamy rate limit per user (np. 10 generowań/dzień)

Jak obsługujemy użytkowników próbujących spamować API

Czy potrzebny jest CAPTCHA przy rejestracji

Jak monitorować koszty API i reagować na wzrost

Sugestia: Zacząć od prostego rate limitingu (10 requestów/10 minut per IP)

3. Handling długotrwałych operacji AI
   Problem: Generowanie może trwać 10-30 sekund - czy to wystarczająco dobre UX

Wymaga doprecyzowania:

Czy rozważamy async processing z webhook/polling

Czy pokazujemy postęp (jeśli API GPT-4.1 wspiera streaming)

Timeout po jakiej liczbie sekund

Retry policy gdy timeout

Sugestia: MVP z prostym spinnerem + retry button, w v2 rozważyć async

4. Monetyzacja (przyszłość)
   Problem: Brak modelu biznesowego dla przyszłości projektu

Wymaga doprecyzowania:

Czy planowane są płatne plany w przyszłości

Jakie limity wprowadzić dla free tier (przygotowanie do monetyzacji)

Czy użytkownicy darmowi będą mieć ograniczenia (np. 100 fiszek max)

Sugestia: Dla projektu nauki nie ma to znaczenia, ale warto przemyśleć

5. Backup i eksport danych
   Problem: Użytkownicy mogą chcieć backup swoich fiszek

Wymaga doprecyzowania:

Czy dodać funkcję eksportu do CSV/JSON

GDPR compliance - jak użytkownicy mogą pobrać swoje dane

Czy pozwolić na import fiszek z pliku

Sugestia: Post-MVP feature, na razie nie implementować

6. Responsive design dla mobile
   Problem: Nie określono dokładnie jak aplikacja ma działać na mobile

Wymaga doprecyzowania:

Czy fullscreen flashcard działa dobrze na małym ekranie telefonu

Jak wyglądają tooltips na touch devices (brak hover)

Czy textarea do wklejania 5000 znaków jest użyteczne na mobile

Obsługa gestów (swipe) zamiast przycisków

Sugestia: Zaprojektować najpierw desktop, potem dostosować do mobile

7. Obsługa konfliktów przy edycji
   Problem: Co gdy użytkownik edytuje tę samą fiszkę w dwóch oknach przeglądarki

Wymaga doprecyzowania:

Czy ostatni zapis wygrywa (overwrite)

Czy pokazujemy warning o konflikcie

Optimistic updates vs pessimistic

Sugestia: MVP z prostym overwrite, conflict resolution w v2

8. Analytics i monitoring
   Problem: Brak szczegółów implementacji analytics

Wymaga doprecyzowania:

Która platforma analytics (Mixpanel, Posthog, Google Analytics)

Jakie dokładnie eventy trackować

Czy backend loguje do pliku/cloud logging (CloudWatch, LogRocket)

Error tracking (Sentry?)

Sugestia: Mixpanel free tier dla MVP, prosty event tracking

9. Email notifications (przyszłość)
   Problem: Brak strategii utrzymania zaangażowania użytkowników

Wymaga doprecyzowania:

Czy planowane są email remindery do nauki

Daily/weekly digest z statystykami

Jak zbierać zgodę na emaile (GDPR)

Sugestia: Post-MVP feature

10. Testowanie i QA
    Problem: Brak określenia procesu testowania przed wdrożeniem

Wymaga doprecyzowania:

Kto testuje aplikację (tylko developer czy również użytkownicy testowi)

Checklist funkcjonalności do przetestowania

Jak zbierać feedback podczas MVP

Beta testing z prawdziwymi użytkownikami?

Sugestia: Manualne testowanie przez developera + 2-3 znajomych jako beta testerzy

11. Performance i skalowanie
    Problem: Nie określono wymagań wydajnościowych

Wymaga doprecyzowania:

Maksymalny czas odpowiedzi API (oprócz AI generation)

Jak obsłużyć 100 równoczesnych użytkowników

Database indexing strategy

Caching strategy (Redis?)

Sugestia: Nie optimizować przedwcześnie, monitorować w production

12. Wielojęzyczność UI (przyszłość)
    Problem: UI jest po polsku czy po angielsku?

Wymaga doprecyzowania:

Język interfejsu użytkownika

Czy planowana jest internationalization (i18n) w przyszłości

Jak obsługiwać użytkowników z innych krajów

Sugestia: UI po polsku dla MVP (grupa docelowa polskojęzyczna)
