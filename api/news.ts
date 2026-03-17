import axios from 'axios';

export default async function handler(req, res) {
  // Extract API key from environment variables
  // Vercel handles secrets via process.env
  const apiKey = process.env.VITE_NEWSAPI_API_KEY || process.env.NEWSAPI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'NewsAPI key is missing on the server' });
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'startup OR "venture capital" OR entrepreneurship',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 20,
        apiKey: apiKey,
      },
      headers: {
        // Some APIs require a User-Agent header when called from a server
        'User-Agent': 'Innovestor-Copilot-App'
      }
    });

    // Set CORS headers so your frontend can call this function
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Error fetching news from provider';
    return res.status(status).json({ error: message });
  }
}
