"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EngagementScores } from '@/types/analysis';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface TotalSentimentScoresBarChartProps {
  engagementScores: EngagementScores;
}

const sentimentVisualConfig = {
  positive: { label: "Positive", color: "hsl(var(--chart-2))" },
  negative: { label: "Negative", color: "hsl(var(--chart-5))" },
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" },
} satisfies Record<"positive" | "negative" | "neutral", { label: string; color: string }>;


const TotalSentimentScoresBarChart: React.FC<TotalSentimentScoresBarChartProps> = ({ engagementScores }) => {
  const { positive, negative, neutral } = engagementScores;

  const chartData = [
    { name: sentimentVisualConfig.positive.label, value: positive, fill: sentimentVisualConfig.positive.color },
    { name: sentimentVisualConfig.negative.label, value: negative, fill: sentimentVisualConfig.negative.color },
    { name: sentimentVisualConfig.neutral.label, value: neutral, fill: sentimentVisualConfig.neutral.color },
  ].filter(entry => entry.value > 0);

  const chartContainerConfig = {
    [sentimentVisualConfig.positive.label]: { label: sentimentVisualConfig.positive.label, color: sentimentVisualConfig.positive.color },
    [sentimentVisualConfig.negative.label]: { label: sentimentVisualConfig.negative.label, color: sentimentVisualConfig.negative.color },
    [sentimentVisualConfig.neutral.label]: { label: sentimentVisualConfig.neutral.label, color: sentimentVisualConfig.neutral.color },
    value: { label: "Score" } 
  };

  if (chartData.length === 0) {
    return (
      <Card className="animate-fade-in opacity-0 animation-delay-800">
        <CardHeader>
          <CardTitle>Total Sentiment Engagement</CardTitle>
          <CardDescription>Aggregated engagement scores (likes, upvotes, etc.) by overall sentiment.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No sentiment engagement score data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in opacity-0 animation-delay-800">
      <CardHeader>
        <CardTitle>Total Sentiment Engagement</CardTitle>
        <CardDescription>Aggregated engagement scores (likes, upvotes, etc.) by overall sentiment.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartContainerConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                dataKey="name" 
                type="category"
                width={80} 
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                content={<ChartTooltipContent />} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TotalSentimentScoresBarChart;
