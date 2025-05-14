
"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {summarizeSentimentReport, SentimentReportSummarizerInput} from "@/ai/flows/sentiment-report-summarizer";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2, FileDown} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import type {SentimentSummaryData, KeywordData} from "@/types/analysis";

interface SentimentReportSummaryProps {
  sentimentData: SentimentSummaryData;
  keywords: KeywordData;
}

export function SentimentReportSummary({sentimentData, keywords}: SentimentReportSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
   const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary(null); // Clear previous summary

    const inputData: SentimentReportSummarizerInput = {
      sentimentScore: sentimentData.sentimentScore,
      totalMentions: sentimentData.totalMentions,
      topEmotion: sentimentData.topEmotion,
      positiveKeywords: keywords.positive,
      negativeKeywords: keywords.negative,
    };

    try {
      const result = await summarizeSentimentReport(inputData);
      setSummary(result.summary);
       toast({ title: "Summary Generated", description: "AI summary is ready." });
    } catch (error) {
      console.error("Failed to generate summary:", error);
       toast({ title: "Summary Failed", description: "Could not generate AI summary.", variant: "destructive" });
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

   const handleGenerateReport = async () => {
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


     setIsGeneratingReport(false);
   };

  return (
    <Card className="mt-8 transform transition-transform duration-300 ease-out hover:shadow-lg">
      <CardHeader>
        <CardTitle>Sentiment Report Summary</CardTitle>
        <CardDescription>
          Generate an AI-powered summary and a downloadable report of the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || isGeneratingReport}
            className="w-full md:w-auto"
         >
            {isGeneratingSummary ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Generating Summary...
            </>
            ) : (
            "Generate AI Summary"
            )}
        </Button>

        {isGeneratingSummary && (
             <div className="flex items-center justify-center p-4">
                 <Loader2 className="h-8 w-8 animate-spin text-primary"/>
             </div>
         )}

        {summary !== null && !isGeneratingSummary && (
          <Textarea
            readOnly
            value={summary}
            className="w-full rounded-md shadow-sm min-h-[100px] bg-muted/30 border-border animate-fade-in"
             placeholder="Generated summary will appear here..."
          />
        )}
        {summary === null && !isGeneratingSummary && (
             <p className="text-muted-foreground text-sm text-center p-4">
                 Click the button above to generate an AI summary based on the analysis results.
            </p>
         )}

      </CardContent>
       <CardFooter className="border-t pt-4">
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || isGeneratingSummary}
            variant="outline"
             className="w-full md:w-auto group hover:bg-accent hover:text-accent-foreground"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Generating Report...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4 group-hover:animate-bounce"/>
                Generate Full Report (PDF)
              </>
            )}
          </Button>
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
