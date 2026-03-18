import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { newsService, type NewsArticle } from '../newsService';
import AnimatedLogo from './AnimatedLogo';

const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [region, setRegion] = useState<'global' | 'india'>('global');

  const fetchNews = async (date?: string, newsRegion?: 'global' | 'india') => {
    setLoading(true);
    setError(false);
    try {
      const data = await newsService.getStartupNews(date, newsRegion || region);
      setArticles(data.filter(a => a.urlToImage && a.title));
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedDate, region);
  }, [selectedDate, region]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="news-container">
      <div className="news-header">
        <div className="news-header-left">
          <AnimatedLogo isThinking={true} size={48} className="news-header-icon" />
          <div>
            <h1 className="news-title">Innovestor News Articles</h1>
            <p className="news-subtitle">The latest in startups, VC, and entrepreneurship from around the globe</p>
          </div>
        </div>
        <div className="news-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="news-region-toggle" style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <button 
              className={`region-btn ${region === 'global' ? 'active' : ''}`}
              onClick={() => setRegion('global')}
              style={{
                background: region === 'global' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: region === 'global' ? '#fff' : '#aaa',
                border: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: region === 'global' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              GLOBAL
            </button>
            <button 
              className={`region-btn ${region === 'india' ? 'active' : ''}`}
              onClick={() => setRegion('india')}
              style={{
                background: region === 'india' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: region === 'india' ? '#fff' : '#aaa',
                border: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: region === 'india' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              IN INDIA
            </button>
          </div>
          <input 
            type="date" 
            className="news-date-picker" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          />
          <button className="news-refresh-btn" onClick={() => fetchNews(selectedDate, region)} disabled={loading}>
            <RefreshCw className={loading ? 'spinning' : ''} size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="news-loading">
          <RefreshCw className="spinning" size={32} />
          <p>Curating your daily startup digest...</p>
        </div>
      ) : error ? (
        <div className="news-error">
          <AlertCircle size={40} />
          <p>Could not load news at this time. Please check your API key.</p>
        </div>
      ) : (
        <div className="news-grid">
          <AnimatePresence>
            {articles.map((article, idx) => (
              <motion.a
                key={article.url + idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="news-card-image-wrap">
                  <img src={article.urlToImage} alt={article.title} className="news-card-image" />
                  <div className="news-card-badge">{article.source.name}</div>
                </div>
                <div className="news-card-content">
                  <div className="news-card-meta">
                    <Calendar size={12} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <h3 className="news-card-title">{article.title}</h3>
                  <p className="news-card-desc">{article.description?.slice(0, 120)}...</p>
                  <div className="news-card-footer">
                    <span>Read Article</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
