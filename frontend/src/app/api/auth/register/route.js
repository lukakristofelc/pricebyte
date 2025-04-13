// API endpoint for user registration

export async function POST(request) {
  try {
    const userData = await request.json();

    console.log("User data received:", userData);

    // Simple validation
    if (!userData.username || !userData.email || !userData.password_hash) {
      return Response.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Format the data for the backend
    const backendData = {
      username: userData.username,
      email: userData.email,
      password_hash: userData.password_hash // Changed to match backend expectation
    };

    // Make request to your actual backend API
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    console.log("Backend response:", backendResponse);

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Return error from backend
      return Response.json(
        { message: responseData.message || "Registration failed" },
        { status: backendResponse.status }
      );
    }

    // Return successful response with user data
    return Response.json(
      { 
        message: "User registered successfully",
        user: responseData.user
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