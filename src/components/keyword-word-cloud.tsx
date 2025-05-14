
"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {Keyword} from "@/types/analysis";
import {cn} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface KeywordWordCloudProps {
  keywords: Keyword[];
}

// Function to determine font size based on frequency (customize as needed)
const getFontSize = (frequency: number, maxFrequency: number): string => {
  const minSize = 12; // Minimum font size in px
  const maxSize = 48; // Maximum font size in px
  const scale = (maxSize - minSize) / maxFrequency;
  const size = Math.max(minSize, Math.min(maxSize, minSize + frequency * scale));
   // Use Tailwind text size classes if preferred, e.g., 'text-xs', 'text-lg', 'text-4xl'
   if (size < 14) return 'text-xs';
   if (size < 18) return 'text-sm';
   if (size < 24) return 'text-base';
   if (size < 30) return 'text-lg';
   if (size < 36) return 'text-xl';
   if (size < 42) return 'text-2xl';
   return 'text-3xl'; // or text-4xl etc.
   // return `${size}px`; // Direct pixel size
};

// Function to get color based on sentiment
const getSentimentColor = (sentiment: "positive" | "negative" | "neutral"): string => {
  switch (sentiment) {
    case "positive":
      return "text-positive"; // Use HSL variable
    case "negative":
      return "text-destructive"; // Use HSL variable
    default:
      return "text-muted-foreground"; // Default gray
  }
};

export function KeywordWordCloud({keywords}: KeywordWordCloudProps) {

   // Check if keywords array is empty or not provided
  if (!keywords || keywords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keyword Word Cloud</CardTitle>
           <CardDescription>Most frequent words in mentions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No keywords found for word cloud.</p>
        </CardContent>
      </Card>
    );
  }

  const maxFrequency = Math.max(...keywords.map((k) => k.frequency), 0);

  // Shuffle keywords for better visual distribution in the cloud
  const shuffledKeywords = [...keywords].sort(() => Math.random() - 0.5);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Word Cloud</CardTitle>
         <CardDescription>Most frequent words in mentions. Hover for frequency.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 overflow-hidden p-6">
         <TooltipProvider>
            {shuffledKeywords.map((keyword, index) => (
            <Tooltip key={`${keyword.text}-${index}`} delayDuration={100}>
                <TooltipTrigger asChild>
                 <span
                    className={cn(
                    "inline-block cursor-default transition-all duration-300 ease-out hover:scale-110 hover:z-10",
                    getSentimentColor(keyword.sentiment),
                     getFontSize(keyword.frequency, maxFrequency), // Use the helper function for font size
                    "animate-fade-in opacity-0" // Add animation class
                    )}
                    style={{ animationDelay: `${index * 50}ms` }} // Stagger animation
                 >
                    {keyword.text}
                 </span>
                </TooltipTrigger>
                <TooltipContent>
                <p>Frequency: {keyword.frequency}</p>
                </TooltipContent>
            </Tooltip>
            ))}
         </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// Add necessary CSS for animations in globals.css or via Tailwind config
/*
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
*/
