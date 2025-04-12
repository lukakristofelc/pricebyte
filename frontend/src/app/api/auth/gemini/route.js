import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse request body to get the user's input
    const { input } = await request.json();
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `Return this string as a much simplified broad search query for an online store in slovenian: ${input}`;
    
    // Call the Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDpPlDMYoJnBuhmOLHeRpFAfVI2m1v62Hs",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to generate content', details: errorData },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    
    // Extract the generated text from the response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return NextResponse.json({ result: generatedText });
    
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

