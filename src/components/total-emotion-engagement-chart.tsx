
"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmotionEngagementScores } from '@/types/analysis';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface TotalEmotionEngagementChartProps {
  emotionEngagementScores: EmotionEngagementScores;
}

// Using a similar config to EmotionDistributionPieChart for consistency
const emotionVisualConfig = {
  joy: { label: "Joy", color: "hsl(var(--chart-1))" },
  anger: { label: "Anger", color: "hsl(var(--chart-5))" },
  sadness: { label: "Sadness", color: "hsl(var(--chart-3))" },
  fear: { label: "Fear", color: "hsl(var(--chart-4))" },
  disgust: { label: "Disgust", color: "hsl(var(--chart-2))" },
  surprise: { label: "Surprise", color: "hsl(var(--accent))" },
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" }, // Emotion neutral
} satisfies Record<keyof EmotionEngagementScores, { label: string; color: string }>;


const TotalEmotionEngagementChart: React.FC<TotalEmotionEngagementChartProps> = ({ emotionEngagementScores }) => {
  const chartData = (Object.keys(emotionVisualConfig) as Array<keyof EmotionEngagementScores>)
    .map(key => ({
      name: emotionVisualConfig[key].label,
      value: emotionEngagementScores[key] || 0,
      fill: emotionVisualConfig[key].color,
    }))
    .filter(entry => entry.value > 0)
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Config for ChartContainer, primarily for Tooltip
  const chartContainerConfig = chartData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as Record<string, {label: string, color: string}>);
  chartContainerConfig.value = { label: "Engagement Score" };


  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Emotion Engagement</CardTitle>
          <CardDescription>Aggregated engagement scores (likes, upvotes, etc.) by emotion.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No emotion engagement score data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Emotion Engagement</CardTitle>
        <CardDescription>Aggregated engagement scores (likes, upvotes, etc.) by emotion.</CardDescription>
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
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={Math.min(35, 200 / chartData.length) /* Adjust bar size based on number of items */ }>
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

export default TotalEmotionEngagementChart;

