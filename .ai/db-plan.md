# Schemat bazy danych

## 1. Tabele

### Tabela: auth.users
*Informacja: Tabela zarządzana przez Supabase Auth, przechowująca dane użytkowników.*

- **id**: UUID, PRIMARY KEY  
- **email**: VARCHAR, NOT NULL, UNIQUE  
- **password_hash**: TEXT, (przechowywana wartość hash hasła; szczegóły implementacji zarządzane przez Supabase), NOT NULL 
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()  
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()  
- *(Możliwe dodatkowe kolumny, takie jak confirmed_at, last_sign_in_at, user_metadata, itd., są dodawane i zarządzane przez Supabase.)*

---

### Tabela: folders
- **id**: UUID, PRIMARY KEY  
- **user_id**: UUID, NOT NULL, REFERENCES auth.users(id)  
- **name**: VARCHAR, NOT NULL  
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()  
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()  

**Ograniczenia:**
- Unikalność pary (user_id, name)

---

### Tabela: flashcards
- **id**: UUID, PRIMARY KEY  
- **user_id**: UUID, NOT NULL, REFERENCES auth.users(id)  
- **folder_id**: UUID, NOT NULL, REFERENCES folders(id) ON DELETE CASCADE  
- **front**: VARCHAR(200) NOT NULL  
- **back**: VARCHAR(500) NOT NULL  
- **generation_source**: TEXT NOT NULL, CHECK (generation_source IN ('ai', 'manual'))  
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()  
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

---

## 2. Relacje między tabelami

- **auth.users : folders** – relacja 1:n  
  Każdy użytkownik może posiadać wiele folderów.

- **auth.users : flashcards** – relacja 1:n  
  Każdy użytkownik może posiadać wiele fiszek.

- **folders : flash
cards** – relacja 1:n  
  Każdy folder zawiera wiele fiszek. Usunięcie folderu powoduje kaskadowe usunięcie powiązanych fiszek.

---

## 3. Indeksy

- **folders**: indeks na kolumnie `user_id`
- **flashcards**: indeksy na kolumnach `user_id` oraz `folder_id`

---

## 4. Zasady RLS (Row Level Security)

Dla tabel **folders** i **flashcards** należy włączyć RLS. Przykładowe zasady:

- **Tabela: folders**
  - Operacje SELECT, INSERT, UPDATE i DELETE dozwolone, gdy `folders.user_id = auth.uid()`

- **Tabela: flashcards**
  - Operacje SELECT, INSERT, UPDATE i DELETE dozwolone, gdy `flashcards.user_id = auth.uid()`

*Implementacja zasad RLS odbywać się będzie w migracjach, aby zagwarantować, że użytkownicy mają dostęp tylko do własnych danych.*

---

## 5. Dodatkowe uwagi
- Użycie UUID jako kluczy głównych zapewnia unikalność i skalowalność.
- Odpowiednie indeksy na kolumnach związanych z relacjami (user_id, folder_id) optymalizują wydajność zapytań.
- Polityki RLS gwarantują bezpieczeństwo danych w środowisku wieloużytkownikowym.