import type { Database } from './db/database.types';

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
export interface FolderDTO extends Omit<Folder, 'user_id'> {
  // Optional field added for folder details endpoint
  flashcard_count?: number;
}

// Command Model for creating a new folder (POST /folders).
// Only the 'name' field is needed from the Folder entity.
export type CreateFolderCommand = Pick<Folder, 'name'>;

// Command Model for updating an existing folder (PUT /folders/{folderId}).
// Payload requires a new name for the folder.
export type UpdateFolderCommand = Pick<Folder, 'name'>;

// -----------------------------------------------------------
// 2. FLASHCARDS

// DTO for flashcards used in listing and detailed retrieval (GET endpoints for flashcards).
// Excludes the internal 'user_id' field as it is managed from session context.
export interface FlashcardDTO extends Omit<Flashcard, 'user_id'> {}

// Command Model for creating a new flashcard (POST /flashcards).
// The payload must include 'front', 'back', 'folder_id', and 'generation_source'.
export type CreateFlashcardCommand = Pick<Flashcard, 'front' | 'back' | 'folder_id' | 'generation_source'>;

// Command Model for updating an existing flashcard (PUT /flashcards/{flashcardId}).
// The payload structure is similar to the creation command. Depending on the usage, you may allow partial updates.
export type UpdateFlashcardCommand = Pick<Flashcard, 'front' | 'back' | 'folder_id' | 'generation_source'>;

// Command Model for generating flashcards via AI (POST /flashcards/generate).
// Receives a text input and returns a suggested folder name and a list of flashcard proposals.
export type GenerateFlashcardsCommand = {
  text: string;
};

// DTO representing the response from the AI flashcard generation endpoint.
export interface GenerateFlashcardsResponseDTO {
  suggested_folder_name: string;
  flashcards_proposals: Array<{
    front: string;
    back: string;
    generation_source: 'ai';
  }>;
}

// Command Model for bulk saving accepted flashcards (POST /flashcards/bulk-save).
// Payload includes the target folder ID and an array of flashcards.
export type BulkSaveFlashcardsCommand = {
  folder_id: string;
  flashcards: Array<{
    front: string;
    back: string;
    generation_source: 'ai';
  }>;
};

// -----------------------------------------------------------
// Additional notes:
// - All DTOs directly derive from the underlying database entity types ensuring consistent structure.
// - Command Models use TypeScript utility types (Pick, Omit) to select only the necessary fields.
// - For update operations, both create and update commands share similar structure as per API requirements.
