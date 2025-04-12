// Mock implementation of the login API endpoint
// In a real application, this would validate credentials against a database
// and generate a proper JWT token

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Simple validation
    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Mock authentication - in a real app, validate against database
    // and use a proper authentication system
    if (email === "user@example.com" && password === "password") {
      // Create a sample user object
      const user = {
        id: "1",
        name: "Test User",
        email: "user@example.com",
      };

      // In a real app, generate a proper JWT token
      const token = "mock-jwt-token";

      // Set the token as an HTTP-only cookie for security
      const response = Response.json(
        { user, message: "Login successful" },
        { status: 200 }
      );

      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        // Expire in 7 days
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // If credentials don't match
    return Response.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}