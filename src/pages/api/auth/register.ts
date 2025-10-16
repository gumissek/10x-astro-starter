import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

// Schema walidacji dla żądania rejestracji
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email jest wymagany" })
      .email({ message: "Wprowadź poprawny adres email" }),
    password: z
      .string()
      .min(8, { message: "Hasło musi mieć minimum 8 znaków" })
      .regex(/[A-Z]/, { message: "Hasło musi zawierać co najmniej jedną wielką literę" })
      .regex(/[0-9]/, { message: "Hasło musi zawierać co najmniej jedną cyfrę" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Hasło musi zawierać co najmniej jeden znak specjalny",
      }),
    confirmPassword: z.string().min(1, { message: "Potwierdzenie hasła jest wymagane" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parsuj i waliduj dane wejściowe
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      // Zwróć pierwszy błąd walidacji
      return new Response(
        JSON.stringify({
          error: validationResult.error.errors[0].message,
          field: validationResult.error.errors[0].path[0],
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { email, password } = validationResult.data;

    // Utwórz server-side Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Zarejestruj użytkownika
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Email confirmation wyłączone - użytkownik może od razu korzystać z aplikacji
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      // Obsługa specyficznych błędów Supabase
      let errorMessage = "Wystąpił błąd podczas rejestracji";

      if (error.message.includes("already registered")) {
        errorMessage = "Ten adres email jest już zarejestrowany";
      } else if (error.message.includes("Password")) {
        errorMessage = "Hasło nie spełnia wymagań bezpieczeństwa";
      } else if (error.message.includes("Email")) {
        errorMessage = "Nieprawidłowy adres email";
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Sprawdź czy użytkownik został utworzony i automatycznie zalogowany
    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({
          error: "Nie udało się utworzyć konta. Spróbuj ponownie.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Zwróć dane użytkownika i sukces
    return new Response(
      JSON.stringify({
        success: true,
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
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
