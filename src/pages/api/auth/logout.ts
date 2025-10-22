import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, locals }) => {
  try {
    // Pobierz zmienne środowiskowe z runtime (dla Cloudflare) lub z import.meta.env (dla lokalnego devu)
    const env = locals.runtime?.env || {
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_KEY: import.meta.env.SUPABASE_KEY,
    };

    // Utwórz server-side Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      env,
    });

    // Wyloguj użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas wylogowania",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
