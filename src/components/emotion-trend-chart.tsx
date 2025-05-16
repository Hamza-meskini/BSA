"use client";
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type { EmotionData } from '@/types/analysis'; // Ensure correct import path
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart'; // Import from shadcn/ui

interface EmotionTrendChartProps {
  emotionTrend: EmotionData[];
}

const chartConfig = {
  joy: { label: "Joy", color: "hsl(var(--chart-1))" },
  love: { label: "Love", color: "hsl(var(--chart-5))" }, // Changed to red color
  anger: { label: "Anger", color: "hsl(var(--chart-5))" }, // Typically red
  sadness: { label: "Sadness", color: "hsl(var(--chart-3))" }, // Typically blue/grey
  fear: { label: "Fear", color: "hsl(var(--chart-4))" }, // Typically purple/orange
  disgust: { label: "Disgust", color: "hsl(var(--chart-2))" }, // Typically green (can be adjusted)
  surprise: { label: "Surprise", color: "hsl(var(--accent))" }, // Accent color
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" },
} satisfies Record<string, { label: string; color: string }>;


const EmotionTrendChart: React.FC<EmotionTrendChartProps> = ({ emotionTrend }) => {
  if (!emotionTrend || emotionTrend.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emotion Trend</CardTitle>
          <CardDescription>Trend of emotions over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No emotion trend data available.</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = emotionTrend.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Get emotions that have values in the data
  const emotionsWithValues = Object.keys(chartConfig).filter(emotion => 
    formattedData.some(item => item[emotion] > 0)
  );

  // Create filtered chart config with only emotions that have values
  const filteredChartConfig = emotionsWithValues.reduce((acc, emotion) => {
    acc[emotion] = chartConfig[emotion];
    return acc;
  }, {} as typeof chartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Trend</CardTitle>
        <CardDescription>Trend of emotions over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={filteredChartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                {Object.entries(filteredChartConfig).map(([key, value]) => (
                  <linearGradient key={key} id={`fill${key.charAt(0).toUpperCase() + key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={value.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={value.color} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} content={<ChartTooltipContent indicator="line" />} />
              <Legend content={<ChartLegendContent />} />
              {Object.entries(filteredChartConfig).map(([key, config]) => (
                 <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.color}
                  fill={`url(#fill${key.charAt(0).toUpperCase() + key.slice(1)})`}
                  fillOpacity={0.4}
                  stackId="1"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  name={config.label}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EmotionTrendChart;
