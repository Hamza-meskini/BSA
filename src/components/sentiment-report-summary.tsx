"use client";

import {useState, useEffect, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {summarizeSentimentReport, SentimentReportSummarizerInput} from "@/ai/flows/sentiment-report-summarizer";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2, FileDown, Lightbulb, TrendingUp, AlertCircle, Wand2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {motion, AnimatePresence} from "framer-motion";

interface BackendResponse {
  summary: {
    sentimentScore: {
      sentiment: 'positive' | 'negative' | 'neutral';
      percentage: number;
    };
    totalMentions: number;
    topEmotion: string;
  };
  charts: {
    overallSentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    sentimentTrend: Array<{
      date: string;
      positive: number;
      negative: number;
      neutral: number;
    }>;
    overallEmotionDistribution: Record<string, number>;
    emotionTrend: Array<{
      date: string;
      joy: number;
      anger: number;
      sadness: number;
      fear: number;
      neutral: number;
    }>;
    wordCloud: Array<{
      text: string;
      frequency: number;
      sentiment: string;
    }>;
    platformComparison: Array<{
      platform: string;
      positive: number;
      negative: number;
      neutral: number;
    }>;
    platformEmotionComparison: Array<{
      platform: string;
      joy: number;
      anger: number;
      sadness: number;
      fear: number;
      neutral: number;
    }>;
    totalSentimentEngagementScores: {
      positive: number;
      negative: number;
      neutral: number;
    };
    totalEmotionEngagementScores: {
      joy: number;
      anger: number;
      sadness: number;
      fear: number;
      neutral: number;
    };
  };
  message?: string;
}

interface AIResponse {
  result: {
    summary: string;
    keyInsights: string[];
    recommendations: string[];
  };
  telemetry?: {
    traceId: string;
    spanId: string;
  };
}

interface SentimentReportSummaryProps {
  analysisData: BackendResponse;
}

export function SentimentReportSummary({
  analysisData
}: SentimentReportSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [keyInsights, setKeyInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isRegenerateDisabled, setIsRegenerateDisabled] = useState(false);
  const { toast } = useToast();

  // Debug logging for props
  useEffect(() => {
    console.log('SentimentReportSummary received analysisData:', JSON.stringify(analysisData, null, 2));
  }, [analysisData]);

  const handleGenerateSummary = async () => {
    if (isGeneratingSummary || isGeneratingReport) return;
    
    try {
      console.log('Starting summary generation with data:', JSON.stringify(analysisData, null, 2));
      setIsGeneratingSummary(true);
      setSummary(null);
      setKeyInsights([]);
      setRecommendations([]);

      // Extract positive and negative keywords from wordCloud
      const positiveKeywords = analysisData.charts.wordCloud
        .filter(word => word.sentiment === 'positive')
        .map(word => word.text);
      
      const negativeKeywords = analysisData.charts.wordCloud
        .filter(word => word.sentiment === 'negative')
        .map(word => word.text);

      const inputData: SentimentReportSummarizerInput = {
        sentimentScore: analysisData.summary.sentimentScore,
        totalMentions: analysisData.summary.totalMentions,
        topEmotion: analysisData.summary.topEmotion,
        positiveKeywords,
        negativeKeywords,
        emotionDistribution: analysisData.charts.overallEmotionDistribution,
        platformComparison: analysisData.charts.platformComparison,
        sentimentTrend: analysisData.charts.sentimentTrend
      };

      console.log('Sending input data to AI:', JSON.stringify(inputData, null, 2));
      
      // Call the server action
      const result = await summarizeSentimentReport(inputData);
      console.log('Received AI response:', JSON.stringify(result, null, 2));

      // Validate the response structure
      if (!result || typeof result !== 'object') {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response format from AI');
      }

      // Extract the result data from the response
      const resultData = 'result' in result ? (result as AIResponse).result : result;
      
      // Ensure we have valid arrays and string
      const validKeyInsights = Array.isArray(resultData.keyInsights) ? resultData.keyInsights : [];
      const validRecommendations = Array.isArray(resultData.recommendations) ? resultData.recommendations : [];
      const validSummary = typeof resultData.summary === 'string' ? resultData.summary : '';

      console.log('Setting state with validated data:', {
        summary: validSummary,
        keyInsights: validKeyInsights,
        recommendations: validRecommendations
      });

      // Update state with validated data
      setSummary(validSummary);
      setKeyInsights(validKeyInsights);
      setRecommendations(validRecommendations);
      setIsRegenerateDisabled(true); // Disable the button after successful generation

      toast({ 
        title: "Summary Generated", 
        description: "AI analysis is ready with insights and recommendations." 
      });
    } catch (error) {
      console.error("Failed to generate summary:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ 
        title: "Error",
        description: `Could not generate AI analysis: ${errorMessage}`, 
        variant: "destructive" 
      });
      setSummary(`Failed to generate summary: ${errorMessage}`);
      setIsRegenerateDisabled(false); // Re-enable if there's an error
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Add debug logging for component mount
  useEffect(() => {
    console.log('Component mounted with initial state:', {
      hasAnalysisData: !!analysisData,
      summary,
      keyInsights,
      recommendations,
      isGeneratingSummary
    });
    return () => console.log('Component unmounted');
  }, []);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('State updated:', {
      summary,
      keyInsights,
      recommendations,
      isGeneratingSummary
    });
  }, [summary, keyInsights, recommendations, isGeneratingSummary]);

  const handleGenerateReport = async () => {
    if (isGeneratingReport) return;
    
    try {
      setIsGeneratingReport(true);
      console.log("Generating report..."); // Placeholder for report generation logic
      // Simulate report generation (e.g., PDF creation)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Example: Trigger a download or open a new page
      // For now, just show a toast message
      toast({
        title: "Report Generation Initiated",
        description: "Your sentiment report will be ready shortly. (Feature coming soon!)",
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ 
        title: "Error",
        description: `Could not generate sentiment report: ${errorMessage}`, 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Add a useEffect to log state changes for debugging
  useEffect(() => {
    console.log('Button state:', {
      isGeneratingSummary,
      isGeneratingReport,
      isRegenerateDisabled
    });
  }, [isGeneratingSummary, isGeneratingReport, isRegenerateDisabled]);

  // Debug logging for render
  console.log('Rendering with state:', {
    summary,
    keyInsights,
    recommendations,
    isGeneratingSummary
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Card className="w-full border border-border/40 hover:border-primary/20 transition-colors">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/40">
        <div>
          <CardTitle className="text-3xl font-bold text-white">Sentiment Report Summary</CardTitle>
          <CardDescription className="text-lg text-white/70 mt-2">
            AI-powered analysis of sentiment data
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || isGeneratingReport || isRegenerateDisabled}
            className={`bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/20 transition-all duration-300 ${
              isRegenerateDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                {summary ? "Regenerate AI Analysis" : "Generate AI Analysis"}
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {summary && !isGeneratingSummary && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-2xl font-semibold mb-4 text-white flex items-center">
                  <Lightbulb className="mr-2 h-6 w-6"/>
                  Summary
                </h3>
                <p className="text-lg text-white/90 leading-relaxed whitespace-pre-wrap">{summary}</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  <AccordionItem value="key-insights" className="border-2 border-primary/10 rounded-lg px-4">
                    <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                      <div className="flex items-center text-white">
                        <Lightbulb className="mr-2 h-6 w-6 text-yellow-500"/>
                        <span>Key Insights ({keyInsights?.length || 0})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {keyInsights && keyInsights.length > 0 ? (
                        <motion.ul 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="list-none space-y-3"
                        >
                          {keyInsights.map((insight, index) => (
                            <motion.li 
                              key={index} 
                              variants={itemVariants}
                              className="flex items-start"
                            >
                              <span className="text-white mr-2">•</span>
                              <span className="text-lg text-white/90 leading-relaxed">{insight}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      ) : (
                        <p className="text-lg text-white/70 italic">No key insights available.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="recommendations" className="border-2 border-primary/10 rounded-lg px-4">
                    <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                      <div className="flex items-center text-white">
                        <TrendingUp className="mr-2 h-6 w-6 text-green-500"/>
                        <span>Recommendations ({recommendations?.length || 0})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {recommendations && recommendations.length > 0 ? (
                        <motion.ul 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="list-none space-y-3"
                        >
                          {recommendations.map((recommendation, index) => (
                            <motion.li 
                              key={index} 
                              variants={itemVariants}
                              className="flex items-start"
                            >
                              <span className="text-white mr-2">•</span>
                              <span className="text-lg text-white/90 leading-relaxed">{recommendation}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      ) : (
                        <p className="text-lg text-white/70 italic">No recommendations available.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!summary && !isGeneratingSummary && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl"
          >
            <AlertCircle className="h-12 w-12 text-white/50 mx-auto mb-4"/>
            <p className="text-lg text-white/90">
              Click the button above to generate an AI-powered analysis with insights and recommendations.
            </p>
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/40 pt-6 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="w-full flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || isGeneratingSummary}
            variant="outline"
            className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-lg"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                Generating Report...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-5 w-5 group-hover:animate-bounce"/>
                Generate Full Report (PDF)
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Add bounce animation if needed in globals.css
/*
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
}
.animate-bounce {
    animation: bounce 1s infinite;
}
*/
