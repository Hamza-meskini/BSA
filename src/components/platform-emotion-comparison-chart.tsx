"use client";

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformEmotionData } from '@/types/analysis';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

interface PlatformEmotionComparisonChartProps {
  data: PlatformEmotionData[];
}

// Consistent emotion chart configuration
const emotionChartConfig = {
  joy: { label: "Joy", color: "hsl(var(--chart-1))" },
  love: { label: "Love", color: "hsl(var(--chart-5))" },
  anger: { label: "Anger", color: "hsl(var(--chart-5))" },
  sadness: { label: "Sadness", color: "hsl(var(--chart-3))" },
  fear: { label: "Fear", color: "hsl(var(--chart-4))" },
  disgust: { label: "Disgust", color: "hsl(var(--chart-2))" },
  surprise: { label: "Surprise", color: "hsl(var(--accent))" },
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" },
} satisfies Record<string, { label: string; color: string }>;

const PlatformEmotionComparisonChart: React.FC<PlatformEmotionComparisonChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Emotion Comparison</CardTitle>
          <CardDescription>Comparison of emotion distribution across different platforms.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No platform emotion data available.</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1)
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Emotion Comparison</CardTitle>
        <CardDescription>Comparison of emotion distribution across different platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={emotionChartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))"/>
              <YAxis
                dataKey="platform"
                type="category"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                width={80}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                content={<ChartTooltipContent />}
              />
              <Legend content={<ChartLegendContent />} />
              {Object.entries(emotionChartConfig).map(([key, config]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a" // All emotion bars for a platform are stacked together
                  fill={config.color}
                  name={config.label}
                  radius={key === 'neutral' ? [0, 4, 4, 0] : (key === 'joy' ? [4,0,0,4] : [0,0,0,0])} // Example for rounded ends, adjust logic if needed
                  animationDuration={500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PlatformEmotionComparisonChart;
