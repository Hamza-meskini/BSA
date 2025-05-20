"use client";

import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
// Removed getBrandSuggestions and Brand import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {AnalysisPeriod} from "@/app/page";
import {Loader2} from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandSearchBarProps {
  onAnalyze: (brand: string, period: AnalysisPeriod) => void;
  isLoading: boolean;
  lastAnalyzedQuery: string | null;
  lastAnalyzedPeriod: AnalysisPeriod | null;
}

export function BrandSearchBar({onAnalyze, isLoading, lastAnalyzedQuery, lastAnalyzedPeriod}: BrandSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Removed suggestions state
  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalysisPeriod>("last_month");

  // Removed useEffect for fetching suggestions

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Removed handleSuggestionClick function

  const handleAnalyzeClick = () => {
    onAnalyze(searchQuery, selectedPeriod);
  };

  const isAnalyzed = lastAnalyzedQuery === searchQuery && lastAnalyzedPeriod === selectedPeriod;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 max-w-3xl mx-auto">
      <div className="relative w-full md:w-1/2">
        <Input
          type="text"
          placeholder="Enter a brand (e.g., Nike, Starbucks)"
          value={searchQuery}
          onChange={handleSearchChange}
          className={cn(
            "rounded-full shadow-md text-foreground bg-background/80 placeholder:text-muted-foreground transition-all duration-300 ease-in-out",
            "hover:shadow-lg",
            "focus:scale-[1.02] focus:shadow-xl focus:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
            )}
          disabled={isLoading}
        />
        {/* Removed suggestions list UI */}
      </div>

      <div className="w-full md:w-auto">
        <Select
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as AnalysisPeriod)}
          disabled={isLoading}
        >
          <SelectTrigger 
            className={cn(
              "w-full md:w-[180px] rounded-full shadow-md text-foreground bg-background/80 border-input transition-all duration-300 ease-in-out hover:shadow-lg",
              "focus:scale-[1.02] focus:shadow-xl focus:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
              "data-[state=open]:scale-[1.02] data-[state=open]:shadow-xl data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/50 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background"
            )}
            >
            <SelectValue placeholder="Select Period"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_week">Last Week</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleAnalyzeClick}
        className="rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto transition-all duration-300 ease-in-out group focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background active:scale-95"
        disabled={!searchQuery || isLoading || isAnalyzed}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            Analyzing...
          </>
        ) : (
          <span className="group-hover:scale-105 transition-transform duration-200 ease-in-out">
            Analyze Sentiment
          </span>
        )}
      </Button>
    </div>
  );
}
