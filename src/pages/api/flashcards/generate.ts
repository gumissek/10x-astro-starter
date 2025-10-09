import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDTO } from "../../../types";
import { FlashcardGenerationService } from "../../../lib/services/flashcardService";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for input validation
const GenerateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1, "Text cannot be empty")
    .max(5000, "Text cannot exceed 5000 characters")
    .trim(),
});

// POST endpoint /api/flashcards/generate - generate flashcards from text input
export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    let requestData: GenerateFlashcardsCommand;
    
    try {
      const body = await request.json();
      requestData = GenerateFlashcardsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Validation failed",
            message: error.errors.map(e => e.message).join(", "),
            details: error.errors,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request body",
          message: "Failed to parse JSON or invalid data format",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize the flashcard generation service with supabase client
    const flashcardService = new FlashcardGenerationService(supabaseClient);
    
    // Generate flashcards using the service
    const result = await flashcardService.generateFlashcards(requestData.text);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );

  } catch (error) {
    console.error("Error in POST /api/flashcards/generate:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
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