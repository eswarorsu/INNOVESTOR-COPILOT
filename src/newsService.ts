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
    if (!NEWS_API_KEY) {
      console.error('NewsAPI key is missing');
      return [];
    }

    try {
      // Querying for startup, venture capital, and entrepreneurship news
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: 'startup OR "venture capital" OR entrepreneurship',
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 20,
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
