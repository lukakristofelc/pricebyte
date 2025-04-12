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
    const response = await fetch(
      `https://mercatoronline.si/products/browseProducts/getProducts?limit=100&offset=0&filterData%5Bsearch%5D=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Error from Mercator API: ${response.status}`);
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