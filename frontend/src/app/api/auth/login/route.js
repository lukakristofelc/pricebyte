import SHA256 from 'crypto-js/sha256';

// API endpoint for user login

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

    // Hash the password
    const password_hash = SHA256(password).toString();

    // Make request to your actual backend API
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password_hash }), // Send hashed password
    });

    const responseData = await backendResponse.json();

    console.log("Backend response:", responseData);

    if (!backendResponse.ok) {
      // Return error from backend
      return Response.json(
        { message: responseData.message || "Login failed" },
        { status: backendResponse.status }
      );
    }

    // Create response with cookies and JSON body
    // Extend token lifespan to 7 days (604800 seconds) to keep users logged in longer
    const response = new Response(
      JSON.stringify({ 
        success: responseData.success,
        message: "Login successful" 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${responseData.token}; HttpOnly; Secure=${process.env.NODE_ENV === "production"}; SameSite=Strict; Path=/; Max-Age=${604800}`
        }
      }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}