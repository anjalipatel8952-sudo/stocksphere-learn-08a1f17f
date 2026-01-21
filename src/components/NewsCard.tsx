import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { NewsItem } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  news: NewsItem;
  delay?: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, delay = 0 }) => {
  const getSentimentStyles = () => {
    switch (news.sentiment) {
      case 'positive': return 'bg-success/10 text-success';
      case 'negative': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-xl p-4 hover-lift cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium capitalize",
          getSentimentStyles()
        )}>
          {news.sentiment}
        </span>
        <span className="text-xs text-muted-foreground">{news.time}</span>
      </div>

      <h4 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {news.title}
      </h4>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {news.summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{news.source}</span>
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="flex gap-1">
          {news.relatedStocks.slice(0, 3).map((symbol) => (
            <span key={symbol} className="px-2 py-0.5 bg-secondary rounded text-xs font-medium">
              {symbol}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
