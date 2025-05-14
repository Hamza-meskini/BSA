"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'; // Removed Legend as it's unused based on ChartLegendContent
import * as RechartsPrimitive from "recharts"; // Added import for RechartsPrimitive
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverallSentimentDistribution } from '@/types/analysis'; // Changed import
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';

interface OverallSentimentPieChartProps {
  distribution: OverallSentimentDistribution; // Changed prop name and type
}

const sentimentChartConfig = {
  positive: { label: "Positive", color: "hsl(var(--chart-2))" }, // Greenish
  negative: { label: "Negative", color: "hsl(var(--chart-5))" }, // Reddish
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" }, // Gray
} satisfies Record<"positive" | "negative" | "neutral", { label: string; color: string }>;


const OverallSentimentPieChart: React.FC<OverallSentimentPieChartProps> = ({ distribution }) => {
  // Directly use the distribution prop
  const pieData = [
    { name: sentimentChartConfig.positive.label, value: distribution.positive, fill: sentimentChartConfig.positive.color },
    { name: sentimentChartConfig.negative.label, value: distribution.negative, fill: sentimentChartConfig.negative.color },
    { name: sentimentChartConfig.neutral.label, value: distribution.neutral, fill: sentimentChartConfig.neutral.color },
  ].filter(entry => entry.value > 0); // Only show sentiments with counts

  if (pieData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Sentiment Distribution</CardTitle>
          <CardDescription>Breakdown of overall positive, negative, and neutral mentions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No sentiment distribution data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Sentiment Distribution</CardTitle>
        <CardDescription>Breakdown of overall positive, negative, and neutral mentions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={sentimentChartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.15; 
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  if (percent < 0.05 && pieData.length > 2) return null; // Hide label for small slices if many categories

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
                      {`${pieData[index].name} (${(percent * 100).toFixed(1)}%)`}
                    </text>
                  );
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke="hsl(var(--background))"/>
                ))}
              </Pie>
              <RechartsPrimitive.Legend content={<ChartLegendContent />} /> {/* Explicitly use RechartsPrimitive.Legend */}
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OverallSentimentPieChart;
