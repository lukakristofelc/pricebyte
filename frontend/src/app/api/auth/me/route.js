// API endpoint to get the current authenticated user's information

export async function GET(request) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    console.log("Token:", token);
    // If no token exists, user is not authenticated
    if (!token) {
      return Response.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Make request to your backend API to validate token and get user info
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      // Token is invalid or user doesn't exist
      return Response.json(
        { message: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Return the user data from backend
    const userData = await backendResponse.json();
    return Response.json(userData, { status: 200 });
  } catch (error) {
    console.error("Authentication check error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}