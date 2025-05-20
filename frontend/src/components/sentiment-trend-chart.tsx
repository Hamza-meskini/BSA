"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent} from "@/components/ui/chart";
import type {SentimentTrendPoint} from "@/types/analysis";
import {useMemo} from "react";

interface SentimentTrendChartProps {
  data: SentimentTrendPoint[];
}

// Configuration for chart colors and labels
const chartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-2))", // Greenish color from theme
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-5))", // Reddish color from theme
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--muted-foreground))", // Gray color from theme
  },
} satisfies Record<string, { label: string; color: string }>;

export function SentimentTrendChart({data}: SentimentTrendChartProps) {

   // Memoize formatted data to prevent recalculation on every render
   const formattedData = useMemo(() => {
    // Format date for better readability on the X-axis
    return data.map(point => ({
      ...point,
      displayDate: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);


  // Display a message if no data is available
  if (!data || data.length === 0) {
    return (
      <Card id="sentiment-trend-chart">
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
           <CardDescription>Trend of sentiment over the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No sentiment trend data available.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card id="sentiment-trend-chart">
      <CardHeader>
        <CardTitle>Sentiment Trend</CardTitle>
        <CardDescription>Trend of sentiment counts over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* ChartContainer sets up context for chart elements like Tooltip and Legend */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{top: 10, right: 30, left: 0, bottom: 0}}
              accessibilityLayer // Improves accessibility for screen readers
              stackOffset="none" // Ensure areas are not stacked by default unless intended
            >
              {/* Defines gradients for the area fills */}
              <defs>
                 <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-positive)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-positive)" stopOpacity={0.1}/>
                 </linearGradient>
                 <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-negative)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-negative)" stopOpacity={0.1}/>
                 </linearGradient>
                 <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-neutral)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--color-neutral)" stopOpacity={0.1}/>
                 </linearGradient>
               </defs>
              {/* Grid lines */}
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              {/* X-axis displaying the formatted date */}
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20} // Adjust gap for better label visibility
              />
              {/* Y-axis displaying the count */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()} // Format numbers with commas
                // Removed domain setting to allow automatic scaling based on data
              />
              {/* Tooltip configuration */}
              <Tooltip
                cursor={{fill: "hsl(var(--muted)/0.3)"}} // Use muted color for cursor fill
                content={<ChartTooltipContent indicator="line" />} // Use custom tooltip content from ui/chart
              />
              {/* Legend configuration */}
               <ChartLegend content={<ChartLegendContent />} /> {/* Use custom legend content from ui/chart */}

              {/* Area for Positive sentiment */}
              <Area
                type="monotone" // Smooth curve
                dataKey="positive" // Maps to the 'positive' field in data
                stroke="var(--color-positive)" // Line color
                fill="url(#fillPositive)" // Gradient fill
                fillOpacity={0.4}
                stackId="1" // Stack areas with the same ID
                strokeWidth={2}
                activeDot={{r: 6}} // Style for the dot when hovered
                 animationDuration={500} // Smooth transition animation
              />
              {/* Area for Neutral sentiment - Drawn before negative to be potentially overlaid */}
               <Area
                type="monotone"
                dataKey="neutral" // Maps to the 'neutral' field in data
                stroke="var(--color-neutral)" // Line color
                fill="url(#fillNeutral)" // Gradient fill
                 fillOpacity={0.3}
                stackId="1" // Stack areas with the same ID
                 strokeWidth={2}
                 activeDot={{r: 6}}
                 animationDuration={500}
              />
              {/* Area for Negative sentiment */}
              <Area
                type="monotone"
                dataKey="negative" // Maps to the 'negative' field in data
                stroke="var(--color-negative)" // Line color
                fill="url(#fillNegative)" // Gradient fill
                 fillOpacity={0.4}
                stackId="1" // Stack areas with the same ID
                 strokeWidth={2}
                 activeDot={{r: 6}}
                 animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
