export async function POST(request) {
  try {
    const { ingredient, products } = await request.json();

    const apiKeys = [
        'AIzaSyDpPlDMYoJnBuhmOLHeRpFAfVI2m1v62Hs',
        'AIzaSyD5WR4RoIY7ZtcoCwtcq7BWwYL0p4FJMeo',
    ];
    const apiKey = apiKeys[Math.floor(Date.now() / 1000) % apiKeys.length];

    const prompt = `
      Given the ingredient "${ingredient}", you are provided with an array of products. Your task is to evaluate each product and identify those that closely align with the ingredient by matching all of the following criteria:
- **Category:** The product belongs to the same category as the ingredient.
- **Purpose:** The product is designed for a purpose that aligns with the ingredient’s intended use.
- **Common Variations:** The product reflects the common variations or forms associated with the ingredient.

Once you have identified the relevant products, output only the indices (using zero-based indexing) of these products as a JSON array containing numbers. Do not include any additional text or commentary in your response.

      
      Product list:
      ${products.map((p, i) => `${i}: ${p.title} (${p.store})`).join('\n')}
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyD5WR4RoIY7ZtcoCwtcq7BWwYL0p4FJMeo",
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

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to generate content', details: errorData },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON array from the response text
    const jsonMatch = generatedText.match(/\[\s*[\d,\s]+\]/);
    try {
      const relevantIndices = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return Response.json({ relevantIndices });
    } catch {
      return Response.json({ relevantIndices: [] });
    }
  } catch (error) {
    console.error('Gemini filtering error:', error);
    return Response.error('Failed to filter products');
  }
}