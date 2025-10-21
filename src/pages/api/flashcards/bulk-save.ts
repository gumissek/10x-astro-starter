import type { APIRoute } from "astro";
import { z } from "zod";
import type { BulkSaveFlashcardsCommand } from "../../../types";
import { FlashcardGenerationService } from "../../../lib/services/flashcardService";

export const prerender = false;

// Zod schema for individual flashcard validation in bulk save
const FlashcardItemSchema = z.object({
  front: z.string().min(1, "Front text cannot be empty").max(200, "Front text cannot exceed 200 characters").trim(),
  back: z.string().min(1, "Back text cannot be empty").max(500, "Back text cannot exceed 500 characters").trim(),
  generation_source: z.literal("ai", {
    errorMap: () => ({ message: "Generation source must be 'ai' for bulk save operations" }),
  }),
});

// Zod schema for POST request validation - bulk save
const BulkSaveFlashcardsSchema = z.object({
  folder_id: z.string().uuid("Folder ID must be a valid UUID"),
  flashcards: z
    .array(FlashcardItemSchema)
    .min(1, "At least one flashcard must be provided")
    .max(50, "Cannot save more than 50 flashcards at once"), // Performance limit
});

// Response type for bulk save operation
//@typescript-eslint/no-unused-vars
interface BulkSaveResponse {
  success: boolean;
  message: string;
  saved_count: number;
  flashcard_ids: string[];
}

/**
 * POST endpoint /api/flashcards/bulk-save - save multiple flashcards to a folder
 * Used primarily for saving AI-generated flashcards that user has accepted
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error",
          message: "Database connection not available",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse and validate request body
    let requestData: BulkSaveFlashcardsCommand;

    try {
      const body = await request.json();
      requestData = BulkSaveFlashcardsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Validation failed",
            message: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
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

    // Get user ID from session (set by middleware)
    const userId = locals.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User must be authenticated",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify that the folder exists and belongs to the user (authorization check)
    const { data: folderData, error: folderError } = await supabase
      .from("folders")
      .select("id, user_id, name")
      .eq("id", requestData.folder_id)
      .eq("user_id", userId)
      .single();

    if (folderError) {
      if (folderError.code === "PGRST116") {
        // PostgREST "no rows returned" error
        return new Response(
          JSON.stringify({
            success: false,
            error: "Not found",
            message: "Folder not found or access denied",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal server error",
          message: "Failed to verify folder access",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!folderData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Not found",
          message: "Folder not found or access denied",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize the flashcard service with the Supabase client from context
    const flashcardService = new FlashcardGenerationService(supabase);

    // Delegate bulk save operation to service layer
    const result = await flashcardService.bulkSaveFlashcards(requestData, userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        saved_count: result.saved_count,
        flashcard_ids: result.flashcard_ids,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes("Folder not found")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Not found",
            message: "Folder not found or access denied",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (error.message.includes("access denied")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized",
            message: "Access denied to the specified folder",
          }),
          {
            status: 401,
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
