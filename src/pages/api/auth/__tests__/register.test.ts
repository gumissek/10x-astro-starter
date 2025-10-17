import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { POST } from "../register";
import type { APIContext } from "astro";

// Mock Supabase client
vi.mock("@/db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
}));

// Import after mocking
import { createSupabaseServerInstance } from "@/db/supabase.client";

describe("POST /api/auth/register", () => {
  let mockRequest: Request;
  let mockCookies: APIContext["cookies"];
  let mockSupabaseClient: {
    auth: {
      signUp: Mock;
    };
  };
  let context: Pick<APIContext, "request" | "cookies">;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup mock cookies
    mockCookies = {
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      headers: vi.fn(),
    } as unknown as APIContext["cookies"];

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: vi.fn(),
      },
    };

    (createSupabaseServerInstance as Mock).mockReturnValue(mockSupabaseClient);
  });

  describe("Successful registration scenarios", () => {
    it("should successfully register a new user with valid credentials", async () => {
      // Arrange
      const validRegistration = {
        email: "newuser@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRegistration),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      const mockUser = {
        id: "new-user-id-456",
        email: "newuser@example.pl",
        aud: "authenticated",
        role: "authenticated",
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: {
            access_token: "mock-token",
            refresh_token: "mock-refresh-token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        user: {
          id: "new-user-id-456",
          email: "newuser@example.pl",
        },
      });
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "newuser@example.pl",
        password: "SecurePass123!",
        options: {
          emailRedirectTo: undefined,
        },
      });
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledTimes(1);
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: mockRequest.headers,
      });
    });

    it("should reject email with leading/trailing whitespace during validation", async () => {
      // Arrange - Email z białymi znakami nie przechodzi walidacji Zod
      const registrationWithSpaces = {
        email: "  newuser@example.pl  ",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationWithSpaces),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Wprowadź poprawny adres email");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should handle password with various special characters", async () => {
      // Arrange
      const registrationWithComplexPassword = {
        email: "user@example.pl",
        password: "C0mpl3x!@#$%^&*()P@ss",
        confirmPassword: "C0mpl3x!@#$%^&*()P@ss",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationWithComplexPassword),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "mock-token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(200);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "user@example.pl",
        password: "C0mpl3x!@#$%^&*()P@ss",
        options: {
          emailRedirectTo: undefined,
        },
      });
    });
  });

  describe("Validation errors - Email", () => {
    it("should return 400 error when email is missing", async () => {
      // Arrange
      const invalidData = {
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("error");
      expect(responseData.field).toBe("email");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when email is empty string", async () => {
      // Arrange
      const invalidData = {
        email: "",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Email jest wymagany");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when email format is invalid", async () => {
      // Arrange
      const invalidData = {
        email: "invalid-email-format",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Wprowadź poprawny adres email");
      expect(responseData.field).toBe("email");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error for email without @ symbol", async () => {
      // Arrange
      const invalidData = {
        email: "invalidemail.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Wprowadź poprawny adres email");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe("Validation errors - Password", () => {
    it("should return 400 error when password is missing", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("error");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when password is too short (less than 8 characters)", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "Short1!",
        confirmPassword: "Short1!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasło musi mieć minimum 8 znaków");
      expect(responseData.field).toBe("password");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when password lacks uppercase letter", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "lowercase123!",
        confirmPassword: "lowercase123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasło musi zawierać co najmniej jedną wielką literę");
      expect(responseData.field).toBe("password");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when password lacks digit", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "NoDigitsHere!",
        confirmPassword: "NoDigitsHere!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasło musi zawierać co najmniej jedną cyfrę");
      expect(responseData.field).toBe("password");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when password lacks special character", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "NoSpecialChar123",
        confirmPassword: "NoSpecialChar123",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasło musi zawierać co najmniej jeden znak specjalny");
      expect(responseData.field).toBe("password");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when confirmPassword is missing", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty("error");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 error when passwords do not match", async () => {
      // Arrange
      const invalidData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "DifferentPass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasła muszą być identyczne");
      expect(responseData.field).toBe("confirmPassword");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe("Registration errors - Existing user", () => {
    it("should return 400 error when user already exists (using test user)", async () => {
      // Arrange - użycie testowego użytkownika, który już istnieje
      const existingUserData = {
        email: "example5@example.pl",
        password: "Haslo123@",
        confirmPassword: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingUserData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "User already registered",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Ten adres email jest już zarejestrowany");
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "example5@example.pl",
        password: "Haslo123@",
        options: {
          emailRedirectTo: undefined,
        },
      });
    });

    it("should handle 'already registered' error message variant", async () => {
      // Arrange
      const existingUserData = {
        email: "existing@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingUserData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Email already registered with another provider",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Ten adres email jest już zarejestrowany");
    });
  });

  describe("Registration errors - Password validation by Supabase", () => {
    it("should handle Supabase password validation error", async () => {
      // Arrange
      const userData = {
        email: "user@example.pl",
        password: "WeakPass1!",
        confirmPassword: "WeakPass1!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Password is too weak",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Hasło nie spełnia wymagań bezpieczeństwa");
    });

    it("should handle Supabase email validation error", async () => {
      // Arrange
      const userData = {
        email: "invalid@example",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Email is invalid",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toContain("dres email"); // Zawiera fragment "adres email"
    });

    it("should return generic error for unknown Supabase errors", async () => {
      // Arrange
      const userData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Unknown database error",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Wystąpił błąd podczas rejestracji");
    });
  });

  describe("Registration errors - Missing user or session", () => {
    it("should return 500 error when user is created but not returned", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: null,
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Nie udało się utworzyć konta. Spróbuj ponownie.");
    });

    it("should return 500 error when session is not created", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: null,
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Nie udało się utworzyć konta. Spróbuj ponownie.");
    });

    it("should return 500 error when both user and session are null", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: null,
          session: null,
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Nie udało się utworzyć konta. Spróbuj ponownie.");
    });
  });

  describe("Server errors", () => {
    it("should return 500 error when request body is invalid JSON", async () => {
      // Arrange
      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json{",
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 500 error when Supabase client throws unexpected error", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockRejectedValue(new Error("Network error"));

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    });

    it("should log errors to console for debugging", async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      await POST(context as APIContext);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith("Registration error:", expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Response format validation", () => {
    it("should return proper Content-Type header for successful response", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should return proper Content-Type header for error response", async () => {
      // Arrange
      const invalidData = {
        email: "invalid-email",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should only return user id and email in successful response", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
            aud: "authenticated",
            role: "authenticated",
            phone: "+48123456789",
            created_at: "2024-01-01",
          },
          session: {
            access_token: "secret-token",
            refresh_token: "secret-refresh",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(responseData.user).toEqual({
        id: "user-id",
        email: "user@example.pl",
      });
      expect(responseData.user).not.toHaveProperty("aud");
      expect(responseData.user).not.toHaveProperty("role");
      expect(responseData.user).not.toHaveProperty("phone");
      expect(responseData).not.toHaveProperty("session");
      expect(responseData).toHaveProperty("success", true);
    });

    it("should include field name in validation error response", async () => {
      // Arrange
      const invalidData = {
        email: "",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(responseData).toHaveProperty("error");
      expect(responseData).toHaveProperty("field");
      expect(responseData.field).toBe("email");
    });
  });

  describe("Edge cases", () => {
    it("should handle email with special characters (plus addressing)", async () => {
      // Arrange
      const validData = {
        email: "user+test@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user+test@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.user.email).toBe("user+test@example.pl");
    });

    it("should handle very long email addresses", async () => {
      // Arrange
      const longEmail = `${"a".repeat(50)}@${"example".repeat(10)}.com`;
      const validData = {
        email: longEmail,
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: longEmail,
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.user.email).toBe(longEmail);
    });

    it("should handle password at minimum length (8 characters)", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "Pass123!",
        confirmPassword: "Pass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(200);
    });

    it("should handle password with all required character types", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "Abc12345!@#$%",
        confirmPassword: "Abc12345!@#$%",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(200);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "user@example.pl",
        password: "Abc12345!@#$%",
        options: {
          emailRedirectTo: undefined,
        },
      });
    });

    it("should handle international email addresses with Zod validation", async () => {
      // Arrange - Zod może nie obsługiwać międzynarodowych adresów email
      const validData = {
        email: "użytkownik@przykład.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert - Ten test sprawdza obecne zachowanie Zod
      // Zod z .email() nie obsługuje pełnej walidacji międzynarodowych znaków
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Wprowadź poprawny adres email");
    });
  });

  describe("Business logic validation", () => {
    it("should call createSupabaseServerInstance with correct parameters", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      await POST(context as APIContext);

      // Assert
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: mockRequest.headers,
      });
      expect(createSupabaseServerInstance).toHaveBeenCalledTimes(1);
    });

    it("should validate data structure before calling Supabase", async () => {
      // Arrange - nieprawidłowe dane, które nie przejdą walidacji
      const invalidData = {
        email: "invalid",
        password: "weak",
        confirmPassword: "weak",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      // Act
      const response = await POST(context as APIContext);

      // Assert - Supabase nie powinien być wywołany gdy walidacja się nie powiedzie
      expect(response.status).toBe(400);
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
      // createSupabaseServerInstance jest wywoływany na początku funkcji
    });

    it("should set emailRedirectTo to undefined to disable email confirmation", async () => {
      // Arrange
      const validData = {
        email: "user@example.pl",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "user@example.pl",
          },
          session: {
            access_token: "token",
          },
        },
        error: null,
      });

      // Act
      await POST(context as APIContext);

      // Assert
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "user@example.pl",
        password: "SecurePass123!",
        options: {
          emailRedirectTo: undefined,
        },
      });
    });
  });
});
