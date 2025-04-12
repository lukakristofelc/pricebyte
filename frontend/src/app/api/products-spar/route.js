export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Using the SPAR API endpoint with the query parameter
    const sparUrl = `https://search-spar.spar-ics.com/fact-finder/rest/v4/search/products_lmos_si?query=jajca&page=1&hitsPerPage=400&sid=MS43YzRzd21kdHBoU2F0IEFwciAxMiAyMDI1&useAsn=false&substringFilter=title:!product-number`;
    
    const response = await fetch(sparUrl);
    
    if (!response.ok) {
      throw new Error(`Error from SPAR API: ${response.status}`);
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}