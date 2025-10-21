import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Schema walidacji dla żądania logowania
const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy format adresu email" }),
  password: z.string().min(1, { message: "Hasło jest wymagane" }),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parsuj i waliduj dane wejściowe
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: validationResult.error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email, password } = validationResult.data;

    // Utwórz server-side Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Zaloguj użytkownika
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message === "Invalid login credentials" ? "Nieprawidłowy email lub hasło" : error.message,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Zwróć dane użytkownika
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas logowania",
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
