import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Stock, getAIInsight } from '@/data/mockStocks';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  stock: Stock;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ stock }) => {
  const insight = getAIInsight(stock);

  const getRecommendationIcon = () => {
    switch (insight.recommendation) {
      case 'Buy': return <TrendingUp className="w-5 h-5" />;
      case 'Sell': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getRecommendationStyles = () => {
    switch (insight.recommendation) {
      case 'Buy': return 'bg-success/10 text-success border-success/20';
      case 'Sell': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getRiskStyles = () => {
    switch (insight.risk) {
      case 'Low': return 'bg-success/10 text-success';
      case 'High': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Insights</h3>
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Beta</span>
      </div>

      {/* Recommendation */}
      <div className={cn(
        "p-4 rounded-xl border mb-4",
        getRecommendationStyles()
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-80">AI Recommendation</span>
          {getRecommendationIcon()}
        </div>
        <p className="text-2xl font-bold">{insight.recommendation}</p>
      </div>

      {/* Risk Level */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Risk Level</span>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold",
          getRiskStyles()
        )}>
          {insight.risk}
        </span>
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Why is this stock moving?</p>
        <p className="text-sm text-foreground leading-relaxed">{insight.reason}</p>
      </div>

      {/* Beginner Tip */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-primary mb-1">Beginner Tip</p>
            <p className="text-xs text-muted-foreground">{insight.tip}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
