// API route to handle user logout by clearing the auth token cookie

export async function POST() {
  try {
    // Create a response
    const response = Response.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth token cookie
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      // Set expiry to past date to delete the cookie
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}