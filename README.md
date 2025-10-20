# 10x-Cards-Flipper 555

![Build Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [Testing Strategy](#testing-strategy)
- [License](#license)

## Project Description

**10x-Cards-Flipper** is an innovative web application designed for creating and learning educational flashcards. The project aims to simplify the process of flashcard creation by integrating AI-powered generation with a manual editing workflow. Ideal for users learning English (from Polish), the application offers features including flashcard generation from text inputs, manual creation, real-time validations, and an intuitive review process—all while ensuring that users retain control over the final content.

## Tech Stack

- **Frontend:**
  - **Astro 5** – Build fast, content-centric websites with minimal JavaScript.
  - **React 19** – Develop interactive UI components.
  - **TypeScript 5** – Ensure robust type safety and enhanced developer experience.
  - **Tailwind CSS 4** – Utilize a utility-first CSS framework for rapid UI development.
  - **Shadcn/ui** – Leverage a collection of accessible and reusable React components.
- **Backend:**
  - **Supabase** – Use an open-source Firebase alternative offering PostgreSQL, authentication, and backend services.
- **AI Integration:**
  - **OpenRouter.ai** – Access a wide range of large language models (including GPT-4o-mini) for efficient AI-driven flashcard generation.
- **CI/CD & Hosting:**
  - **GitHub Actions** – Automate build and deployment pipelines.
  - **DigitalOcean** – Host the application via Docker images.
- **Testing:**
  - **Vitest** – JavaScript testing framework for unit and integration tests.
  - **React Testing Library** – Test React components with focus on user behavior.
  - **Playwright** – End-to-end testing framework for browser automation.

## Getting Started Locally

### Prerequisites

- **Node.js v22.14.0**  
  The project uses Node.js version as specified in the `.nvmrc` file. It is recommended to use a Node version manager like `nvm`.

### Installation Steps

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/gumissek/10x-astro-starter.git
   ```
2. **Install Dependencies:**
   ```sh
   npm install
   ```
3. **Environment Variables:**
   Create a `.env` file in the project root and set up the required variables for Supabase and other services.
4. **Start the Development Server:**
   ```sh
   npm run dev
   ```
   The application should now be accessible at `http://localhost:3000`.

## Available Scripts

Within the project directory, the following npm scripts are available:

- **`npm run dev`** – Runs the application in development mode.
- **`npm run build`** – Builds the application for production deployment.
- **`npm run preview`** – Serves the production build locally.
- **`npm run astro`** – Utility command for Astro.
- **`npm run format`** – Formats the codebase using Prettier.

## Project Scope

### MVP Inclusions

- **AI-Powered Flashcard Generation:**  
  Users can input text (up to 5000 characters) to generate flashcards automatically, subject to character limitations (front: max 200, back: max 500).
- **Flashcard Review Process:**  
  Generated cards are presented with options to Accept, Edit, or Reject, ensuring user control over content quality.
- **Manual Flashcard Creation:**  
  A form enables users to manually create flashcards with real-time validation (character counters and required fields).
- **CRUD Operations:**  
  Manage flashcards and folders effectively, including cascading deletions for flashcard folders.
- **Study Mode:**  
  Engage in full-screen study sessions with a simplified spaced repetition system, and track performance via review statistics.
- **User Authentication:**  
  Secure user registration and login (email/password) with JWT-based session management.

### Exclusions from MVP

- Advanced spaced repetition algorithms (e.g., SM-2, SuperMemo).
- Importing flashcards from external file formats (only copy-paste is supported).
- Sharing flashcards between users.
- Native mobile applications (web version only).
- Password reset functionality.
- Dark mode.
- Advanced automated testing.
- Exporting flashcards to other platforms (e.g., Anki, Quizlet).

## Project Status

The project is currently **in development**. The team is actively working on the MVP, with iterative improvements and incremental feature additions planned.

## Testing Strategy

The project employs a comprehensive testing strategy, combining unit tests for backend logic and end-to-end (E2E) tests for user-facing flows.

### Unit Tests

Unit tests are written with **Vitest** to ensure the reliability and correctness of individual API endpoints. The tests cover successful cases, validation rules, error handling, and edge cases.

-   **Registration (`/api/auth/register`):** A suite of **37 tests** validates user registration logic, including password policies, email format, existing user checks, and secure data handling.
-   **Login (`/api/auth/login`):** **20 tests** cover the authentication process, ensuring correct handling of valid and invalid credentials, input validation, and proper error responses.
-   **Logout (`/api/auth/logout`):** **30 tests** verify the session termination process, including handling of active sessions, idempotency, and server-side errors.
-   **AI Flashcard Generation (`/api/flashcards/generate`):** A comprehensive set of **37 tests** ensures the AI generation endpoint correctly validates input, handles errors from the AI service, and transforms data into the expected format.

### End-to-End (E2E) Tests

E2E tests are implemented using **Playwright** and follow the **Page Object Model (POM)** pattern to simulate real user interactions and ensure critical flows work as expected.

-   **Registration Flow:** These tests validate the entire user registration journey. The `RegisterPage` POM handles form interactions, ensuring that input validation (for email and password) works correctly and that users receive appropriate feedback for both successful and failed registration attempts.
-   **Login Flow:** This suite covers the complete login and dashboard access workflow. The `LoginPage` and `DashboardPage` POMs are used to test successful authentication, handling of incorrect credentials, and validation of the post-login user experience.

## License

This project is licensed under the **MIT License**. Please refer to the `LICENSE` file for more details.
