# REST API Plan

## 1. Resources

- **Users**: Managed by Supabase Auth. Represents application users. (Schema: `auth.users`)
- **Folders**: Represents user folders for organizing flashcards. (Schema: `folders`)
- **Flashcards**: Represents individual flashcards created either manually or via AI. (Schema: `flashcards`)

## 2. Endpoints

### 2.1 Authentication

### 2.2 Folders
#### 2.2.1 List Folders
- **Method:** GET
- **URL:** /folders
- **Description:** Retrieves a paginated list of folders for the authenticated user. A valid `user_id` must be provided to filter folders belonging to the specific user.
- **Query Parameters:**
  - `user_id` (required): The UUID of the user whose folders are being retrieved.
  - `page` (optional, default 1)
  - `limit` (optional, default 10)
- **Response:**
  - Success (200):
    ```json
    {
      "folders": [
        { "id": "<UUID>", "name": "Folder Name", "created_at": "...", "updated_at": "..." }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 50 }
    }
    ```

#### 2.2.2 Get Folder Details
- **Method:** GET
- **URL:** /folders/{folderId}
- **Description:** ONLY for authenticated users. Retrieves details for a specific folder including flashcard count. A valid `user_id` query parameter must be provided to ensure the folder details are returned for the correct user.
- **Query Parameters:**
  - `user_id` (required): The UUID of the user whose folder details are being requested.
- **Response:**
    ```json
    {
        "id": "<UUID>",
        "name": "Folder Name",
        "created_at": "...",
        "updated_at": "...",
        "flashcard_count": 25
    }
    ```
  - Success (200): Folder details
  - Error (404): "Folder not found"

#### 2.2.3 Create Folder
- **Method:** POST
- **URL:** /folders
- **Description:** ONLY for authenticated users. Creates a new folder for the authenticated user. The request must include the user_id to associate the folder with the correct user.
- **Request Payload:**
  ```json
  {
    "name": "New Folder Name",
    "user_id": "<UUID>"
  }
  ```
- **Response:**
  - Success (201): Created folder details
  - Error (400): Validation errors (e.g., missing name, duplicated name, or missing user_id)

#### 2.2.4 Update Folder
- **Method:** PUT
- **URL:** /folders/{folderId}
- **Description:** ONLY for authenticated users. Updates the name of an existing folder. A valid `user_id` query parameter is required to ensure the folder belongs to the authenticated user.
- **Query Parameters:**
  - `user_id` (required): The UUID of the user who owns the folder.
- **Request Payload:**
  ```json
  { "name": "Updated Folder Name" }
  ```
- **Response:**
  - Success (200): Updated folder details
  - Error (400/404): Appropriate validation errors, not-found error, or duplicated name

#### 2.2.5 Delete Folder
- **Method:** DELETE
- **URL:** /folders/{folderId}
- **Description:** ONLY for authenticated users. Deletes a folder and cascades deletion to associated flashcards. A valid `user_id` query parameter must be provided to confirm ownership.
- **Query Parameters:**
  - `user_id` (required): The UUID of the user who owns the folder.
- **Response:**
  - Success (200): Confirmation message
  - Error (404): Folder not found

### 2.3 Flashcards

#### 2.3.1 List Flashcards
- **Method:** GET
- **URL:** /flashcards
- **Description:** ONLY for authenticated users. Retrieves a list of flashcards for the authenticated user, with optional filtering by folder.
- **Query Parameters:**
  - `folderId` (optional)
  - `page` (default 1)
  - `limit` (default 10)
  - `sortBy` (optional, e.g., created_at)
  - `order` (optional, e.g., asc/desc)
- **Response:**
  - Success (200):
    ```json
    {
      "flashcards": [
        {
          "id": "<UUID>",
          "front": "Text",
          "back": "Text",
          "generation_source": "ai or manual",
          "folder_id": "<UUID>",
          "created_at": "...",
          "updated_at": "..."
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```

#### 2.3.2 Get Flashcard Details
- **Method:** GET
- **URL:** /flashcards/{flashcardId}
- **Description:** Retrieves details for a specific flashcard.
- **Response:**
  - Success (200): Flashcard details
  ```json
  {
    "id": "<UUID>",
    "front": "Text",
    "back": "Text",
    "generation_source": "ai or manual",
    "folder_id": "<UUID>",
    "created_at": "...",
    "updated_at": "..."
  }
  ```
  - Error (404): Not found

#### 2.3.3 Create Flashcard (Manual or AI Acceptance)
- **Method:** POST
- **URL:** /flashcards
- **Description:** ONLY for authenticated users. Creates a new flashcard. Can be from manual input or from AI generation acceptance. The payload must include `front`, `back`, `folder_id`, and a field `generation_source` set to either `manual` or `ai`.
- **Request Payload:**
    ```json
    {
        "front": "Flashcard front text (max 200 characters)",
        "back": "Flashcard back text (max 500 characters)",
        "folder_id": "<UUID>",
        "generation_source": "manual",  // or "ai"
    }
    ```
- **Response:**
    - Success (201): Created flashcard details
    - Error (400): Validation errors (e.g., text length limits)


#### 2.3.4 Update Flashcard
- **Method:** PUT
- **URL:** /flashcards/{flashcardId}
- **Description:** ONLY for authenticated users. Updates an existing flashcard (e.g., editing text).
- **Request Payload:**
  ```json
  {
    "front": "Updated text",
    "back": "Updated text",
    "folder_id": "<UUID>" , // if folder change is allowed
    "generation_source": "manual" // or "ai", if change is allowed
  }
  ```
- **Response:**
  - Success (200): Updated flashcard details
  - Error (400/404): Validation error or not found
- **Validation:**
  - `front` max 200 characters
  - `back` max 500 characters
  - `folder_id` must reference an existing folder belonging to the user
  - `generation_source` must be either "manual" or "ai" if allowed to change

#### 2.3.5 Delete Flashcard
- **Method:** DELETE
- **URL:** /flashcards/{flashcardId}
- **Description:** ONLY for authenticated users. Deletes a specific flashcard.
- **Response:**
  - Success (200): Confirmation message
  - Error (404): Not found

#### 2.3.6 Generate Flashcards via AI
- **Method:** POST
- **URL:** /flashcards/generate
- **Description:** ONLY for authenticated users. Submits a text (max 5000 characters) to generate a list of flashcards proposals with a suggested folder name using the GPT-4o-mini API.
- **Request Payload:**
  ```json
  {
    "text": "Text up to 5000 characters for flashcard generation"
  }
  ```
- **Response:**
  - Success (200):
    ```json
    {
      "suggested_folder_name": "Generated Folder Name",
      "flashcards_proposals": [
        {
          "front": "Generated front text (max 200 characters)",
          "back": "Generated back text (max 500 characters)",
          "generation_source": "ai"
        }
      ]
    }
    ```
  - Error (400): Validation errors (e.g., text too long)
  ### 2.4 Statistics and Bulk Operations (Optional)

  - **Bulk Save Accepted Flashcards**
    - **Method:** POST
    - **URL:** /flashcards/bulk-save
    - **Description:** ONLY for authenticated users. Saves a batch of accepted flashcards to a specific folder after review.
    - **Request Payload:**
      ```json
      {
        "user_id": "<UUID>",
        "folder_id": "<UUID>",
        "flashcards": [
          { "front": "...", "back": "...", "generation_source": "ai" }
        ]
      }
      ```
    - **Response:**
      - Success (200): Confirmation message with list of created flashcard IDs
      - Error (400): Validation error
    - **Validation:**
      - `user_id` is required and must be a valid UUID.
      - Each entry in `flashcards` must include `front` (max 200 characters), `back` (max 500 characters), and a valid `generation_source`.

## 3. Authentication and Authorization

- JWT-based authentication is used for all endpoints except `/register` and `/login`.
- Before processing requests, the server verifies the JWT token to ensure the user is authorized and that the `auth.uid()` matches the `user_id` in the request data.
- Role-based access is implicitly managed per user; users can only access their own folders and flashcards.

## 4. Validation and Business Logic

- **Validation Rules:**
  - User registration: Email format and minimum password length of 8 characters.
  - Flashcard creation: `front` text is limited to 200 characters and `back` text is limited to 500 characters.
  - Text for AI generation is capped at 5000 characters.
  - Unique constraint for folder names per user is enforced.

- **Business Logic Implementation:**
  - **AI Flashcard Generation (US-001 & US-002):**
    - When a user submits text to `/flashcards/generate`, the API performs a chain-of-thought prompt to invoke the GPT-4o-mini API, and returns up to 30 flashcards along with a suggested folder name.
    - Users review the generated flashcards and can individually accept, edit, or reject them. Accepted flashcards are then created via the `/flashcards/bulk-save` endpoint with `generation_source` set to `ai`.
  - **Manual Flashcard Creation (US-003):**
    - Users can create flashcards manually through `/flashcards` ensuring real-time validation of text length and required fields.
  - **Flashcard Editing (US-004):**
    - Editing is handled by the `/flashcards/{flashcardId}` endpoint, allowing inline modifications.
  - **Folder Management (US-006):**
    - Users manage folders via dedicated endpoints in section 2.2, and deletion cascades to delete contained flashcards.
  - **User Authentication (US-007):**
    - Registration and login are built with JWT token issuance to manage user sessions.

- **Security and Performance:**
  - Rate limiting is recommended to mitigate brute force and DoS attacks.
  - Indexes on `user_id` and `folder_id` (per schema) ensure efficient queries on list endpoints.
  - All operations are secured via JWT, and RLS policies in the database ensure data isolation per user.

---

## Assumptions

- The API server integrates with Supabase for database and authentication management.
- Flashcard review (Accept/Edit/Reject) is handled on the client side, and accepted flashcards proposals are finalized with a POST to `/flashcards/bulk-save`.
- Pagination, filtering, and sorting parameters can be extended as needed.

This API plan is designed to be comprehensive and scalable, with clearly defined resources, endpoints, and business logic aligned with the input requirements and technology stack.
