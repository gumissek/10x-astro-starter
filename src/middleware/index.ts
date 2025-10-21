import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client";

// Ścieżki publiczne - dostępne dla wszystkich użytkowników
const PUBLIC_PATHS = [
  // Strony autoryzacji
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/password-reset",
  // API endpointy autoryzacji
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
];

// Ścieżki tylko dla niezalogowanych użytkowników
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Utwórz server-side Supabase client
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Zapisz supabase client w locals dla kompatybilności
  locals.supabase = supabase;

  // Sprawdź czy ścieżka jest publiczna
  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(path));

  // Pobierz dane użytkownika z sesji
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jeśli użytkownik jest zalogowany, zapisz dane w locals
  if (user) {
    locals.user = {
      email: user.email!,
      id: user.id,
    };

    // Przekieruj zalogowanych użytkowników ze stron tylko dla gości
    if (GUEST_ONLY_PATHS.includes(url.pathname)) {
      return redirect("/dashboard");
    }
  } else if (!isPublicPath) {
    // Przekieruj niezalogowanych użytkowników z chronionych stron
    return redirect("/login");
  }

  return next();
});
