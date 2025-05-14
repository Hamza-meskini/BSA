// src/types/analysis.ts

/**
 * Represents a single point in the sentiment trend chart.
 */
export interface SentimentTrendPoint {
  date: string; // Or Date object
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Represents a keyword in the word cloud.
 */
export interface Keyword {
  text: string;
  frequency: number;
  sentiment: "positive" | "negative" | "neutral";
}

/**
 * Represents sentiment distribution for a specific platform.
 */
export interface PlatformSentiment {
  platform: string; // e.g., 'twitter', 'reddit', 'news'
  positive: number;
  negative: number;
  neutral: number;
}


export interface PlatformLikes {
  platform: string;
  positiveLikes: number;
  neutralLikes: number;
  negativeLikes: number;
}


/**
 * Represents emotion distribution for a specific platform.
 */
export interface PlatformEmotionData {
  platform: string; // e.g., 'twitter', 'reddit', 'news'
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
}

/**
 * Represents the summary section of the analysis results.
 */
export interface SentimentSummaryData {
  sentimentScore: {
    sentiment: "positive" | "negative" | "neutral";
    percentage: number;
  };
  totalMentions: number;
  topEmotion: string; // Dominant emotion
}

/**
 * Represents data for the emotion trend chart.
 */
export interface EmotionData {
  date: string;
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
}

/**
 * Represents the overall distribution of emotions.
 * Keys are emotion names (e.g., "joy", "anger"), values are percentages or counts.
 */
export type OverallEmotionDistribution = {
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
  [key: string]: number; // To allow for dynamic emotion keys if needed
};

/**
 * Represents the overall distribution of sentiment (positive, negative, neutral).
 * Values can be percentages or counts.
 */
export interface OverallSentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  dominant_sentiment?: string;
  dominant_percentage?: number;
}


/**
 * Represents total engagement scores (likes, upvotes, platform scores) by sentiment.
 */
export interface EngagementScores {
  positive: number;
  negative: number;
  neutral: number;
}

/**
 * Represents total engagement scores (likes, upvotes, platform scores) by emotion.
 */
export interface EmotionEngagementScores {
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number; // emotion neutral
  [key: string]: number; // for flexibility
}


/**
 * Represents data for the charts in the analysis results.
 * Keys are updated to match the backend JSON structure.
 */
export interface ChartData {
  overallSentimentDistribution: OverallSentimentDistribution; // Was overallSentimentDistributionData
  sentimentTrend: SentimentTrendPoint[]; // Was sentimentTrendData
  overallEmotionDistribution: OverallEmotionDistribution; // Was overallEmotionDistributionData
  emotionTrend: EmotionData[]; // Consistent
  wordCloud: Keyword[]; // Was keywords
  totalSentimentEngagementScores: EngagementScores; // Consistent with backend example, was sentimentEngagementScores
  totalEmotionEngagementScores: EmotionEngagementScores; // Consistent with backend example, was emotionEngagementScores
  platformComparison: PlatformSentiment[]; // Was platformComparisonData
  platformEmotionComparison: PlatformEmotionData[]; // Was platformEmotionComparisonData
}

/**
 * Represents the complete analysis results structure from the backend.
 */
export interface AnalysisResults {
  summary: SentimentSummaryData;
  charts: ChartData;
  message?: string; // Optional message from backend
  error?: string | null; // Optional error message
}
  

/**
 * Represents positive and negative keywords lists for AI summary.
 */
 export interface KeywordData {
    positive: string[];
    negative: string[];
}