Główne wymagania dotyczące schematu bazy danych: Schemat będzie wspierał uwierzytelnianie użytkowników, tworzenie i organizację fiszek w folderach oraz rozróżnianie fiszek tworzonych manualnie od generowanych przez AI. Baza danych musi zapewniać integralność danych oraz bezpieczeństwo na poziomie wiersza.

Kluczowe encje i ich relacje:

users: Tabela zarządzana przez Supabase Auth (auth.users), przechowująca dane użytkowników. Będzie źródłem user_id (typu UUID).
folders: Tabela przechowująca foldery użytkowników.
id (PK, UUID)
user_id (FK do auth.users.id, UUID)
name (VARCHAR)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
Relacja: Jeden użytkownik może mieć wiele folderów. Para (user_id, name) musi być unikalna.
flashcards: Tabela przechowująca fiszki.
id (PK, UUID)
user_id (FK do auth.users.id, UUID)
folder_id (FK do folders.id, UUID, ON DELETE CASCADE)
front (VARCHAR(200), NOT NULL)
back (VARCHAR(500), NOT NULL)
generation_source (TEXT, CHECK IN ('ai', 'manual'))
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
Relacja: Jedna fiszka należy do jednego folderu i jednego użytkownika. Usunięcie folderu powoduje usunięcie jego fiszek.
Bezpieczeństwo i skalowalność:

Bezpieczeństwo: Dla tabel folders i flashcards zostanie włączone RLS (Row Level Security). Zostaną zdefiniowane polityki dla operacji SELECT, INSERT, UPDATE, DELETE, które będą weryfikować, czy user_id w rekordzie jest zgodne z auth.uid() zalogowanego użytkownika.
Skalowalność/Wydajność: W celu optymalizacji zapytań zostaną utworzone indeksy na kluczach obcych: folders(user_id), flashcards(user_id) oraz flashcards(folder_id).