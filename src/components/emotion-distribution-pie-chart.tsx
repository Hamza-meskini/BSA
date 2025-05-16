"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverallEmotionDistribution } from '@/types/analysis';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

interface EmotionDistributionPieChartProps {
  distribution: OverallEmotionDistribution;
}

// Re-using colors from EmotionTrendChart or defining new ones
const emotionChartConfig = {
  joy: { label: "Joy", color: "hsl(var(--chart-1))" },
  anger: { label: "Anger", color: "hsl(var(--chart-5))" },
  sadness: { label: "Sadness", color: "hsl(var(--chart-3))" },
  fear: { label: "Fear", color: "hsl(var(--chart-4))" },
  disgust: { label: "Disgust", color: "hsl(var(--chart-2))" },
  surprise: { label: "Surprise", color: "hsl(var(--accent))" },
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" },
} satisfies Record<keyof OverallEmotionDistribution, { label: string; color: string }>;


const EmotionDistributionPieChart: React.FC<EmotionDistributionPieChartProps> = ({ distribution }) => {
  const pieData = Object.entries(distribution)
    .map(([name, value]) => ({
      name: emotionChartConfig[name as keyof typeof emotionChartConfig]?.label || name,
      value,
      fill: emotionChartConfig[name as keyof typeof emotionChartConfig]?.color || '#8884d8', // Default color
    }))
    .filter(entry => entry.value > 0); // Only show emotions with counts

  if (pieData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Emotion Distribution</CardTitle>
          <CardDescription>Breakdown of all emotions during the period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No emotion distribution data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="emotion-distribution-pie-chart">
      <CardHeader>
        <CardTitle>Overall Emotion Distribution</CardTitle>
        <CardDescription>Breakdown of all emotions during the period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={emotionChartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90} // Adjusted for labels
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  // Position label slightly outside the slice for readability
                  const radius = outerRadius * 1.15; // Increased distance for labels
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  // Hide label for very small slices to prevent overlap
                  if (percent < 0.05 && pieData.length > 5) return null;

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="hsl(var(--popover-foreground))"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs"
                      style={{pointerEvents: 'none'}}
                    >
                      {`${pieData[index].name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke="hsl(var(--background))" />
                ))}
              </Pie>
              <Legend content={<ChartLegendContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EmotionDistributionPieChart;
