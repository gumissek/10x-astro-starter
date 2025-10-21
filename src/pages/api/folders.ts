import type { APIRoute } from "astro";
import { z } from "zod";
import { FolderService } from "../../lib/services/folderService";
import type { CreateFolderCommand } from "../../types";

/**
 * Schema for validating folder creation request
 * Used for POST /api/folders endpoint
 */
const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must not exceed 100 characters")
    .trim()
    .refine((name) => name.length > 0, "Folder name cannot be empty or contain only whitespace"),
  user_id: z.string().uuid("user_id must be a valid UUID").min(1, "user_id is required"),
});

export const prerender = false;

/**
 * GET /api/folders
 * Endpoint for retrieving paginated list of folders for a specific user
 *
 * Query Parameters:
 * - user_id (required): UUID of the user to retrieve folders for
 * - page (optional): Page number, defaults to 1
 * - limit (optional): Items per page, defaults to 10, max 50
 *
 * Response:
 * - 200: Success with folders list (may be empty array) and pagination info
 * - 400: Bad request (invalid parameters)
 * - 500: Internal server error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Parse query parameters from URL
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get("user_id");
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    // Validate required user_id parameter
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

    // Validate UUID format for user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

    // Parse and validate pagination parameters
    let page = 1;
    let limit = 10;

    if (pageParam) {
      const parsedPage = parseInt(pageParam, 10);
      if (isNaN(parsedPage) || parsedPage < 1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid page parameter",
            message: "page must be a positive integer greater than 0",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      page = parsedPage;
    }

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid limit parameter",
            message: "limit must be a positive integer between 1 and 50",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      limit = parsedLimit;
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

    // Retrieve folders for the user
    const result = await folderService.getUserFolders(userIdParam, {
      page,
      limit,
    });

    // Return successful response with folders and pagination
    // Even if no folders are found, return success with empty array
    // This allows frontend to show appropriate "empty state" UI
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          folders: result.folders,
          pagination: result.pagination,
        },
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
      // Database or validation errors
      if (error.message.includes("Invalid user ID format") || error.message.includes("Failed to get folders")) {
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
      if (error.message.includes("Failed to retrieve folders from database")) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database error",
            message: "Failed to retrieve folders from database",
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
 * POST /api/folders
 * Endpoint for creating a new folder for an authenticated user
 *
 * Request Body:
 * - name (required): String name for the new folder
 * - user_id (required): UUID of the user creating the folder
 *
 * Headers:
 * - Content-Type: application/json
 *
 * Response:
 * - 201: Success with created folder data
 * - 400: Bad request (validation errors, duplicate name)
 * - 401: Unauthorized (missing or invalid authentication)
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse JSON body from request
    let requestBody;
    try {
      requestBody = await request.json();
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

    // Validate request body against schema
    const validationResult = createFolderSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => err.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          message: errorMessages.join(", "),
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { name, user_id } = validationResult.data;

    // Validate user authentication
    // TODO: Implement proper session validation
    if (!user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication required",
          message: "User must be authenticated to create folders",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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

    // Create folder data command
    const createFolderCommand: CreateFolderCommand = {
      name: name,
      user_id: user_id,
    };

    // Create the folder
    const newFolder = await folderService.createFolder(createFolderCommand);

    // Return successful response with created folder
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          folder: newFolder,
        },
        message: "Folder created successfully",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Prevent caching of user-specific data
        },
      }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      // Validation or business logic errors
      if (
        error.message.includes("Invalid user ID format") ||
        error.message.includes("A folder with this name already exists")
      ) {
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
      if (
        error.message.includes("Failed to create folder in database") ||
        error.message.includes("Failed to validate folder uniqueness")
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Database error",
            message: "Failed to process folder creation",
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
