// Mock implementation of the registration API endpoint
// In a real application, this would store user data in a database

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Simple validation
    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // In a real app, check if user already exists and hash the password
    // This is just a mock implementation
    
    // Mock successful registration
    return Response.json(
      { 
        message: "User registered successfully",
        user: { name, email, id: Math.random().toString(36).substring(2, 9) }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}