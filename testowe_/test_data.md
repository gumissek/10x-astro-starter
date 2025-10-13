# API Endpoints Documentation and Test Data

This document provides detailed descriptions and test data for each API endpoint.

---

## 1. Authentication

### Endpoint: Authentication
- **Method:** (Not specified)
- **Required data:** (Not specified)
- **Optional data:** (Not specified)
- **Test Data:** (Not specified)
- **Expected result for correct data:** (Not specified)
- **Edge cases:** (Not specified)

---

## 2. Folders

### 2.1 List Folders
- **Endpoint:** `/folders`
- **Method:** GET
- **Required data:**
  - Query parameter: `user_id` (UUID)
- **Optional data:**
  - Query parameters: `page` (default: 1), `limit` (default: 10)
- **Test Data:**
  ```json
  { "user_id": "123e4567-e89b-12d3-a456-426614174000", "page": 1, "limit": 10 }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response containing a list of folders and pagination details.
- **Edge cases:**
  - Missing `user_id`
  - Invalid UUID format
  - Non-numeric `page` or `limit` values

---

### 2.2 Get Folder Details
- **Endpoint:** `/folders/{folderId}`
- **Method:** GET
- **Required data:**
  - URL parameter: `folderId` (UUID)
  - Query parameter: `user_id` (UUID)
- **Optional data:** None
- **Test Data:**
  ```json
  { "folderId": "123e4567-e89b-12d3-a456-426614174000", "user_id": "123e4567-e89b-12d3-a456-426614174001" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response with folder details including `flashcard_count`.
- **Edge cases:**
  - Invalid `folderId`
  - Missing `user_id`
  - Folder not found

---

### 2.3 Create Folder
- **Endpoint:** `/folders`
- **Method:** POST
- **Required data:**
  - Request payload:
    ```json
    { "name": "New Folder Name", "user_id": "<UUID>" }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  { "name": "My Folder", "user_id": "123e4567-e89b-12d3-a456-426614174001" }
  ```
- **Expected result for correct data:**
  - Status: 201
  - JSON response containing the created folder details.
- **Edge cases:**
  - Missing `name` or `user_id`
  - Duplicated folder name

---

### 2.4 Update Folder
- **Endpoint:** `/folders/{folderId}`
- **Method:** PUT
- **Required data:**
  - URL parameter: `folderId` (UUID)
  - Query parameter: `user_id` (UUID)
  - Request payload:
    ```json
    { "name": "Updated Folder Name" }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  { "folderId": "123e4567-e89b-12d3-a456-426614174000", "user_id": "123e4567-e89b-12d3-a456-426614174001", "name": "Updated Folder Name" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response with updated folder details.
- **Edge cases:**
  - Missing `user_id`
  - Folder not found
  - Duplicated folder name

---

### 2.5 Delete Folder
- **Endpoint:** `/folders/{folderId}`
- **Method:** DELETE
- **Required data:**
  - URL parameter: `folderId` (UUID)
  - Query parameter: `user_id` (UUID)
- **Optional data:** None
- **Test Data:**
  ```json
  { "folderId": "123e4567-e89b-12d3-a456-426614174000", "user_id": "123e4567-e89b-12d3-a456-426614174001" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - Confirmation message.
- **Edge cases:**
  - Missing `user_id`
  - Folder not found

---

## 3. Flashcards

### 3.1 List Flashcards
- **Endpoint:** `/flashcards`
- **Method:** GET
- **Required data:** None (Assumes user is authenticated)
- **Optional data:**
  - Query parameters: `folderId`, `page` (default: 1), `limit` (default: 10), `sortBy`, `order`
- **Test Data:**
  ```json
  { "folderId": "123e4567-e89b-12d3-a456-426614174000", "page": 1, "limit": 10, "sortBy": "created_at", "order": "asc" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response containing a list of flashcards and pagination details.
- **Edge cases:**
  - Invalid query parameters
  - No flashcards found

---

### 3.2 Get Flashcard Details
- **Endpoint:** `/flashcards/{flashcardId}`
- **Method:** GET
- **Required data:**
  - URL parameter: `flashcardId` (UUID)
- **Optional data:** None
- **Test Data:**
  ```json
  { "flashcardId": "123e4567-e89b-12d3-a456-426614174002" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response with flashcard details.
- **Edge cases:**
  - Invalid `flashcardId`
  - Flashcard not found

---

### 3.3 Create Flashcard (Manual or AI Acceptance)
- **Endpoint:** `/flashcards`
- **Method:** POST
- **Required data:**
  - Request payload:
    ```json
    {
      "front": "Flashcard front text",
      "back": "Flashcard back text",
      "folder_id": "<UUID>",
      "generation_source": "manual"  // or "ai"
    }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  {
    "front": "What is AI?",
    "back": "Artificial Intelligence",
    "folder_id": "123e4567-e89b-12d3-a456-426614174000",
    "generation_source": "manual"
  }
  ```
- **Expected result for correct data:**
  - Status: 201
  - JSON response containing the created flashcard details.
- **Edge cases:**
  - Missing required fields
  - Text length limits exceeded
  - Invalid `generation_source`

---

### 3.4 Update Flashcard
- **Endpoint:** `/flashcards/{flashcardId}`
- **Method:** PUT
- **Required data:**
  - URL parameter: `flashcardId` (UUID)
  - Request payload:
    ```json
    {
      "front": "Updated text",
      "back": "Updated text",
      "folder_id": "<UUID>",
      "generation_source": "manual"  // or "ai"
    }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  {
    "flashcardId": "123e4567-e89b-12d3-a456-426614174002",
    "front": "Updated front",
    "back": "Updated back",
    "folder_id": "123e4567-e89b-12d3-a456-426614174000",
    "generation_source": "manual"
  }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response with updated flashcard details.
- **Edge cases:**
  - Missing fields
  - Validation errors
  - Flashcard not found

---

### 3.5 Delete Flashcard
- **Endpoint:** `/flashcards/{flashcardId}`
- **Method:** DELETE
- **Required data:**
  - URL parameter: `flashcardId` (UUID)
- **Optional data:** None
- **Test Data:**
  ```json
  { "flashcardId": "123e4567-e89b-12d3-a456-426614174002" }
  ```
- **Expected result for correct data:**
  - Status: 200
  - Confirmation message.
- **Edge cases:**
  - Flashcard not found

---

### 3.6 Generate Flashcards via AI
- **Endpoint:** `/flashcards/generate`
- **Method:** POST
- **Required data:**
  - Request payload:
    ```json
    { "text": "Text for flashcard generation" }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  { "text": "Input text for generating flashcards..." }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response containing a `suggested_folder_name` and `flashcards_proposals`.
- **Edge cases:**
  - Missing text
  - Text exceeding 5000 characters

---

## 4. Statistics and Bulk Operations

### 4.1 Bulk Save Accepted Flashcards
- **Endpoint:** `/flashcards/bulk-save`
- **Method:** POST
- **Required data:**
  - Request payload:
    ```json
    {
      "user_id": "<UUID>",
      "folder_id": "<UUID>",
      "flashcards": [
        { "front": "Text", "back": "Text", "generation_source": "ai" }
      ]
    }
    ```
- **Optional data:** None
- **Test Data:**
  ```json
  {
    "user_id": "123e4567-e89b-12d3-a456-426614174001",
    "folder_id": "123e4567-e89b-12d3-a456-426614174000",
    "flashcards": [ { "front": "Answer", "back": "Explanation", "generation_source": "ai" } ]
  }
  ```
- **Expected result for correct data:**
  - Status: 200
  - JSON response with a confirmation message and a list of created flashcard IDs.
- **Edge cases:**
  - Missing `user_id`
  - Invalid flashcard entries or empty `flashcards` array
