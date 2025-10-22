import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "../db/database.types";

// Client-side Supabase client factory (używaj w komponentach React)
// Dla SSR/SSG używaj createSupabaseServerInstance
export const createSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createClient<Database>(supabaseUrl.trim(), supabaseAnonKey.trim());
};

// Type helper - używaj tego typu dla klientów Supabase
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

// Cookie options dla server-side authentication
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

// Parser dla Cookie header
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server-side Supabase client z obsługą cookies
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  env: {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  };
}) => {
  const supabaseUrl = context.env.SUPABASE_URL?.trim();
  const supabaseKey = context.env.SUPABASE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be defined in environment variables");
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
