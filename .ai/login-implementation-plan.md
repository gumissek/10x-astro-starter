📋 Plan Implementacji: Integracja Logowania z Supabase Auth
Podsumowanie Obecnego Stanu
✅ Istniejący supabase.client.ts - używa createClient (client-side)
✅ Istniejący index.ts - obecnie tylko przekazuje supabase client
✅ Typy w database.types.ts - zawierają user_id w tabelach
❌ Brak funkcji createSupabaseServerInstance
❌ Brak middleware autoryzacji
❌ Brak endpointów API auth
❌ Brak typów dla Astro.locals.user

🎯 Etapy Implementacji
ETAP 1: Instalacja Zależności
Upewnij się, że masz zainstalowane pakiety:


npm install @supabase/ssr @supabase/supabase-js
ETAP 2: Rozszerzenie Supabase Client (Server-Side)
Plik: supabase.client.ts

Akcje:

✏️ Dodaj import @supabase/ssr
✏️ Dodaj funkcję createSupabaseServerInstance zgodnie z wzorcem supabase-auth.mdc
✏️ Zachowaj istniejący supabaseClient dla kompatybilności wstecznej
Kluczowe punkty:

Użyj createServerClient z @supabase/ssr
Implementacja getAll/setAll dla cookies
Parser dla header'a Cookie
Opcje cookies: secure: true, httpOnly: true, sameSite: 'lax'
ETAP 3: Aktualizacja Typów TypeScript
Plik: env.d.ts

Akcje:

✏️ Dodaj interfejs User w App.Locals
✏️ Rozszerz Locals o pole user
Struktura user:


interface Locals {  supabase: SupabaseClient<Database>;  user?: {    id: string;    email: string;  };}
ETAP 4: Implementacja Middleware Autoryzacji
Plik: index.ts

Akcje:

✏️ Zaimportuj createSupabaseServerInstance
✏️ Zdefiniuj PUBLIC_PATHS array z ścieżkami: /login, /register, /forgot-password, /api/auth/*
✏️ Implementuj logikę:
Utworzenie server-side supabase client
Sprawdzenie sesji await supabase.auth.getUser()
Przekierowanie niezalogowanych z chronionych ścieżek → /login
Przekierowanie zalogowanych z publicznych ścieżek → /dashboard
Zapisanie user w context.locals
Protected Routes: /dashboard, /folders/*, /study/*, /generate, /manual-save, users

ETAP 5: Utworzenie API Endpointów Auth
5.1. Endpoint Logowania
Plik: src/pages/api/auth/login.ts

Akcje:

🆕 Utwórz nowy plik
✏️ Export funkcji POST
✏️ Implementacja:
Walidacja email i password (zod)
Utworzenie server-side supabase client
Wywołanie supabase.auth.signInWithPassword()
Zwrot odpowiedzi JSON z danymi użytkownika lub błędem
Status 200 dla sukcesu, 400/401 dla błędów
Szczegóły walidacji:

Email: regex format
Password: niepuste pole
Użyj biblioteki zod dla walidacji
5.2. Endpoint Wylogowania
Plik: src/pages/api/auth/logout.ts

Akcje:

🆕 Utwórz nowy plik
✏️ Export funkcji POST
✏️ Implementacja:
Utworzenie server-side supabase client
Wywołanie supabase.auth.signOut()
Wyczyszczenie cookies
Zwrot pustej odpowiedzi (204) lub JSON z sukcesem
ETAP 6: Aktualizacja LoginForm Component
Plik: LoginForm.tsx

Akcje:

✏️ Zamień TODO na rzeczywistą implementację
✏️ Dodaj fetch do /api/auth/login
✏️ Obsługa odpowiedzi:
Sukces (200): window.location.href = '/dashboard'
Błąd (4xx): Wyświetl komunikat w validationErrors.general
✏️ Obsługa błędów sieciowych
Przykładowa implementacja fetch:


const response = await fetch('/api/auth/login', {  method: 'POST',  headers: { 'Content-Type': 'application/json' },  body: JSON.stringify({    email: formData.email.trim(),    password: formData.password,  }),});const data = await response.json();if (!response.ok) {  throw new Error(data.error || 'Nieprawidłowy email lub hasło');}window.location.href = '/dashboard';
ETAP 7: Aktualizacja Strony Login
Plik: login.astro

Akcje:

✏️ Dodaj export const prerender = false; (SSR)
✏️ Sprawdź czy użytkownik jest już zalogowany (Astro.locals.user)
✏️ Jeśli zalogowany → przekieruj do /dashboard
ETAP 8: Ochrona Dashboard
Plik: dashboard.astro

Akcje:

✏️ Sprawdź czy strona ma export const prerender = false;
✏️ Pobierz user z Astro.locals
✏️ Jeśli brak użytkownika → middleware przekieruje (ale jako best practice dodaj sprawdzenie)
ETAP 9: Dodanie Przycisku Wylogowania
Plik: AuthLayout.astro

Akcje:

✏️ Dodaj przycisk/link "Wyloguj" w nawigacji
✏️ Utwórz handler który:
Wysyła POST do /api/auth/logout
Po sukcesie przekierowuje na /login
Opcja 1 - Inline Script:


<button id="logout-btn">Wyloguj</button><script>  document.getElementById('logout-btn')?.addEventListener('click', async () => {    await fetch('/api/auth/logout', { method: 'POST' });    window.location.href = '/login';  });</script>
Opcja 2 - Formularz:


<form action="/api/auth/logout" method="POST">  <button type="submit">Wyloguj</button></form>
✅ Checklist Implementacji
Pliki do Modyfikacji:
 supabase.client.ts - dodaj createSupabaseServerInstance
 env.d.ts - dodaj typ user w Locals
 index.ts - implementuj autoryzację
 LoginForm.tsx - zamień TODO na fetch
 login.astro - dodaj SSR i sprawdzenie sesji
 AuthLayout.astro - dodaj przycisk wylogowania
Pliki do Utworzenia:
 src/pages/api/auth/login.ts - endpoint logowania
 src/pages/api/auth/logout.ts - endpoint wylogowania
Testowanie:
 Użytkownik niezalogowany nie ma dostępu do /dashboard
 Przekierowanie z /login → /dashboard dla zalogowanych
 Formularz logowania działa poprawnie (walidacja)
 Błędne dane logowania wyświetlają komunikat
 Wylogowanie czyści sesję i przekierowuje
 Cookies są ustawiane z odpowiednimi flagami
