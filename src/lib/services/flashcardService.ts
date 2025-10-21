import type {
  GenerateFlashcardsResponseDTO,
  CreateFlashcardCommand,
  FlashcardDTO,
  UpdateFlashcardCommand,
  BulkSaveFlashcardsCommand,
} from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
/**
 * Service for generating flashcards using AI
 * Currently uses mock data, but can be extended with actual AI integration
 */
export class FlashcardGenerationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get a flashcard by its ID
   * @param flashcardId - The UUID of the flashcard to retrieve
   * @param userId - User ID
   * @returns Promise<FlashcardDTO | null> - Flashcard data or null if not found
   * @throws Error if database operation fails
   */
  async getFlashcardById(flashcardId: string, userId: string): Promise<FlashcardDTO | null> {
    try {
      const { data: flashcardData, error: flashcardError } = await this.supabase
        .from("flashcards")
        .select("id, front, back, folder_id, generation_source, created_at, updated_at")
        .eq("id", flashcardId)
        .eq("user_id", userId) // Ensure user can only access their own flashcards
        .single();

      // Handle not found case
      if (flashcardError) {
        if (flashcardError.code === "PGRST116") {
          // PostgREST "no rows returned" error
          return null; // Flashcard not found
        }

        // Log and throw for other database errors
        throw new Error("Failed to retrieve flashcard from database");
      }

      if (!flashcardData) {
        return null;
      }

      // Transform to DTO (exclude user_id)
      return {
        id: flashcardData.id,
        front: flashcardData.front,
        back: flashcardData.back,
        folder_id: flashcardData.folder_id,
        generation_source: flashcardData.generation_source,
        created_at: flashcardData.created_at,
        updated_at: flashcardData.updated_at,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get flashcard");
    }
  }

  /**
   * Get paginated list of flashcards for a user with optional filtering and sorting
   * @param userId - User ID
   * @param options - Query options for filtering, pagination and sorting
   * @returns Promise<{flashcards: FlashcardDTO[], pagination: PaginationInfo}> - Paginated flashcards data
   * @throws Error if database operation fails
   */
  async getFlashcards(
    userId: string,
    options: {
      folderId?: string;
      page: number;
      limit: number;
      sortBy: string;
      order: string;
    }
  ): Promise<{
    flashcards: FlashcardDTO[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { folderId, page, limit, sortBy, order } = options;
      const offset = (page - 1) * limit;

      // Build base query
      let query = this.supabase
        .from("flashcards")
        .select("id, front, back, folder_id, generation_source, created_at, updated_at", { count: "exact" })
        .eq("user_id", userId);

      // Add folder filter if provided
      if (folderId) {
        // First verify that the folder exists and belongs to the user
        const { data: folderData, error: folderError } = await this.supabase
          .from("folders")
          .select("id")
          .eq("id", folderId)
          .eq("user_id", userId)
          .single();

        if (folderError || !folderData) {
          throw new Error("Folder not found or access denied");
        }

        query = query.eq("folder_id", folderId);
      }

      // Add sorting
      query = query.order(sortBy, { ascending: order === "asc" });

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: flashcardsData, error: flashcardsError, count } = await query;

      if (flashcardsError) {
        throw new Error("Failed to retrieve flashcards from database");
      }

      // Calculate pagination info
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform data to DTOs (exclude user_id)
      const flashcards: FlashcardDTO[] = (flashcardsData || []).map((flashcard) => ({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        folder_id: flashcard.folder_id,
        generation_source: flashcard.generation_source,
        created_at: flashcard.created_at,
        updated_at: flashcard.updated_at,
      }));

      return {
        flashcards,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get flashcards");
    }
  }

  /**
   * Create a new flashcard in the database
   * @param flashcardData - Flashcard data to create
   * @param userId - User ID
   * @returns Promise<FlashcardDTO> - Created flashcard data
   */
  async createFlashcard(flashcardData: CreateFlashcardCommand, userId: string): Promise<FlashcardDTO> {
    try {
      // First, verify that the folder exists and belongs to the user
      const { data: folderData, error: folderError } = await this.supabase
        .from("folders")
        .select("id, user_id")
        .eq("id", flashcardData.folder_id)
        .eq("user_id", userId)
        .single();

      if (folderError || !folderData) {
        throw new Error("Folder not found or access denied");
      }

      // Create the flashcard
      const { data: flashcardResult, error: flashcardError } = await this.supabase
        .from("flashcards")
        .insert([
          {
            front: flashcardData.front,
            back: flashcardData.back,
            folder_id: flashcardData.folder_id,
            generation_source: flashcardData.generation_source,
            user_id: userId,
          },
        ])
        .select("id, front, back, folder_id, generation_source, created_at, updated_at")
        .single();
      if (flashcardError || !flashcardResult) {
        throw new Error("Failed to create flashcard in database");
      }

      // Return the flashcard data as DTO (without user_id)
      return {
        id: flashcardResult.id,
        front: flashcardResult.front,
        back: flashcardResult.back,
        folder_id: flashcardResult.folder_id,
        generation_source: flashcardResult.generation_source,
        created_at: flashcardResult.created_at,
        updated_at: flashcardResult.updated_at,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create flashcard");
    }
  }

  /**
   * Update an existing flashcard
   * @param flashcardId - The UUID of the flashcard to update
   * @param updateData - Data to update the flashcard with
   * @param userId - User ID
   * @returns Promise<FlashcardDTO> - Updated flashcard data
   * @throws Error if flashcard not found, folder not found, or database operation fails
   */
  async updateFlashcard(
    flashcardId: string,
    updateData: UpdateFlashcardCommand,
    userId: string
  ): Promise<FlashcardDTO> {
    try {
      // First, verify that the flashcard exists and belongs to the user
      const { data: existingFlashcard, error: flashcardError } = await this.supabase
        .from("flashcards")
        .select("id, folder_id, user_id")
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (flashcardError) {
        if (flashcardError.code === "PGRST116") {
          // PostgREST "no rows returned" error
          throw new Error("Flashcard not found or access denied");
        }

        throw new Error("Failed to retrieve flashcard from database");
      }

      if (!existingFlashcard) {
        throw new Error("Flashcard not found or access denied");
      }

      // If folder_id is being updated, verify the new folder exists and belongs to the user
      if (updateData.folder_id && updateData.folder_id !== existingFlashcard.folder_id) {
        const { data: folderData, error: folderError } = await this.supabase
          .from("folders")
          .select("id, user_id")
          .eq("id", updateData.folder_id)
          .eq("user_id", userId)
          .single();

        if (folderError || !folderData) {
          throw new Error("Folder not found or access denied");
        }
      }

      // Prepare update data
      //@typescript-eslint/no-explicit-any
      const updatePayload: any = {
        front: updateData.front,
        back: updateData.back,
        generation_source: updateData.generation_source,
        updated_at: new Date().toISOString(),
      };

      // Only update folder_id if it's provided
      if (updateData.folder_id) {
        updatePayload.folder_id = updateData.folder_id;
      }

      // Update the flashcard
      const { data: updatedFlashcard, error: updateError } = await this.supabase
        .from("flashcards")
        .update(updatePayload)
        .eq("id", flashcardId)
        .eq("user_id", userId) // Extra security check
        .select("id, front, back, folder_id, generation_source, created_at, updated_at")
        .single();

      if (updateError || !updatedFlashcard) {
        throw new Error("Failed to update flashcard in database");
      }

      // Return the updated flashcard data as DTO (without user_id)
      return {
        id: updatedFlashcard.id,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back,
        folder_id: updatedFlashcard.folder_id,
        generation_source: updatedFlashcard.generation_source,
        created_at: updatedFlashcard.created_at,
        updated_at: updatedFlashcard.updated_at,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update flashcard");
    }
  }

  /**
   * Generate flashcards from provided text
   * @param text - Input text to generate flashcards from (max 5000 characters)
   * @returns Promise<GenerateFlashcardsResponseDTO> - Generated flashcards with suggested folder name
   *
   * Authentication will be implemented comprehensively later.
   */
  async generateFlashcards(text: string): Promise<GenerateFlashcardsResponseDTO> {
    try {
      // Simulate processing time for AI call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Extract key concepts from text for mock generation
      const mockResponse = this.generateMockFlashcards(text);

      return mockResponse;
    } catch (error) {
      throw new Error("Failed to generate flashcards from provided text");
    }
  }

  /**
   * Generate mock flashcards based on text analysis
   * This will be replaced with actual AI integration in the future
   * @param text - Input text
   * @returns GenerateFlashcardsResponseDTO - Mock response
   */
  private generateMockFlashcards(text: string): GenerateFlashcardsResponseDTO {
    // Simple text analysis for mock purposes
    const wordCount = text.split(/\s+/).length;
    const textLength = text.length;

    // Generate suggested folder name based on text content
    const firstWords = text.split(/\s+/).slice(0, 3).join(" ");
    const suggestedName = firstWords.length > 30 ? `${firstWords.substring(0, 30)}...` : `Study Notes - ${firstWords}`;

    // Generate mock flashcards based on text characteristics
    const flashcardsProposals = [];

    // Basic flashcard about text length and structure
    flashcardsProposals.push({
      front: "What is the approximate length of the provided text?",
      back: `The text contains approximately ${wordCount} words and ${textLength} characters.`,
      generation_source: "ai" as const,
    });

    // If text is long enough, create more specific flashcards
    if (wordCount > 20) {
      flashcardsProposals.push({
        front: "What is the main topic discussed in this text?",
        back: `Based on the content analysis, the text appears to discuss: ${firstWords}`,
        generation_source: "ai" as const,
      });
    }

    if (wordCount > 50) {
      // Try to find questions or important statements
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
      if (sentences.length > 1) {
        const keysentence = sentences[0].trim();
        flashcardsProposals.push({
          front: "What is one of the key points mentioned in the text?",
          back: keysentence.length > 200 ? `${keysentence.substring(0, 200)}...` : keysentence,
          generation_source: "ai" as const,
        });
      }
    }

    // Always include at least 2 flashcards
    if (flashcardsProposals.length < 2) {
      flashcardsProposals.push({
        front: "What type of content was provided for flashcard generation?",
        back: "The content appears to be educational or informational text suitable for creating study materials.",
        generation_source: "ai" as const,
      });
    }

    return {
      suggested_folder_name: suggestedName,
      flashcards_proposals: flashcardsProposals,
    };
  }

  /**
   * Bulk save multiple flashcards to a specific folder
   * Used primarily for saving AI-generated flashcards that user has accepted
   * @param bulkData - Bulk save command containing folder_id and flashcards array
   * @param userId - User ID from authenticated session
   * @returns Promise<{saved_count: number, flashcard_ids: string[], message: string}> - Bulk save result
   * @throws Error if folder not found, access denied, or database operation fails
   */
  async bulkSaveFlashcards(
    bulkData: BulkSaveFlashcardsCommand,
    userId: string
  ): Promise<{
    saved_count: number;
    flashcard_ids: string[];
    message: string;
  }> {
    try {
      // Verify that the folder exists and belongs to the user
      const { data: folderData, error: folderError } = await this.supabase
        .from("folders")
        .select("id, user_id, name")
        .eq("id", bulkData.folder_id)
        .eq("user_id", userId)
        .single();

      if (folderError) {
        if (folderError.code === "PGRST116") {
          // PostgREST "no rows returned" error
          throw new Error("Folder not found or access denied");
        }

        throw new Error("Failed to retrieve folder from database");
      }

      if (!folderData) {
        throw new Error("Folder not found or access denied");
      }

      // Prepare flashcards data for bulk insert
      const flashcardsToInsert = bulkData.flashcards.map((flashcard) => ({
        front: flashcard.front,
        back: flashcard.back,
        folder_id: bulkData.folder_id,
        generation_source: flashcard.generation_source,
        user_id: userId,
      }));

      // Use Supabase transaction-like bulk insert
      const { data: insertedFlashcards, error: insertError } = await this.supabase
        .from("flashcards")
        .insert(flashcardsToInsert)
        .select("id, front, back, folder_id, generation_source, created_at, updated_at");

      if (insertError || !insertedFlashcards) {
        throw new Error("Failed to save flashcards to database");
      }

      // Extract IDs of successfully created flashcards
      const flashcardIds = insertedFlashcards.map((flashcard) => flashcard.id);
      const savedCount = insertedFlashcards.length;

      return {
        saved_count: savedCount,
        flashcard_ids: flashcardIds,
        message: `Successfully saved ${savedCount} flashcard${savedCount > 1 ? "s" : ""} to folder "${folderData.name}"`,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to bulk save flashcards");
    }
  }

  /**
   * Delete a flashcard by ID
   * @param flashcardId - The UUID of the flashcard to delete
   * @param userId - User ID
   * @returns Promise<void> - No data returned on successful deletion
   * @throws Error if flashcard not found, access denied, or database operation fails
   */
  async deleteFlashcard(flashcardId: string, userId: string): Promise<void> {
    try {
      // First, verify that the flashcard exists and belongs to the user
      const { data: existingFlashcard, error: flashcardError } = await this.supabase
        .from("flashcards")
        .select("id, user_id")
        .eq("id", flashcardId)
        .eq("user_id", userId)
        .single();

      if (flashcardError) {
        if (flashcardError.code === "PGRST116") {
          // PostgREST "no rows returned" error
          throw new Error("Flashcard not found or access denied");
        }

        throw new Error("Failed to retrieve flashcard from database");
      }

      if (!existingFlashcard) {
        throw new Error("Flashcard not found or access denied");
      }

      // Delete the flashcard
      const { error: deleteError } = await this.supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId)
        .eq("user_id", userId); // Extra security check to ensure user can only delete their own flashcards

      if (deleteError) {
        throw new Error("Failed to delete flashcard from database");
      }

      // No data returned on successful deletion
      return;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete flashcard");
    }
  }

  /**
   * Future method for actual AI integration
   * This will be implemented when integrating with GPT-4o-mini API
   * @param text - Input text
   * @returns Promise<GenerateFlashcardsResponseDTO> - AI generated response
   */
  //@typescript-eslint/no-unused-vars
  private async callAIService(text: string): Promise<GenerateFlashcardsResponseDTO> {
    // TODO: Implement actual AI API call
    // This would include:
    // 1. Formatting the prompt for GPT-4o-mini
    // 2. Making the API call with proper error handling
    // 3. Parsing and validating the AI response
    // 4. Handling timeouts (60 seconds as per requirements)

    // Example of future database integration:
    // const { data, error } = await this.supabase
    //   .from('flashcards')
    //   .insert([{ front: '...', back: '...', user_id:  }]);

    throw new Error("AI service integration not yet implemented");
  }
}
