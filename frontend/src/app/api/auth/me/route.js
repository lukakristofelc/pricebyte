// API route to get the current authenticated user's information
// In a real app, this would verify the JWT token and return user data from the database

export async function GET(request) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;

    // If no token exists, user is not authenticated
    if (!token) {
      return Response.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // In a real app, you would verify the JWT token and fetch user data
    // This is a mock implementation that assumes the token is valid
    
    // Mock user data - in a real app, this would come from database lookup
    // after verifying the token
    const user = {
      id: "1",
      name: "Test User",
      email: "user@example.com",
    };

    return Response.json(user, { status: 200 });
  } catch (error) {
    console.error("Authentication check error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}