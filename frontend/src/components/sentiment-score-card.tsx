import React from 'react';
import { OverallSentimentDistribution } from '@/types/analysis';

interface SentimentScoreCardProps {
  distribution: OverallSentimentDistribution;
}

const SentimentScoreCard: React.FC<SentimentScoreCardProps> = ({ distribution }) => {
  const dominantSentiment = distribution.dominant_sentiment || 'neutral';
  const dominantPercentage = distribution.dominant_percentage || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Overall Sentiment Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Dominant Sentiment</span>
          <span className="text-2xl font-bold capitalize">{dominantSentiment}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Dominant Percentage</span>
          <span className="text-2xl font-bold">{dominantPercentage}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Positive</span>
          <span className="text-xl font-semibold text-green-600">{distribution.positive}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Negative</span>
          <span className="text-xl font-semibold text-red-600">{distribution.negative}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Neutral</span>
          <span className="text-xl font-semibold text-gray-600">{distribution.neutral}%</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentScoreCard;