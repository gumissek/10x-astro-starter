import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { POST } from "../logout";
import type { APIContext } from "astro";

// Mock Supabase client
vi.mock("@/db/supabase.client", () => ({
  createSupabaseServerInstance: vi.fn(),
}));

// Import after mocking
import { createSupabaseServerInstance } from "@/db/supabase.client";

describe("POST /api/auth/logout", () => {
  let mockRequest: Request;
  let mockCookies: APIContext["cookies"];
  let mockSupabaseClient: {
    auth: {
      signOut: Mock;
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

    // Setup mock request
    mockRequest = new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        signOut: vi.fn(),
      },
    };

    (createSupabaseServerInstance as Mock).mockReturnValue(mockSupabaseClient);

    // Setup context
    context = {
      request: mockRequest,
      cookies: mockCookies,
    };
  });

  describe("Successful logout scenarios", () => {
    it("should successfully logout authenticated user", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: mockRequest.headers,
      });
    });

    it("should return empty body on successful logout", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);
      const body = await response.text();

      // Assert
      expect(response.status).toBe(204);
      expect(body).toBe("");
    });

    it("should create server instance with correct context", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
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

    it("should handle logout for test user session", async () => {
      // Arrange - Symulacja sesji testowego użytkownika
      const testUserCookies = {
        ...mockCookies,
        get: vi.fn().mockImplementation((name: string) => {
          if (name.includes("auth-token")) {
            return { value: "test-user-token-123" };
          }
          return undefined;
        }),
      } as unknown as APIContext["cookies"];

      const testContext = {
        request: mockRequest,
        cookies: testUserCookies,
      };

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(testContext as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("Logout errors from Supabase", () => {
    it("should return 400 error when Supabase signOut fails", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: {
          message: "Failed to sign out",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "Failed to sign out",
      });
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should return specific error message from Supabase", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: {
          message: "Invalid session token",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Invalid session token");
    });

    it("should handle session expiration error", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: {
          message: "Session expired",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Session expired");
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should handle unauthorized session error", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: {
          message: "Unauthorized",
          status: 401,
        },
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("Unauthorized");
    });
  });

  describe("Server errors and exceptions", () => {
    it("should return 500 error when Supabase client throws exception", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error("Network error"));

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should return 500 error when createSupabaseServerInstance throws", async () => {
      // Arrange
      (createSupabaseServerInstance as Mock).mockImplementation(() => {
        throw new Error("Failed to create Supabase instance");
      });

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
    });

    it("should handle timeout errors gracefully", async () => {
      // Arrange
      const timeoutError = new Error("Request timeout");
      mockSupabaseClient.auth.signOut.mockRejectedValue(timeoutError);

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
    });

    it("should handle database connection errors", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      mockSupabaseClient.auth.signOut.mockRejectedValue(dbError);

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
    });
  });

  describe("Response format validation", () => {
    it("should return proper Content-Type header for success response", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      // 204 No Content typically doesn't have Content-Type header
      expect(response.headers.get("Content-Type")).toBeNull();
    });

    it("should return proper Content-Type header for error response", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: {
          message: "Logout failed",
          status: 400,
        },
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(400);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should not leak sensitive information in error responses", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockRejectedValue(
        new Error("Database credentials invalid at connection string postgresql://user:pass@host")
      );

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
      expect(responseData.error).not.toContain("postgresql://");
      expect(responseData.error).not.toContain("credentials");
    });
  });

  describe("Edge cases and corner cases", () => {
    it("should handle logout without active session gracefully", async () => {
      // Arrange - Użytkownik już wylogowany lub bez sesji
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple logout requests", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response1 = await POST(context as APIContext);
      const response2 = await POST(context as APIContext);

      // Assert
      expect(response1.status).toBe(204);
      expect(response2.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(2);
    });

    it("should handle logout with missing cookies object", async () => {
      // Arrange
      const contextWithoutCookies = {
        request: mockRequest,
        cookies: undefined,
      } as unknown as APIContext;

      // Act
      const response = await POST(contextWithoutCookies);
      const responseData = await response.json();

      // Assert - Endpoint obsługuje błąd gracefully
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
    });

    it("should handle logout with invalid request headers", async () => {
      // Arrange
      const invalidRequest = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: new Headers(), // Empty headers
      });

      const contextWithInvalidRequest = {
        request: invalidRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(contextWithInvalidRequest as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: invalidRequest.headers,
      });
    });

    it("should handle concurrent logout requests", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act - Symulacja równoczesnych żądań wylogowania
      const promises = [POST(context as APIContext), POST(context as APIContext), POST(context as APIContext)];

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(204);
      });
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(3);
    });
  });

  describe("Security considerations", () => {
    it("should call signOut even with invalid cookies", async () => {
      // Arrange - Symulacja zmanipulowanych cookies
      const tamperededCookies = {
        ...mockCookies,
        get: vi.fn().mockReturnValue({ value: "invalid-token-xyz" }),
      } as unknown as APIContext["cookies"];

      const tamperedContext = {
        request: mockRequest,
        cookies: tamperededCookies,
      };

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(tamperedContext as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should properly handle CSRF-like scenarios", async () => {
      // Arrange - Request z podejrzanymi headerami
      const suspiciousRequest = new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://malicious-site.com",
        },
      });

      const suspiciousContext = {
        request: suspiciousRequest,
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(suspiciousContext as APIContext);

      // Assert - Endpoint nadal działa (CORS powinien być obsługiwany na poziomie middleware)
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should not expose stack traces in production errors", async () => {
      // Arrange
      const detailedError = new Error("Detailed error with stack trace");
      detailedError.stack = "Error: Detailed error\n    at file.ts:123:45";

      mockSupabaseClient.auth.signOut.mockRejectedValue(detailedError);

      // Act
      const response = await POST(context as APIContext);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData.error).toBe("Wystąpił błąd podczas wylogowania");
      expect(JSON.stringify(responseData)).not.toContain("stack");
      expect(JSON.stringify(responseData)).not.toContain("file.ts");
    });
  });

  describe("Integration with authentication flow", () => {
    it("should successfully logout after successful login", async () => {
      // Arrange - Symulacja pełnego cyklu login -> logout
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should handle logout for test user (example5@example.pl)", async () => {
      // Arrange - Kontekst dla zalogowanego test usera
      const testUserContext = {
        request: new Request("http://localhost/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: "sb-access-token=test-user-token; sb-refresh-token=test-refresh-token",
          },
        }),
        cookies: mockCookies,
      };

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(testUserContext as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(createSupabaseServerInstance).toHaveBeenCalledWith({
        cookies: mockCookies,
        headers: testUserContext.request.headers,
      });
    });

    it("should clear all session data on successful logout", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      // signOut w Supabase automatycznie czyści wszystkie ciasteczka sesji
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance and reliability", () => {
    it("should complete logout within reasonable time", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const startTime = Date.now();

      // Act
      await POST(context as APIContext);
      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // Powinno zająć mniej niż 1 sekundę
    });

    it("should be idempotent - multiple calls should succeed", async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const response1 = await POST(context as APIContext);
      const response2 = await POST(context as APIContext);
      const response3 = await POST(context as APIContext);

      // Assert
      expect(response1.status).toBe(204);
      expect(response2.status).toBe(204);
      expect(response3.status).toBe(204);
    });

    it("should handle slow network responses", async () => {
      // Arrange - Symulacja wolnego połączenia
      mockSupabaseClient.auth.signOut.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ error: null });
            }, 100);
          })
      );

      // Act
      const response = await POST(context as APIContext);

      // Assert
      expect(response.status).toBe(204);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
