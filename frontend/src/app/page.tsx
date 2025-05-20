"use client";

import {useState} from "react";
import type {AnalysisResults} from "@/types/analysis";
import {BrandSearchBar} from "@/components/brand-search-bar";
import {ResultsDashboard} from "@/components/results-dashboard";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster"; 
import { fetchAnalysisResults } from "@/services/sentiment-analysis"; // Changed import
import { Navbar } from "@/components/layout/navbar"; 

export type AnalysisPeriod = "last_week" | "last_month" | "last_3_months"; 

export default function Home() {
  const [brand, setBrand] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalysisPeriod>("last_month");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(
    null
  );
  const [lastAnalyzedQuery, setLastAnalyzedQuery] = useState<string | null>(null);
  const [lastAnalyzedPeriod, setLastAnalyzedPeriod] = useState<AnalysisPeriod | null>(null);
  
  const {toast} = useToast();

  const handleAnalyze = async (selectedBrand: string, selectedPeriod: AnalysisPeriod) => {
    if (!selectedBrand) {
      toast({
        title: "Brand Missing",
        description: "Please enter a brand name to analyze.",
        variant: "destructive",
      });
      return;
    }
    setBrand(selectedBrand);
    setPeriod(selectedPeriod);
    setIsLoading(true);
    setAnalysisResults(null); 
    setLastAnalyzedQuery(selectedBrand); 
    setLastAnalyzedPeriod(selectedPeriod);

    console.log(
      `Requesting analysis for: ${selectedBrand} over ${selectedPeriod} from backend.`
    );

    try {
      // Call the actual API fetching function
      const results = await fetchAnalysisResults(selectedBrand, selectedPeriod); 
      setAnalysisResults(results);
      if (results.message) {
        toast({
          title: "Analysis Complete",
          description: results.message,
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Analysis Failed",
        description: `Could not fetch sentiment analysis results. ${errorMessage}`,
        variant: "destructive",
      });
      setAnalysisResults(null); 
    } finally {
      setIsLoading(false);
    }
  };

  const showNavbar = !!analysisResults && !isLoading;

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "pt-16" : ""}>
        <section id="hero-section" className="hero-gradient py-12 md:py-24 text-center text-white overflow-hidden">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up opacity-0 animation-delay-200">
            Brand Buzz Analyzer
          </h1>
          <p className="text-lg mb-8 animate-fade-in-up opacity-0 animation-delay-400">
            Search about the reputation of your favorite brand.
          </p>
          <div className="animate-fade-in-up opacity-0 animation-delay-600">
            <BrandSearchBar 
              onAnalyze={handleAnalyze} 
              isLoading={isLoading}
              lastAnalyzedQuery={lastAnalyzedQuery}
              lastAnalyzedPeriod={lastAnalyzedPeriod}
            />
          </div>
        </section>
        <div className="container mx-auto">
          <section id="results-dashboard-section" className="py-12">
            <ResultsDashboard isLoading={isLoading} results={analysisResults} />
          </section>
        </div>
      </div>
      <Toaster />
    </>
  );
}
