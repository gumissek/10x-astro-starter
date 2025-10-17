import type { APIRoute } from "astro";
import { z } from "zod";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDTO } from "../../../types";
import { FlashcardGenerationService } from "../../../lib/services/flashcardService";
import { OpenRouterService } from "../../../lib/services/openRouterService";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

// Zod schema for input validation
const GenerateFlashcardsSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Text cannot be empty")
    .max(5000, "Text cannot exceed 5000 characters")
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

    // Initialize the OpenRouter service for AI generation
    const openRouterService = new OpenRouterService();
    
    // Model name from environment variables
    const modelName = import.meta.env.AI_MODELNAME || "openai/gpt-4o-mini";
    
    // Generate flashcards using OpenRouter AI
    const aiResult = await openRouterService.generateFlashcards(requestData.text, modelName);
    
    // Transform AI result to match expected response format
    const result: GenerateFlashcardsResponseDTO = {
      suggested_folder_name: aiResult.title,
      flashcards_proposals: aiResult.flashcards.map(flashcard => ({
        front: flashcard.question,
        back: flashcard.answer,
        generation_source: 'ai' as const
      }))
    };

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

    // Obsługa specyficznych błędów z OpenRouter Service
    if (error instanceof Error) {
      // Błędy konfiguracji
      if (error.message.includes('OPENROUTER_API_KEY')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Configuration error",
            message: "Service is not properly configured. Please contact administrator.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      // Błędy walidacji parametrów
      if (error.message.includes('cannot be empty')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Validation error",
            message: error.message,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

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