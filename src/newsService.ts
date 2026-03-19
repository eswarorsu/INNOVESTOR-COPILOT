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
  author?: string;
  category?: string;
}

class NewsService {
  async getStartupByDocNews(): Promise<NewsArticle[]> {
    try {
      const response = await axios.get('https://startupbydoc.com/wp-json/wp/v2/posts?_embed&per_page=10');
      const posts = response.data;
      
      return posts.map((post: any) => {
        // Extract featured image if available
        let imageUrl = '';
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
          imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
        }

        return {
          title: post.title.rendered,
          description: post.excerpt.rendered.replace(/<[^>]*>?/gm, ''), // Strip HTML tags
          url: post.link,
          urlToImage: imageUrl,
          publishedAt: post.date,
          source: { name: 'StartupByDoc' },
          author: post._embedded?.author?.[0]?.name || 'StartupByDoc Team'
        };
      });
    } catch (error) {
      console.error('Error fetching StartupByDoc news:', error);
      return [];
    }
  }

  async getStartupNews(date?: string, region: 'global' | 'india' = 'global'): Promise<NewsArticle[]> {
    const isDev = import.meta.env.DEV;
    
    try {
      let response;
      
      const params: any = {
        q: '("startup" OR "founder") AND ("growth" OR "scale" OR "unicorn" OR "funding" OR "venture capital" OR "seed round" OR "strategy" OR "failure" OR "pivot" OR "ecosystem" OR "buildinpublic")',
        sortBy: 'relevancy',
        language: 'en',
        pageSize: 100,
        apiKey: NEWS_API_KEY,
      };

      if (date) {
        params.from = date;
        params.to = date;
      }

      const proxyParams: any = {};
      if (date) {
        proxyParams.date = date;
      }
      if (region) {
        proxyParams.region = region;
      }

      if (isDev) {
        // Local Dev: Fetch from both directly
        const newsDataKey = import.meta.env.VITE_NewsData_API_KEY || '';
        
        let queryStr = '("startup" OR "founder") AND ("growth" OR "scale" OR "unicorn" OR "funding" OR "venture capital" OR "seed round" OR "strategy" OR "failure" OR "pivot" OR "ecosystem" OR "buildinpublic")';
        if (region === 'india') {
          queryStr += ' AND ("india" OR "indian")';
        }

        const newsApiPromise = NEWS_API_KEY ? axios.get(`${BASE_URL}/everything`, {
          params: {
            q: queryStr,
            sortBy: 'relevancy',
            language: 'en',
            pageSize: 50,
            from: date,
            to: date,
            apiKey: NEWS_API_KEY,
          }
        }).then(res => res.data.articles || []) : Promise.resolve([]);

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
          return (res.data.results || []).map((item: any) => ({
            title: item.title,
            description: item.description,
            url: item.link,
            urlToImage: item.image_url,
            publishedAt: item.pubDate,
            source: { name: item.source_id || 'NewsData.io' }
          }));
        }) : Promise.resolve([]);

        const startupByDocPromise = this.getStartupByDocNews();

        const [newsApiResult, newsDataResult, startupByDocResult] = await Promise.allSettled([
          newsApiPromise, 
          newsDataPromise,
          startupByDocPromise
        ]);
        
        let combinedArticles: any[] = [];
        if (newsApiResult.status === 'fulfilled') combinedArticles = [...combinedArticles, ...newsApiResult.value];
        if (newsDataResult.status === 'fulfilled') combinedArticles = [...combinedArticles, ...newsDataResult.value];
        if (startupByDocResult.status === 'fulfilled') combinedArticles = [...combinedArticles, ...startupByDocResult.value];
        
        combinedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        return combinedArticles;
      } else {
        // In prod, let the serverless proxy handle it
        response = await axios.get('/api/news', { params: proxyParams });
      }

      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
