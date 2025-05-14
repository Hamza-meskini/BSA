
"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent} from "@/components/ui/chart";
import type {PlatformSentiment} from "@/types/analysis";
import {useMemo} from "react";

interface PlatformComparisonChartProps {
  data: PlatformSentiment[];
}

const chartConfig = {
  positive: { label: "Positive", color: "hsl(var(--chart-2))" }, 
  negative: { label: "Negative", color: "hsl(var(--chart-5))" }, 
  neutral: { label: "Neutral", color: "hsl(var(--muted-foreground))" }, 
} satisfies Record<string, { label: string; color: string }>;

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Sentiment Comparison</CardTitle>
           <CardDescription>Overall sentiment distribution (positive, negative, neutral) across platforms.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No platform sentiment comparison data available.</p>
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
        <CardTitle>Platform Sentiment Comparison</CardTitle>
        <CardDescription>Overall sentiment distribution (positive, negative, neutral) across platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical" margin={{ left: 10, right: 30 }} accessibilityLayer>
              <CartesianGrid horizontal={false} />
               <YAxis
                    dataKey="platform"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={80} 
                />
              <XAxis type="number" hide /> 
              <Tooltip
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                content={<ChartTooltipContent />}
              />
               <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="positive"
                fill="var(--color-positive)"
                stackId="a"
                radius={[0, 4, 4, 0]} 
                animationDuration={500}
                name={chartConfig.positive.label}
              />
              <Bar
                dataKey="neutral"
                fill="var(--color-neutral)"
                stackId="a"
                 radius={0} 
                 animationDuration={500}
                 name={chartConfig.neutral.label}
              />
              <Bar
                dataKey="negative"
                fill="var(--color-negative)"
                stackId="a"
                radius={[4, 0, 0, 4]} 
                animationDuration={500}
                name={chartConfig.negative.label}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
