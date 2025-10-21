import type { FolderDTO, CreateFolderCommand, UpdateFolderCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";

/**
 * Service for managing folders
 * Handles all folder-related database operations with proper validation and error handling
 */
export class FolderService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get paginated list of folders for a specific user
   * @param userId - User ID to filter folders by
   * @param options - Query options for pagination
   * @returns Promise<{folders: FolderDTO[], pagination: PaginationInfo}> - Paginated folders data
   * @throws Error if database operation fails or user validation fails
   */
  async getUserFolders(
    userId: string,
    options: {
      page: number;
      limit: number;
    }
  ): Promise<{
    folders: FolderDTO[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      // Validate UUID format for user_id
      if (!this.isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Build query with count for pagination
      const query = this.supabase
        .from("folders")
        .select("id, name, created_at, updated_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) // Most recent first
        .range(offset, offset + limit - 1);

      // Execute query
      const { data: foldersData, error: foldersError, count } = await query;

      if (foldersError) {
        throw new Error("Failed to retrieve folders from database");
      }

      // Calculate pagination info
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform data to DTOs (exclude user_id)
      const folders: FolderDTO[] = (foldersData || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
      }));

      return {
        folders,
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
      throw new Error("Failed to get folders");
    }
  }

  /**
   * Get detailed information about a specific folder including flashcard count
   * @param folderId - ID of the folder to retrieve
   * @param userId - User ID to verify ownership
   * @returns Promise<FolderDTO> - Folder details with flashcard count
   * @throws Error if folder not found, access denied, or database operation fails
   */
  async getFolderDetails(folderId: string, userId: string): Promise<FolderDTO & { flashcard_count: number }> {
    try {
      // Validate UUID format for both parameters
      if (!this.isValidUUID(folderId)) {
        throw new Error("Invalid folder ID format");
      }

      if (!this.isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Query folder with user_id verification to ensure ownership
      const { data: folderData, error: folderError } = await this.supabase
        .from("folders")
        .select("id, name, created_at, updated_at")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (folderError) {
        if (folderError.code === "PGRST116") {
          // No rows returned - folder not found or not owned by user
          throw new Error("Folder not found or access denied");
        }
        throw new Error("Failed to retrieve folder from database");
      }

      if (!folderData) {
        throw new Error("Folder not found or access denied");
      }

      // Query flashcard count for this folder
      const { count: flashcardCount, error: countError } = await this.supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("folder_id", folderId)
        .eq("user_id", userId);

      if (countError) {
        throw new Error("Failed to retrieve flashcard count from database");
      }

      // Transform data to DTO format (exclude user_id) and add flashcard count
      const folderDetails: FolderDTO & { flashcard_count: number } = {
        id: folderData.id,
        name: folderData.name,
        created_at: folderData.created_at,
        updated_at: folderData.updated_at,
        flashcard_count: flashcardCount || 0,
      };

      return folderDetails;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get folder details");
    }
  }

  /**
   * Create a new folder for a specific user
   * @param folderData - Data for creating the folder including user_id
   * @returns Promise<FolderDTO> - Created folder data
   * @throws Error if folder name already exists for user, validation fails, or database operation fails
   */
  async createFolder(folderData: CreateFolderCommand): Promise<FolderDTO> {
    try {
      // Validate UUID format for user_id
      if (!this.isValidUUID(folderData.user_id)) {
        throw new Error("Invalid user ID format");
      }

      // Check if folder with same name already exists for this user
      const { data: existingFolder, error: checkError } = await this.supabase
        .from("folders")
        .select("id")
        .eq("user_id", folderData.user_id)
        .eq("name", folderData.name)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is what we want
        throw new Error("Failed to validate folder uniqueness");
      }

      if (existingFolder) {
        throw new Error("A folder with this name already exists");
      }

      // Create the new folder
      const { data: newFolder, error: insertError } = await this.supabase
        .from("folders")
        .insert([
          {
            name: folderData.name,
            user_id: folderData.user_id,
          },
        ])
        .select("id, name, created_at, updated_at")
        .single();

      if (insertError) {
        // Handle specific database constraints
        if (insertError.code === "23505") {
          // Unique constraint violation
          throw new Error("A folder with this name already exists");
        }

        throw new Error("Failed to create folder in database");
      }

      if (!newFolder) {
        throw new Error("Failed to create folder - no data returned");
      }

      // Transform data to DTO format (exclude user_id)
      const folderDTO: FolderDTO = {
        id: newFolder.id,
        name: newFolder.name,
        created_at: newFolder.created_at,
        updated_at: newFolder.updated_at,
      };

      return folderDTO;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create folder");
    }
  }

  /**
   * Update an existing folder's name
   * @param folderId - ID of the folder to update
   * @param userId - User ID to verify ownership
   * @param updateData - Data for updating the folder
   * @returns Promise<FolderDTO> - Updated folder data
   * @throws Error if folder not found, access denied, name already exists, or database operation fails
   */
  async updateFolder(folderId: string, userId: string, updateData: UpdateFolderCommand): Promise<FolderDTO> {
    try {
      // Validate UUID format for both parameters
      if (!this.isValidUUID(folderId)) {
        throw new Error("Invalid folder ID format");
      }

      if (!this.isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      // Validate folder name is not empty
      if (!updateData.name || updateData.name.trim().length === 0) {
        throw new Error("Folder name cannot be empty");
      }

      // Trim the name to prevent whitespace-only names
      const trimmedName = updateData.name.trim();

      // First, verify the folder exists and belongs to the user
      const { data: existingFolder, error: checkError } = await this.supabase
        .from("folders")
        .select("id, name")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          // No rows returned - folder not found or not owned by user
          throw new Error("Folder not found or access denied");
        }
        throw new Error("Failed to verify folder ownership");
      }

      if (!existingFolder) {
        throw new Error("Folder not found or access denied");
      }

      // Check if the new name is different from the current name
      if (existingFolder.name === trimmedName) {
        // Name hasn't changed, return current folder data
        const folderDetails = await this.getFolderDetails(folderId, userId);
        // Return without flashcard_count for consistency with update operation
        //@typescript-eslint/no-unused-vars
        const { flashcard_count, ...folderDTO } = folderDetails;
        return folderDTO;
      }

      // Check if another folder with the same name already exists for this user
      const { data: duplicateFolder, error: duplicateError } = await this.supabase
        .from("folders")
        .select("id")
        .eq("user_id", userId)
        .eq("name", trimmedName)
        .neq("id", folderId) // Exclude current folder
        .single();

      if (duplicateError && duplicateError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is what we want
        throw new Error("Failed to validate folder name uniqueness");
      }

      if (duplicateFolder) {
        throw new Error("A folder with this name already exists");
      }

      // Update the folder
      const { data: updatedFolder, error: updateError } = await this.supabase
        .from("folders")
        .update({
          name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", folderId)
        .eq("user_id", userId)
        .select("id, name, created_at, updated_at")
        .single();

      if (updateError) {
        // Handle specific database constraints
        if (updateError.code === "23505") {
          // Unique constraint violation
          throw new Error("A folder with this name already exists");
        }

        throw new Error("Failed to update folder in database");
      }

      if (!updatedFolder) {
        throw new Error("Failed to update folder - no data returned");
      }

      // Transform data to DTO format (exclude user_id)
      const folderDTO: FolderDTO = {
        id: updatedFolder.id,
        name: updatedFolder.name,
        created_at: updatedFolder.created_at,
        updated_at: updatedFolder.updated_at,
      };

      return folderDTO;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update folder");
    }
  }

  /**
   * Delete a folder and all associated flashcards (cascade delete)
   * @param folderId - ID of the folder to delete
   * @param userId - User ID to verify ownership
   * @returns Promise<void> - Resolves when folder is successfully deleted
   * @throws Error if folder not found, access denied, or database operation fails
   */
  async deleteFolder(folderId: string, userId: string): Promise<void> {
    try {
      // Validate UUID format for both parameters
      if (!this.isValidUUID(folderId)) {
        throw new Error("Invalid folder ID format");
      }

      if (!this.isValidUUID(userId)) {
        throw new Error("Invalid user ID format");
      }

      // First, verify the folder exists and belongs to the user
      const { data: existingFolder, error: checkError } = await this.supabase
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          // No rows returned - folder not found or not owned by user
          throw new Error("Folder not found or access denied");
        }
        throw new Error("Failed to verify folder ownership");
      }

      if (!existingFolder) {
        throw new Error("Folder not found or access denied");
      }

      // Delete the folder (flashcards will be deleted automatically due to CASCADE constraint)
      const { error: deleteError } = await this.supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error("Failed to delete folder from database");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete folder");
    }
  }

  /**
   * Validates if a string is a valid UUID format
   * @param uuid - String to validate
   * @returns boolean - True if valid UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
