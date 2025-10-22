# Wdrożenie na Cloudflare Pages

## Konfiguracja zmiennych środowiskowych

Aby aplikacja działała poprawnie na Cloudflare Pages, musisz skonfigurować następujące zmienne środowiskowe w panelu Cloudflare:

### Wymagane zmienne środowiskowe:

1. **SUPABASE_URL** - URL twojej instancji Supabase
   - Przykład: `https://twojprojekt.supabase.co`

2. **SUPABASE_KEY** - Klucz publiczny (anon key) Supabase
   - Znajdziesz go w: Supabase Dashboard → Settings → API → Project API keys → anon/public

3. **OPENROUTER_API_KEY** - Klucz API OpenRouter (do generowania fiszek AI)
   - Uzyskaj go na: https://openrouter.ai/

4. **AI_MODELNAME** - Nazwa modelu AI do użycia
   - Przykład: `openai/gpt-4o-mini`
   - Pełna lista modeli: https://openrouter.ai/models

### Jak dodać zmienne w Cloudflare Pages:

1. Zaloguj się do dashboardu Cloudflare
2. Przejdź do: **Pages** → wybierz swoją aplikację
3. Kliknij zakładkę **Settings**
4. Przewiń do sekcji **Environment variables**
5. Kliknij **Add variable** dla każdej zmiennej
6. Wprowadź nazwę i wartość zmiennej
7. Wybierz środowisko (Production, Preview, lub Both)
8. Kliknij **Save**

### Uwaga dot. środowiska:

- **Production** - tylko dla produkcyjnych deploymentów (branch main)
- **Preview** - dla wszystkich pull requestów i branch-y rozwojowych
- **Both** - dla obu środowisk

Zaleca się ustawienie wszystkich zmiennych dla **Both**, chyba że masz różne wartości dla środowiska deweloperskiego.

## Weryfikacja konfiguracji

Po wdrożeniu aplikacji, sprawdź logi w Cloudflare Pages:

1. Przejdź do: **Pages** → twoja aplikacja → **Deployments**
2. Kliknij najnowsze wdrożenie
3. Sprawdź zakładkę **Functions** lub **Logs**

Jeśli zobaczysz błąd typu "Cannot read properties of undefined (reading 'trim')", oznacza to, że zmienne środowiskowe nie są poprawnie skonfigurowane.

## Architektura rozwiązania

Aplikacja automatycznie wykrywa środowisko wykonania:

- **Cloudflare Workers/Pages**: używa `Astro.locals.runtime.env`
- **Lokalne środowisko deweloperskie**: używa `import.meta.env`

Nie musisz wprowadzać żadnych zmian w kodzie - działa to automatycznie!

## Testowanie lokalnie

Aby przetestować aplikację lokalnie przed wdrożeniem:

1. Utwórz plik `.env` w głównym katalogu projektu
2. Dodaj wszystkie wymagane zmienne:

```env
SUPABASE_URL=https://twojprojekt.supabase.co
SUPABASE_KEY=twoj-anon-key
OPENROUTER_API_KEY=twoj-openrouter-key
AI_MODELNAME=openai/gpt-4o-mini
```

3. Uruchom aplikację lokalnie:

```bash
npm run dev
```

## Rozwiązywanie problemów

### Błąd: "Cannot read properties of undefined (reading 'trim')"

**Przyczyna**: Brakujące zmienne środowiskowe w Cloudflare Pages

**Rozwiązanie**:
1. Sprawdź czy wszystkie zmienne są dodane w Cloudflare Pages
2. Upewnij się, że nazwy zmiennych są dokładnie takie same (wielkość liter ma znaczenie!)
3. Przebuduj deployment w Cloudflare

### Błąd: "OPENROUTER_API_KEY is not set"

**Przyczyna**: Brakujący klucz API OpenRouter

**Rozwiązanie**:
1. Dodaj zmienną `OPENROUTER_API_KEY` w Cloudflare Pages
2. Upewnij się, że klucz jest prawidłowy

### Błąd połączenia z Supabase

**Przyczyna**: Nieprawidłowy URL lub klucz Supabase

**Rozwiązanie**:
1. Sprawdź czy `SUPABASE_URL` i `SUPABASE_KEY` są poprawne
2. Upewnij się, że używasz **anon key**, nie service role key
3. Sprawdź czy w Supabase masz włączone odpowiednie ustawienia RLS (Row Level Security)

## Dodatkowe zasoby

- [Dokumentacja Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Astro na Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
