import type { Database } from "./db/database.types";

// Base types extracted from the Supabase database definitions
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];

// -----------------------------------------------------------
// DTO and Command Models Definitions for the API
// -----------------------------------------------------------

// 1. FOLDER

// DTO used for listing and retrieving folder details.
// For GET /folders and GET /folders/{folderId} endpoints.
// In 'Get Folder Details', we include an additional property 'flashcard_count'.
export interface FolderDTO extends Omit<Folder, "user_id"> {
  // Optional field added for folder details endpoint
  flashcard_count?: number;
}

// Command Model for creating a new folder (POST /folders).
// The 'name' and 'user_id' fields are needed from the request.
export type CreateFolderCommand = Pick<Folder, "name" | "user_id">;

// Command Model for updating an existing folder (PUT /folders/{folderId}).
// Payload requires a new name for the folder.
export type UpdateFolderCommand = Pick<Folder, "name">;

// -----------------------------------------------------------
// 2. FLASHCARDS

// DTO for flashcards used in listing and detailed retrieval (GET endpoints for flashcards).
// Excludes the internal 'user_id' field as it is managed from session context.
//@typescript-eslint/no-empty-object-type
export interface FlashcardDTO extends Omit<Flashcard, "user_id"> {}

// Command Model for creating a new flashcard (POST /flashcards).
// The payload must include 'front', 'back', 'folder_id', and 'generation_source'.
export type CreateFlashcardCommand = Pick<Flashcard, "front" | "back" | "folder_id" | "generation_source">;

// Command Model for updating an existing flashcard (PUT /flashcards/{flashcardId}).
// The payload structure is similar to the creation command. Depending on the usage, you may allow partial updates.
export type UpdateFlashcardCommand = Pick<Flashcard, "front" | "back" | "generation_source"> & {
  folder_id?: string; // Optional for updates - allows moving flashcard to different folder
};

// Command Model for generating flashcards via AI (POST /flashcards/generate).
// Receives a text input and returns a suggested folder name and a list of flashcard proposals.
export interface GenerateFlashcardsCommand {
  text: string;
}

// DTO representing the response from the AI flashcard generation endpoint.
export interface GenerateFlashcardsResponseDTO {
  suggested_folder_name: string;
  flashcards_proposals: {
    front: string;
    back: string;
    generation_source: "ai";
  }[];
}

// Command Model for bulk saving accepted flashcards (POST /flashcards/bulk-save).
// Payload includes the target folder ID and an array of flashcards.
// user_id is obtained from session by the backend.
export interface BulkSaveFlashcardsCommand {
  folder_id: string;
  flashcards: {
    front: string;
    back: string;
    generation_source: "ai";
  }[];
}

// -----------------------------------------------------------
// 3. VIEW MODELS FOR UI STATE MANAGEMENT

// ViewModel type for managing UI state of flashcard proposals during generation flow
export interface FlashcardProposalViewModel {
  id: string; // Unique client-side identifier (e.g., UUID)
  front: string;
  back: string;
  generation_source: "ai";
  status: "pending" | "accepted" | "rejected"; // User acceptance state
}

// ViewModel for folder, used in Dashboard view.
// Combines basic folder data with flashcard count.
export interface FolderViewModel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}

// -----------------------------------------------------------
// 4. PAGINATION AND FOLDER VIEW MODELS

// Pagination structure for list endpoints
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ViewModel for flashcard used in the folder view UI
export interface FlashcardViewModel {
  id: string;
  front: string;
  back: string;
  folder_id: string;
  generation_source: "manual" | "ai";
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------
// 5. STUDY SESSION VIEW MODELS

// ViewModel for managing study session UI state
export interface StudySessionViewModel {
  flashcards: FlashcardViewModel[];
  currentCardIndex: number;
  knownFlashcards: number;
  status: "loading" | "studying" | "finished";
  error: string | null;
}

// -----------------------------------------------------------
// Additional notes:
// - All DTOs directly derive from the underlying database entity types ensuring consistent structure.
// - Command Models use TypeScript utility types (Pick, Omit) to select only the necessary fields.
// - For update operations, both create and update commands share similar structure as per API requirements.
