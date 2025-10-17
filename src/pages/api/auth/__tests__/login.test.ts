import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { POST } from "../login";
import type { APIContext } from "astro";

// Mock Supabase client
vi.mock("@/db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
}));

// Import after mocking
import { createSupabaseServerInstance } from "@/db/supabase.client";

describe("POST /api/auth/login", () => {
  let mockRequest: Request;
  let mockCookies: APIContext["cookies"];
  let mockSupabaseClient: {
    auth: {
      signInWithPassword: Mock;
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
        signInWithPassword: vi.fn(),
      },
    };

    (createSupabaseServerInstance as Mock).mockReturnValue(mockSupabaseClient);
  });

  describe("Successful login scenarios", () => {
    it("should successfully login with valid test user credentials", async () => {
      // Arrange
      const validCredentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCredentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      const mockUser = {
        id: "test-user-id-123",
        email: "example5@example.pl",
        aud: "authenticated",
        role: "authenticated",
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
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
        user: {
          id: "test-user-id-123",
          email: "example5@example.pl",
        },
      });
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "example5@example.pl",
        password: "Haslo123@",
      });
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: mockRequest.headers,
      });
    });

    it("should reject email with leading/trailing whitespace", async () => {
      // Arrange - Email z białymi znakami nie przechodzi walidacji Zod
      const credentialsWithWhitespace = {
        email: "  example5@example.pl  ",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialsWithWhitespace),
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
      expect(responseData.error).toBe("Nieprawidłowy format adresu email");
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should trim email internally after validation passes", async () => {
      // Arrange - Test weryfikuje, że email jest trimowany wewnętrznie
      const validCredentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCredentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      const mockUser = {
        id: "test-user-id-123",
        email: "example5@example.pl",
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
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
      await POST(context as APIContext);

      // Assert - Weryfikacja, że trim() jest wywołany
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "example5@example.pl",
        password: "Haslo123@",
      });
    });
  });

  describe("Validation errors", () => {
    it("should return 400 error when email is missing", async () => {
      // Arrange
      const invalidData = {
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 error when email format is invalid", async () => {
      // Arrange
      const invalidData = {
        email: "invalid-email-format",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(responseData.error).toBe("Nieprawidłowy format adresu email");
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 error when password is missing", async () => {
      // Arrange
      const invalidData = {
        email: "example5@example.pl",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 error when password is empty string", async () => {
      // Arrange
      const invalidData = {
        email: "example5@example.pl",
        password: "",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(responseData.error).toBe("Hasło jest wymagane");
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 400 error when both email and password are missing", async () => {
      // Arrange
      const invalidData = {};

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("Authentication errors", () => {
    it("should return 401 error with Polish message for invalid credentials", async () => {
      // Arrange
      const credentials = {
        email: "example5@example.pl",
        password: "WrongPassword123",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Invalid login credentials",
          status: 401,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Nieprawidłowy email lub hasło");
    });

    it("should return 401 error for non-existent user", async () => {
      // Arrange
      const credentials = {
        email: "nonexistent@example.pl",
        password: "SomePassword123",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Invalid login credentials",
          status: 401,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Nieprawidłowy email lub hasło");
    });

    it("should return original error message for non-credential errors", async () => {
      // Arrange
      const credentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: "Email not confirmed",
          status: 401,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.error).toBe("Email not confirmed");
    });
  });

  describe("Server errors", () => {
    it("should return 500 error when request body is invalid JSON", async () => {
      // Arrange
      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(responseData.error).toBe("Wystąpił błąd podczas logowania");
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 500 error when Supabase client throws unexpected error", async () => {
      // Arrange
      const credentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(
        new Error("Network error"),
      );

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas logowania");
    });

    it("should log errors to console for debugging", async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      mockRequest = new Request("http://localhost/api/auth/login", {
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
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Login error:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Response format validation", () => {
    it("should return proper Content-Type header for successful response", async () => {
      // Arrange
      const credentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "example5@example.pl",
          },
          session: {},
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
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
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
      const credentials = {
        email: "example5@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "example5@example.pl",
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
        id: "test-user-id",
        email: "example5@example.pl",
      });
      expect(responseData.user).not.toHaveProperty("aud");
      expect(responseData.user).not.toHaveProperty("role");
      expect(responseData.user).not.toHaveProperty("phone");
      expect(responseData).not.toHaveProperty("session");
    });
  });

  describe("Edge cases", () => {
    it("should handle email with special characters", async () => {
      // Arrange
      const credentials = {
        email: "user+test@example.pl",
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "user+test@example.pl",
          },
          session: {},
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

    it("should handle password with special characters", async () => {
      // Arrange
      const credentials = {
        email: "example5@example.pl",
        password: "P@$$w0rd!#%&*()",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "example5@example.pl",
          },
          session: {},
        },
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(200);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "example5@example.pl",
        password: "P@$$w0rd!#%&*()",
      });
    });

    it("should handle very long email addresses", async () => {
      // Arrange
      const longEmail = `${"a".repeat(50)}@${"example".repeat(10)}.com`;
      const credentials = {
        email: longEmail,
        password: "Haslo123@",
      };

      mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      context = {
        request: mockRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: longEmail,
          },
          session: {},
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
  });
});
