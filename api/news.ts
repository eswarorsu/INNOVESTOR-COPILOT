import axios from 'axios';

export default async function handler(req: any, res: any) {
  // Extract API key from environment variables
  // Vercel handles secrets via process.env
  const apiKey = process.env.VITE_NEWSAPI_API_KEY || process.env.NEWSAPI_API_KEY;
  const newsDataKey = process.env['VITE_NewsData.io_API_KEY'] || process.env.NEWSDATA_API_KEY;

  if (!apiKey && !newsDataKey) {
    return res.status(500).json({ error: 'News API keys are missing on the server' });
  }

  try {
    const date = req.query.date;
    const region = req.query.region;
    let queryStr = '("startup" OR "founder") AND ("growth" OR "scale" OR "unicorn" OR "funding" OR "venture capital" OR "seed round" OR "strategy" OR "failure" OR "pivot" OR "ecosystem" OR "buildinpublic")';
    
    if (region === 'india') {
      queryStr += ' AND ("india" OR "indian")';
    }

    // 1. Fetch from NewsAPI
    const newsApiPromise = apiKey ? axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: queryStr,
        sortBy: 'relevancy',
        language: 'en',
        pageSize: 50,
        from: date,
        to: date,
        apiKey: apiKey,
      },
      headers: { 'User-Agent': 'Innovestor-Copilot-App' }
    }).then(res => res.data.articles || []) : Promise.resolve([]);

    // 2. Fetch from NewsData.io
    const newsDataParams: any = {
      apikey: newsDataKey,
      q: 'startup AND (funding OR growth OR ecosystem)',
      language: 'en',
      category: 'business,technology',
    };

    if (region === 'india') {
      newsDataParams.country = 'in';
    }

    const newsDataPromise = newsDataKey ? axios.get('https://newsdata.io/api/1/news', {
      params: newsDataParams
    }).then(res => {
      const results = res.data.results || [];
      return results.map((item: any) => ({
        title: item.title,
        description: item.description,
        url: item.link,
        urlToImage: item.image_url,
        publishedAt: item.pubDate,
        source: {
          name: item.source_id || 'NewsData.io'
        }
      }));
    }) : Promise.resolve([]);

    // Run both concurrently
    const [newsApiResult, newsDataResult] = await Promise.allSettled([newsApiPromise, newsDataPromise]);

    let combinedArticles: any[] = [];
    if (newsApiResult.status === 'fulfilled') {
      combinedArticles = [...combinedArticles, ...newsApiResult.value];
    }
    if (newsDataResult.status === 'fulfilled') {
      combinedArticles = [...combinedArticles, ...newsDataResult.value];
    }

    // Sort combined articles by date descending
    combinedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Set CORS headers so your frontend can call this function
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    return res.status(200).json({ articles: combinedArticles });
  } catch (error: any) {
    console.error('Proxy Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Error fetching news from provider';
    return res.status(status).json({ error: message });
  }
}
