import type { AnalysisPeriod } from "@/app/page";
import type {AnalysisResults} from "@/types/analysis";
 
// Helper function to convert AnalysisPeriod to days_ago
const getDaysAgoFromPeriod = (period: AnalysisPeriod): number => {
  switch (period) {
    case "last_week":
      return 7;
    case "last_month":
      return 30;
    case "last_3_months":
      return 90;
    default:
      // Should not happen with type safety, but good to have a default
      return 30; 
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Function to fetch analysis results from the backend
export const fetchAnalysisResults = async (
  brand: string,
  period: AnalysisPeriod
): Promise<AnalysisResults> => {
  const daysAgo = getDaysAgoFromPeriod(period);
  const apiUrl = `/api/analyze?brand=${encodeURIComponent(brand)}&days=${daysAgo}`;

  console.log(`Fetching analysis results for: ${brand}, period: ${period} (days: ${daysAgo})`);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      let errorDetail = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || errorData.detail || errorDetail;
      } catch (e) {
        errorDetail = response.statusText || errorDetail;
      }
      console.error("API Error:", errorDetail);
      throw new Error(errorDetail);
    }

    const results: AnalysisResults = await response.json();
    console.log("Successfully fetched and parsed analysis results:", results);
    return results;

  } catch (error) {
    console.error("Network or other error fetching analysis results:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch analysis results: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching analysis results.");
  }
};


// The mockAnalyzeSentiment function is no longer the primary way to get data.
// It can be kept for testing or removed. 
// For this change, we are focusing on integrating the backend.
// If you want to keep it as a fallback, you would need to update its return structure
// to match the new `AnalysisResults` type (e.g. using `wordCloud` instead of `keywords`).

/*
Example of how mockAnalyzeSentiment would need to be updated if kept:

// Helper function to generate date strings for the last N days (if needed for mock)
const generateDates = (period: AnalysisPeriod): string[] => { ... };

export const mockAnalyzeSentiment = async (
  brand: string,
  period: AnalysisPeriod
): Promise<AnalysisResults> => {
  console.log(`Mock analyzing sentiment for: ${brand} over ${period}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const dates = generateDates(period);
  // ... (rest of the mock data generation logic) ...

  return {
    summary: { ... }, // ensure fields match SentimentSummaryData
    charts: {
      overallSentimentDistribution: { ... }, // ensure fields match OverallSentimentDistribution
      sentimentTrend: [ ... ], // ensure fields match SentimentTrendPoint[]
      overallEmotionDistribution: { ... }, // ensure fields match OverallEmotionDistribution
      emotionTrend: [ ... ], // ensure fields match EmotionData[]
      wordCloud: [ ... ], // THIS IS THE KEY CHANGE: was 'keywords'
      totalSentimentEngagementScores: { ... }, // ensure fields match EngagementScores
      totalEmotionEngagementScores: { ... }, // ensure fields match EmotionEngagementScores
      platformComparison: [ ... ], // ensure fields match PlatformSentiment[]
      platformEmotionComparison: [ ... ], // ensure fields match PlatformEmotionData[]
    },
    message: `Mock analysis complete for ${brand}`
  };
};
*/