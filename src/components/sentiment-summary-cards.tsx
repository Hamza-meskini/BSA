"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TrendingUp, TrendingDown, Minus, Smile, Frown, Meh} from "lucide-react";
import {Progress} from "@/components/ui/progress"; // Assuming you have a Progress component
import {cn} from "@/lib/utils";

interface SentimentSummaryCardsProps {
  sentimentScore: {
    sentiment: "positive" | "negative" | "neutral";
    percentage: number;
  };
  totalMentions: number;
  topEmotion: string; // e.g., "Joy", "Anger", "Neutral"
}

export function SentimentSummaryCards({
  sentimentScore,
  totalMentions,
  topEmotion,
}: SentimentSummaryCardsProps) {
  const scorePercentage = sentimentScore.percentage;
  const sentimentLabel = sentimentScore.sentiment.charAt(0).toUpperCase() + sentimentScore.sentiment.slice(1);
  const sentimentColor =
    sentimentScore.sentiment === "positive"
      ? "text-positive" // Use HSL variable for green
      : sentimentScore.sentiment === "negative"
        ? "text-destructive" // Use HSL variable for red
        : "text-muted-foreground"; // Gray for neutral

  const SentimentIcon =
    sentimentScore.sentiment === "positive"
      ? TrendingUp
      : sentimentScore.sentiment === "negative"
        ? TrendingDown
        : Minus;

  const EmotionIcon = () => {
    switch (topEmotion.toLowerCase()) {
      case "joy":
      case "love":
      case "optimism":
        return <Smile className="text-positive"/>;
      case "anger":
      case "sadness":
      case "fear":
        return <Frown className="text-destructive"/>;
      default:
        return <Meh className="text-muted-foreground"/>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Sentiment Score Card */}
      <Card className="transform transition-transform duration-300 ease-out hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Overall Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <SentimentIcon
              className={cn("h-6 w-6 animate-pulse", sentimentColor)}
            />
            <p className={cn("text-2xl font-bold", sentimentColor)}>
              {sentimentLabel}
            </p>
          </div>
          <Progress
            value={scorePercentage}
            className="h-2 [&>div]:bg-[var(--sentiment-progress-color)]"
            style={
              {
                "--sentiment-progress-color":
                  sentimentLabel === "Positive"
                    ? "hsl(var(--positive))"
                    : sentimentLabel === "Negative"
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--muted-foreground))",
              } as React.CSSProperties
            }
          />
          <p className="text-sm text-muted-foreground text-right">
            {scorePercentage.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Total Mentions Card */}
      <Card className="transform transition-transform duration-300 ease-out hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Total Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold animate-count-up">
            {totalMentions.toLocaleString()}
          </p>
           <p className="text-sm text-muted-foreground">Mentions Analyzed</p>
        </CardContent>
      </Card>

      {/* Top Emotion Card */}
      <Card className="transform transition-transform duration-300 ease-out hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Top Emotion</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-3">
           <div className="animate-bounce-sm"> <EmotionIcon /></div>
          <p className="text-2xl font-bold capitalize">{topEmotion}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper animation CSS (add to globals.css or use Tailwind JIT)
/*
@keyframes count-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-count-up {
  animation: count-up 0.5s ease-out forwards;
}

@keyframes bounce-sm {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce-sm {
  animation: bounce-sm 1s ease-in-out infinite;
}
*/
