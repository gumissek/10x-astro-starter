import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateFlashcardCommand, FlashcardDTO } from "../../../types";
import { FlashcardGenerationService } from "../../../lib/services/flashcardService";

export const prerender = false;

// Zod schema for POST request validation
const CreateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text cannot be empty").max(200, "Front text cannot exceed 200 characters").trim(),
  back: z.string().min(1, "Back text cannot be empty").max(500, "Back text cannot exceed 500 characters").trim(),
  folder_id: z.string().uuid("Folder ID must be a valid UUID"),
  generation_source: z.enum(["manual", "ai"], {
    errorMap: () => ({ message: "Generation source must be either 'manual' or 'ai'" }),
  }),
});

// Zod schema for GET request query parameters validation
const GetFlashcardsQuerySchema = z.object({
  folderId: z.string().uuid("Folder ID must be a valid UUID").optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("10"),
  sortBy: z
    .enum(["created_at", "updated_at", "front", "back"], {
      errorMap: () => ({ message: "Sort by must be one of: created_at, updated_at, front, back" }),
    })
    .default("created_at"),
  order: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "Order must be either 'asc' or 'desc'" }),
    })
    .default("desc"),
});

// Response type for GET flashcards
//@typescript-eslint/no-unused-vars
interface GetFlashcardsResponse {
  flashcards: FlashcardDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// GET endpoint /api/flashcards - list flashcards with pagination and filtering
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    let validatedParams;
    try {
      validatedParams = GetFlashcardsQuerySchema.parse(queryParams);
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
          error: "Invalid query parameters",
          message: "Failed to parse query parameters",
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

    // Get flashcards using the service
    const result = await flashcardService.getFlashcards(userId, {
      folderId: validatedParams.folderId,
      page: validatedParams.page,
      limit: validatedParams.limit,
      sortBy: validatedParams.sortBy,
      order: validatedParams.order,
    });

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
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
    if (error instanceof Error && error.message.includes("Folder not found")) {
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

// POST endpoint /api/flashcards - create a new flashcard
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    let requestData: CreateFlashcardCommand;

    try {
      const body = await request.json();
      requestData = CreateFlashcardSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Validation failed",
            message: error.errors.map((e) => e.message).join(", "),
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

    // Create the flashcard using the service
    const createdFlashcard = await flashcardService.createFlashcard(requestData, userId);
    return new Response(
      JSON.stringify({
        success: true,
        data: createdFlashcard,
      }),
      {
        status: 201,
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
