import axios from 'axios';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const newsDataParams: Record<string, string | number | undefined> = {
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
      return results.map((item: {
        title: string;
        description: string;
        link: string;
        image_url: string;
        pubDate: string;
        source_id: string;
      }) => ({
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

    // 3. Fetch from StartupByDoc (WordPress REST API)
    const startupByDocPromise = axios.get('https://startupbydoc.com/wp-json/wp/v2/posts?_embed&per_page=10', {
      headers: { 'User-Agent': 'Innovestor-Copilot-App' }
    }).then(res => {
      const posts = res.data || [];
      return posts.map((post: {
        _embedded?: {
          'wp:featuredmedia'?: Array<{ source_url: string }>;
        };
        title: { rendered: string };
        excerpt: { rendered: string };
        link: string;
        date: string;
      }) => {
        let imageUrl = '';
        if (post._embedded?.['wp:featuredmedia']?.[0]) {
          imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
        }
        return {
          title: post.title.rendered,
          description: post.excerpt.rendered.replace(/<[^>]*>?/gm, ''),
          url: post.link,
          urlToImage: imageUrl,
          publishedAt: post.date,
          source: { name: 'StartupByDoc' }
        };
      });
    }).catch(err => {
      console.error('StartupByDoc Error:', err.message);
      return [];
    });

    // Run all concurrently
    const [newsApiResult, newsDataResult, startupByDocResult] = await Promise.allSettled([
      newsApiPromise, 
      newsDataPromise,
      startupByDocPromise
    ]);

    let combinedArticles: any[] = [];
    if (newsApiResult.status === 'fulfilled') {
      combinedArticles = [...combinedArticles, ...newsApiResult.value];
    }
    if (newsDataResult.status === 'fulfilled') {
      combinedArticles = [...combinedArticles, ...newsDataResult.value];
    }
    if (startupByDocResult.status === 'fulfilled') {
      combinedArticles = [...combinedArticles, ...startupByDocResult.value];
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
