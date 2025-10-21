import type { APIRoute } from "astro";
import { z } from "zod";
import type { UpdateFlashcardCommand } from "../../../types";
import { FlashcardGenerationService } from "../../../lib/services/flashcardService";

export const prerender = false;

// Zod schema for UUID validation
const FlashcardIdSchema = z.string().uuid("Flashcard ID must be a valid UUID");

// Zod schema for PUT request validation
const UpdateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text cannot be empty").max(200, "Front text cannot exceed 200 characters").trim(),
  back: z.string().min(1, "Back text cannot be empty").max(500, "Back text cannot exceed 500 characters").trim(),
  folder_id: z.string().uuid("Folder ID must be a valid UUID").optional(),
  generation_source: z.enum(["manual", "ai"], {
    errorMap: () => ({ message: "Generation source must be either 'manual' or 'ai'" }),
  }),
});

/**
 * GET endpoint /api/flashcards/{flashcardId} - get flashcard details
 * Returns detailed information about a specific flashcard by ID
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Extract and validate flashcard ID from URL parameters
    const { flashcardId } = params;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing parameter",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format
    let validatedFlashcardId: string;
    try {
      validatedFlashcardId = FlashcardIdSchema.parse(flashcardId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid parameter",
            message: "Flashcard ID must be a valid UUID",
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
          error: "Validation error",
          message: "Failed to validate flashcard ID",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Add authentication and authorization logic
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

    // Get Supabase client from locals (with user session)
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database connection unavailable",
          message: "Internal server configuration error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize the flashcard service
    const flashcardService = new FlashcardGenerationService(supabase);

    // Get the flashcard using the service
    const flashcardData = await flashcardService.getFlashcardById(validatedFlashcardId, userId);

    // Handle not found case
    if (!flashcardData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Not found",
          message: "Flashcard not found or access denied",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: flashcardData,
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

/**
 * PUT endpoint /api/flashcards/{flashcardId} - update an existing flashcard
 * Updates front, back, generation_source, and optionally folder_id of a flashcard
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Extract and validate flashcard ID from URL parameters
    const { flashcardId } = params;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing parameter",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format for flashcard ID
    let validatedFlashcardId: string;
    try {
      validatedFlashcardId = FlashcardIdSchema.parse(flashcardId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid parameter",
            message: "Flashcard ID must be a valid UUID",
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
          error: "Validation error",
          message: "Failed to validate flashcard ID",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse and validate request body
    let requestData: UpdateFlashcardCommand;

    try {
      const body = await request.json();
      requestData = UpdateFlashcardSchema.parse(body);
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

    // TODO: Add authentication and authorization logic
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

    // Get Supabase client from locals (with user session)
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database connection unavailable",
          message: "Internal server configuration error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize the flashcard service
    const flashcardService = new FlashcardGenerationService(supabase);

    // Update the flashcard using the service
    const updatedFlashcard = await flashcardService.updateFlashcard(validatedFlashcardId, requestData, userId);

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedFlashcard,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes("Flashcard not found")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Not found",
            message: "Flashcard not found or access denied",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

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

      if (error.message.includes("access denied") || error.message.includes("unauthorized")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized",
            message: "You don't have permission to update this flashcard",
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

/**
 * DELETE endpoint /api/flashcards/{flashcardId} - delete a flashcard
 * Removes a specific flashcard by ID after verifying ownership
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Extract and validate flashcard ID from URL parameters
    const { flashcardId } = params;

    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing parameter",
          message: "Flashcard ID is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format
    let validatedFlashcardId: string;
    try {
      validatedFlashcardId = FlashcardIdSchema.parse(flashcardId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid parameter",
            message: "Flashcard ID must be a valid UUID",
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
          error: "Validation error",
          message: "Failed to validate flashcard ID",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Add authentication and authorization logic
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

    // Get Supabase client from locals (with user session)
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database connection unavailable",
          message: "Internal server configuration error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize the flashcard service
    const flashcardService = new FlashcardGenerationService(supabase);

    // Delete the flashcard using the service
    await flashcardService.deleteFlashcard(validatedFlashcardId, userId);

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Flashcard deleted successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes("Flashcard not found") || error.message.includes("access denied")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Not found",
            message: "Flashcard not found or access denied",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (error.message.includes("unauthorized")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Unauthorized",
            message: "You don't have permission to delete this flashcard",
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
