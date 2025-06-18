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

// Function to fetch analysis results from the backend
export const fetchAnalysisResults = async (
  brand: string,
  period: AnalysisPeriod
): Promise<AnalysisResults> => {
  const daysAgo = getDaysAgoFromPeriod(period);

  // Debug logging
  console.log('Environment variables in sentiment-analysis.ts:');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  console.log(`Fetching analysis results for: ${brand}, period: ${period} (days: ${daysAgo})`);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brand, daysAgo })
    });

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

