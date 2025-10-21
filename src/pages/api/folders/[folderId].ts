import type { APIRoute } from "astro";
import { FolderService } from "../../../lib/services/folderService";
import type { UpdateFolderCommand } from "../../../types";
import { z } from "zod";

export const prerender = false;

// Zod schema for validating UUID format
const uuidSchema = z.string().uuid("Must be a valid UUID");

// Zod schema for validating update folder request body
const updateFolderSchema = z.object({
  name: z.string().trim().min(1, "Folder name cannot be empty").max(100, "Folder name cannot exceed 100 characters"),
});

/**
 * GET /api/folders/{folderId}
 * Endpoint for retrieving detailed information about a specific folder
 *
 * Path Parameters:
 * - folderId: UUID of the folder to retrieve
 *
 * Query Parameters:
 * - user_id (required): UUID of the user who owns the folder
 *
 * Response:
 * - 200: Success with folder details including flashcard count
 * - 400: Bad request (invalid parameters)
 * - 404: Folder not found or not owned by user
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    // Extract folderId from path parameters
    const { folderId } = params;

    // Parse query parameters from URL
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("user_id");

    // Validate required parameters
    if (!folderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: folderId",
          message: "folderId path parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!userIdParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: user_id",
          message: "user_id query parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format for both parameters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(folderId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid folderId format",
          message: "folderId must be a valid UUID",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!uuidRegex.test(userIdParam)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user_id format",
          message: "user_id must be a valid UUID",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Add authentication middleware validation
    // For now, we proceed with the provided user_id
    // In future implementation, verify that the authenticated user matches the requested user_id

    // Get Supabase client from locals (following backend rules)
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

    // Initialize folder service
    const folderService = new FolderService(supabase);

    // Retrieve folder details with flashcard count
    const folderDetails = await folderService.getFolderDetails(folderId, userIdParam);

    // Return successful response with folder details
    return new Response(
      JSON.stringify({
        success: true,
        data: folderDetails,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Prevent caching of user-specific data
        },
      }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Folder not found or access denied
      if (error.message.includes("Folder not found") || error.message.includes("Access denied")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Folder not found",
            message: error.message,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Database or validation errors
      if (error.message.includes("Invalid") || error.message.includes("Failed to get folder")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Request processing failed",
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

      // Database connection errors
      if (error.message.includes("Failed to retrieve") || error.message.includes("Database error")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database error",
            message: "Failed to retrieve folder details from database",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Generic server error for unhandled cases
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the request",
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
 * PUT /api/folders/{folderId}
 * Endpoint for updating a folder's name
 *
 * Path Parameters:
 * - folderId: UUID of the folder to update
 *
 * Query Parameters:
 * - user_id (required): UUID of the user who owns the folder
 *
 * Request Body:
 * - name (required): New name for the folder
 *
 * Response:
 * - 200: Success with updated folder details
 * - 400: Bad request (invalid parameters, empty name, or duplicate name)
 * - 404: Folder not found or not owned by user
 * - 500: Internal server error
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Extract folderId from path parameters
    const { folderId } = params;

    // Parse query parameters from URL
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("user_id");

    // Parse request body
    //@typescript-eslint/no-explicit-any
    let requestBody: any;
    try {
      const textBody = await request.text();
      if (!textBody) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Missing request body",
            message: "Request body with folder name is required",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      requestBody = JSON.parse(textBody);
      //@typescript-eslint/no-unused-vars
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON format",
          message: "Request body must be valid JSON",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate required parameters
    if (!folderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: folderId",
          message: "folderId path parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!userIdParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: user_id",
          message: "user_id query parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate request body structure
    if (!requestBody || typeof requestBody !== "object") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request body",
          message: "Request body must be a valid object",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format for both parameters using Zod
    const folderIdValidation = uuidSchema.safeParse(folderId);
    if (!folderIdValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid folderId format",
          message: folderIdValidation.error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userIdValidation = uuidSchema.safeParse(userIdParam);
    if (!userIdValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user_id format",
          message: userIdValidation.error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate request body using Zod schema
    const bodyValidation = updateFolderSchema.safeParse(requestBody);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation error",
          message: bodyValidation.error.errors[0].message,
          details: bodyValidation.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Add authentication middleware validation
    // For now, we proceed with the provided user_id
    // In future implementation, verify that the authenticated user matches the requested user_id

    // Get Supabase client from locals (following backend rules)
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

    // Initialize folder service
    const folderService = new FolderService(supabase);

    // Create update command with validated data
    const updateCommand: UpdateFolderCommand = {
      name: bodyValidation.data.name, // Use validated and trimmed data from Zod
    };

    // Update the folder
    const updatedFolder = await folderService.updateFolder(folderId, userIdParam, updateCommand);

    // Return successful response with updated folder details
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedFolder,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Prevent caching of user-specific data
        },
      }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Folder not found or access denied
      if (error.message.includes("Folder not found") || error.message.includes("Access denied")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Folder not found",
            message: error.message,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Validation errors and duplicate name errors
      if (
        error.message.includes("Invalid") ||
        error.message.includes("already exists") ||
        error.message.includes("cannot be empty") ||
        error.message.includes("Failed to validate")
      ) {
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

      // Database connection errors
      if (error.message.includes("Failed to update") || error.message.includes("Database error")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database error",
            message: "Failed to update folder in database",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Generic server error for unhandled cases
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the request",
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
 * DELETE /api/folders/{folderId}
 * Endpoint for deleting a folder and all associated flashcards (cascade delete)
 *
 * Path Parameters:
 * - folderId: UUID of the folder to delete
 *
 * Query Parameters:
 * - user_id (required): UUID of the user who owns the folder
 *
 * Response:
 * - 200: Success with confirmation message
 * - 400: Bad request (invalid parameters)
 * - 404: Folder not found or not owned by user
 * - 500: Internal server error
 */
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    // Extract folderId from path parameters
    const { folderId } = params;

    // Parse query parameters from URL
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("user_id");

    // Validate required parameters
    if (!folderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: folderId",
          message: "folderId path parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!userIdParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: user_id",
          message: "user_id query parameter is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate UUID format for both parameters using Zod
    const folderIdValidation = uuidSchema.safeParse(folderId);
    if (!folderIdValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid folderId format",
          message: folderIdValidation.error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userIdValidation = uuidSchema.safeParse(userIdParam);
    if (!userIdValidation.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user_id format",
          message: userIdValidation.error.errors[0].message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Add authentication middleware validation
    // For now, we proceed with the provided user_id
    // In future implementation, verify that the authenticated user matches the requested user_id

    // Get Supabase client from locals (following backend rules)
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

    // Initialize folder service
    const folderService = new FolderService(supabase);

    // Delete the folder (and associated flashcards via cascade)
    await folderService.deleteFolder(folderId, userIdParam);

    // Return successful response with confirmation
    return new Response(
      JSON.stringify({
        success: true,
        message: "Folder and associated flashcards deleted successfully",
        data: {
          folderId: folderId,
          deletedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Prevent caching
        },
      }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Folder not found or access denied
      if (error.message.includes("Folder not found") || error.message.includes("Access denied")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Folder not found",
            message: error.message,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Validation errors
      if (error.message.includes("Invalid") || error.message.includes("Failed to verify")) {
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

      // Database connection errors
      if (error.message.includes("Failed to delete") || error.message.includes("Database error")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database error",
            message: "Failed to delete folder from database",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Generic server error for unhandled cases
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the request",
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
