import axios from 'axios';

const NEWS_API_KEY = import.meta.env.VITE_NEWSAPI_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

class NewsService {
  async getStartupNews(): Promise<NewsArticle[]> {
    const isDev = import.meta.env.DEV;
    
    try {
      let response;
      
      if (isDev) {
        // Direct call for local development (localhost is allowed by NewsAPI free tier)
        if (!NEWS_API_KEY) {
          console.error('NewsAPI key is missing in .env');
          return [];
        }
        response = await axios.get(`${BASE_URL}/everything`, {
          params: {
            q: 'startup OR "venture capital" OR entrepreneurship',
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 20,
            apiKey: NEWS_API_KEY,
          },
        });
      } else {
        // Call our Vercel Serverless Function in production to bypass domain restrictions
        response = await axios.get('/api/news');
      }

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
