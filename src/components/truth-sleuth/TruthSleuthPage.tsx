'use client';

import { useState, useEffect, useCallback } from 'react';
import { getInitialClaim, type InitialClaimOutput } from '@/ai/flows/initial-prompt-flow';
import { factCheckRetrieval, type FactCheckRetrievalOutput } from '@/ai/flows/fact-check-flow';
import { assessAccuracy, type AssessAccuracyOutput } from '@/ai/flows/accuracy-assessment-flow';
import ClaimForm from './ClaimForm';
import ResultsDisplay from './ResultsDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function TruthSleuthPage() {
  const [claim, setClaim] = useState('');
  const [isLoadingInitialClaim, setIsLoadingInitialClaim] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<string[] | null>(null);
  const [accuracyResult, setAccuracyResult] = useState<AssessAccuracyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInitialClaim() {
      try {
        setError(null);
        const initialClaimData: InitialClaimOutput = await getInitialClaim();
        setClaim(initialClaimData.claim);
      } catch (e) {
        console.error("Failed to fetch initial claim:", e);
        setError(e instanceof Error ? e.message : "Failed to load an initial claim. Please enter your own.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch an initial claim.",
        });
      } finally {
        setIsLoadingInitialClaim(false);
      }
    }
    fetchInitialClaim();
  }, [toast]);

  const handleSubmit = useCallback(async () => {
    if (!claim.trim()) {
      setError("Please enter a claim to sleuth.");
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Claim cannot be empty.",
      });
      return;
    }

    setIsLoading(true);
    setArticles(null);
    setAccuracyResult(null);
    setError(null);

    try {
      const factCheckResult: FactCheckRetrievalOutput = await factCheckRetrieval({ claim });
      setArticles(factCheckResult.articles);

      const evidenceText = factCheckResult.articles.join('\n\n');
      const accuracyData: AssessAccuracyOutput = await assessAccuracy({ claim, evidence: evidenceText });
      setAccuracyResult(accuracyData);
    } catch (e) {
      console.error("Error during fact-checking:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during fact-checking.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Fact-Checking Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [claim, toast]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">
        Uncover the Truth
      </h1>
      <p className="text-center text-muted-foreground">
        Enter a claim or statement below, and let our AI provide an accuracy assessment based on available information.
      </p>
      
      <ClaimForm
        claim={claim}
        setClaim={setClaim}
        onSubmit={handleSubmit}
        isLoading={isLoading || isLoadingInitialClaim}
      />

      {error && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ResultsDisplay
        articles={articles}
        accuracyResult={accuracyResult}
        isLoading={isLoading}
      />
    </div>
  );
}