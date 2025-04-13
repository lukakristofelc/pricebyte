import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

        const apiKeys = [
        'AIzaSyDpPlDMYoJnBuhmOLHeRpFAfVI2m1v62Hs',
        'AIzaSyD5WR4RoIY7ZtcoCwtcq7BWwYL0p4FJMeo',
    ];
    const apiKey = apiKeys[Math.floor(Date.now() / 1000) % apiKeys.length];


    // Prepare the prompt for Gemini
    const prompt = `Transform the following detailed ingredient description into a simplified, broad Slovenian search query. Remove brand names, adjectives, and any extra descriptors so that only the essential product name remains. For instance, 'Shredded low-moisture mozzarella cheese' should become 'mozzarella' in Slovenian. Return only the simplified product name in Slovenia, if there is multiple items choose one: ${input}`;
    
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

