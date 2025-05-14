"use client";

import {useEffect, useState} from "react";
import {SentimentSummaryCards} from "@/components/sentiment-summary-cards";
import {SentimentTrendChart} from "@/components/sentiment-trend-chart";
import {KeywordWordCloud} from "@/components/keyword-word-cloud";
import {PlatformComparisonChart} from "@/components/platform-comparison-chart";
import EmotionTrendChart from "@/components/emotion-trend-chart";
import EmotionDistributionPieChart from "@/components/emotion-distribution-pie-chart";
import OverallSentimentPieChart from "@/components/overall-sentiment-pie-chart";
import TotalSentimentScoresBarChart from "@/components/total-sentiment-scores-bar-chart";
import PlatformEmotionComparisonChart from "@/components/platform-emotion-comparison-chart";
import TotalEmotionEngagementChart from "@/components/total-emotion-engagement-chart"; 
import {SentimentReportSummary} from "@/components/sentiment-report-summary";
import { Smile, Frown, Meh, Heart, ThumbsDown, HelpCircle, Brain, LineChart, PieChart as PieChartIcon, Cloud, MessageSquare, Activity, Users, Bot } from "lucide-react"; // Added Bot
import type {AnalysisResults} from "@/types/analysis";


interface ResultsDashboardProps {
  isLoading: boolean;
  results: AnalysisResults | null;
}

const loadingMessages = [
  "Brewing fresh insights...",
  "Scanning the digital cosmos for brand vibes...",
  "Gauging the buzz, just for you...",
  "Unearthing sentiments, please hold on...",
  "Crunching the numbers, almost there...",
  "Distilling the essence of public opinion...",
  "Connecting to the sentiment oracle...",
  "Interpreting the whispers of the web...",
];

const sentimentIconsConfig = [
  { Icon: Smile, color: "text-positive", angle: 0 }, 
  { Icon: Heart, color: "text-accent", angle: 60 }, 
  { Icon: Meh, color: "text-muted-foreground", angle: 120 }, 
  { Icon: Frown, color: "text-[hsl(var(--chart-3))]", angle: 180 }, 
  { Icon: ThumbsDown, color: "text-destructive", angle: 240 }, 
  { Icon: Bot, color: "text-[hsl(var(--chart-4))]", angle: 300 }, // Using Bot icon
];


export function ResultsDashboard({isLoading, results}: ResultsDashboardProps) {
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);


  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    if (isLoading) {
      setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

      messageInterval = setInterval(() => {
        setCurrentLoadingMessage(prevMessage => {
          let newMessage = prevMessage;
          while (newMessage === prevMessage) { 
            newMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
          }
          return newMessage;
        });
      }, 3000); 

    }
    return () => {
      clearInterval(messageInterval);
    };
  }, [isLoading]);


  if (isLoading) {
    return (
      <section className="p-4 flex flex-col items-center justify-start pt-20 min-h-[calc(100vh-var(--navbar-height,0px)-var(--hero-height,0px))] animate-fade-in">
        <div className="relative w-24 h-24 animate-spin mb-6">
          {sentimentIconsConfig.map(({ Icon, color, angle }, index) => (
            <Icon
              key={index}
              className={`absolute h-8 w-8 ${color}`}
              style={{
                top: 'calc(50% - 16px)', 
                left: 'calc(50% - 16px)',
                transform: `rotate(${angle}deg) translateX(32px) rotate(-${angle}deg)`, 
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-muted-foreground text-lg text-center animate-fade-in animation-delay-200 opacity-0">
          {currentLoadingMessage}
        </p>
      </section>
    );
  }

  if (!results) {
    return (
      <section id="initial-dashboard-view" className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-var(--hero-height,0px)-var(--navbar-height,0px))] animate-fade-in text-center">
        <div className="animate-fade-in-up opacity-0 animation-delay-200">
          <div className="relative mb-10">
            <Brain className="h-32 w-32 md:h-40 md:w-40 text-primary mx-auto animate-pulse-slow opacity-80" data-ai-hint="intelligence data" />
            <LineChart className="h-10 w-10 text-accent absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 opacity-70 animate-float animation-delay-200" style={{animationDuration: '3.5s'}} />
            <PieChartIcon className="h-12 w-12 text-chart-2 absolute top-0 right-0 translate-x-1/4 -translatey-1/4 opacity-70 animate-float animation-delay-400" style={{animationDuration: '4s'}}/>
            <Cloud className="h-10 w-10 text-chart-4 absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/4 opacity-70 animate-float animation-delay-600" style={{animationDuration: '3.2s'}}/>
            <MessageSquare className="h-10 w-10 text-chart-5 absolute bottom-0 right-0 translate-x-1/3 translatey-1/4 opacity-70 animate-float animation-delay-800" style={{animationDuration: '3.8s'}}/>
          </div>

          <h2 className="text-4xl md:text-5xl font-heading tracking-tight mb-4 text-foreground">
            Unlock Brand Insights
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover what the world is saying. Our AI analyzes trends, emotions, and keywords to give you a clear picture of brand perception.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto mb-12">
          {[
            { Icon: Activity, label: "Sentiment Trends", description: "Track sentiment over time." },
            { Icon: PieChartIcon, label: "Emotion Analysis", description: "Understand emotional responses." },
            { Icon: Cloud, label: "Keyword Clouds", description: "Identify key topics." },
            { Icon: Users, label: "Platform Comparison", description: "Compare across sources." },
          ].map(({ Icon, label, description }, index) => (
            <div
              key={label}
              className="flex flex-col items-center p-4 rounded-xl bg-card/50 hover:bg-card/80 transition-all duration-300 ease-out transform hover:scale-105 animate-fade-in-up opacity-0 hover:shadow-primary/20 shadow-md"
              style={{ animationDelay: `${400 + index * 150}ms` }}
              data-ai-hint="card feature"
            >
              <div className="p-3 bg-primary/10 rounded-full mb-3 border border-primary/20">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-md font-semibold text-foreground mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground text-center">{description}</p>
            </div>
          ))}
        </div>
         <p className="text-md text-foreground/80 animate-fade-in-up opacity-0" style={{ animationDelay: '1000ms' }}>
            Ready to dive in? Enter a brand name and select a period above to begin your analysis.
          </p>
      </section>
    );
  }

  // Results are available, render the dashboard
  return (
    <section className="p-4 animate-fade-in opacity-0 animation-delay-200">
      {/* Section for Summary Cards */}
      <div id="summary-cards-section" className="animate-fade-in-up opacity-0 animation-delay-200">
        <SentimentSummaryCards
          sentimentScore={results.summary.sentimentScore}
          totalMentions={results.summary.totalMentions}
          topEmotion={results.summary.topEmotion}
        />
      </div>
      
      {/* Section for Overall Sentiment Distribution & Trend */}
      <div id="overall-sentiment-section" className="animate-fade-in-up opacity-0 animation-delay-400">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <OverallSentimentPieChart 
            distribution={results.charts.overallSentimentDistribution} 
            dominantSentiment={results.summary.sentimentScore}
          />
          <SentimentTrendChart data={results.charts.sentimentTrend}/>
        </div>
      </div>
      
      {/* Section for Overall Emotion Distribution & Trend */}
      <div id="emotion-distribution-section" className="animate-fade-in-up opacity-0 animation-delay-600">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <EmotionDistributionPieChart distribution={results.charts.overallEmotionDistribution} />
          <EmotionTrendChart emotionTrend={results.charts.emotionTrend} />
        </div>
      </div>
      
      {/* Section for Keyword Word Cloud */}
      <div id="keywords-section" className="animate-fade-in-up opacity-0 animation-delay-800">
        <div className="grid grid-cols-1 gap-4 mb-8">
          <KeywordWordCloud keywords={results.charts.wordCloud}/>
        </div>
      </div>

      {/* Section for Total Sentiment and Emotion Engagement Scores */}
      <div id="engagement-scores-section" className="animate-fade-in-up opacity-0 animation-delay-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <TotalSentimentScoresBarChart engagementScores={results.charts.totalSentimentEngagementScores} />
          <TotalEmotionEngagementChart emotionEngagementScores={results.charts.totalEmotionEngagementScores} />
        </div>
      </div>

      {/* Section for Platform Sentiment & Emotion Comparison */}
      <div id="platform-comparison-section" className="animate-fade-in-up opacity-0 animation-delay-1000">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
           <PlatformComparisonChart data={results.charts.platformComparison}/>
           <PlatformEmotionComparisonChart data={results.charts.platformEmotionComparison} />
        </div>
      </div>
      
      {/* Section for AI Summary Report */}
      <div id="ai-summary-report-section" className="animate-fade-in-up opacity-0 animation-delay-1200">
        <SentimentReportSummary
              sentimentData={results.summary}
              keywords={{ // Ensure KeywordWordCloud provides data suitable for this
              positive: results.charts.wordCloud
                  .filter((k) => k.sentiment === "positive")
                  .map((k) => k.text),
              negative: results.charts.wordCloud
                  .filter((k) => k.sentiment === "negative")
                  .map((k) => k.text),
              }}
          />
        </div>
    </section>
  );
}
