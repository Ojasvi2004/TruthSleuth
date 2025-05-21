// src/components/truth-sleuth/TruthSleuthPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getInitialClaim, type InitialClaimOutput } from '@/ai/flows/initial-prompt-flow';
import { factCheckRetrieval, type FactCheckRetrievalOutput } from '@/ai/flows/fact-check-flow';
import { assessAccuracy, type AssessAccuracyOutput } from '@/ai/flows/accuracy-assessment-flow';
import { addHistoryEntry } from '@/actions/history';
import ClaimForm from './ClaimForm';
import ResultsDisplay from './ResultsDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Loader2, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function TruthSleuthPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [claim, setClaim] = useState('');
  const [isLoadingInitialClaim, setIsLoadingInitialClaim] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<string[] | null>(null);
  const [accuracyResult, setAccuracyResult] = useState<AssessAccuracyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialClaim() {
      if (user) { // Only fetch if user is logged in or auth is not loading
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
      } else if (!authLoading) { // If not logged in and auth is done loading
        setIsLoadingInitialClaim(false); // Stop loading, form will be disabled
      }
    }
    if (!authLoading) { // Wait for auth check to complete
        fetchInitialClaim();
    }
  }, [user, authLoading, toast]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      setError("Please log in to sleuth a claim.");
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in.",
      });
      return;
    }

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

      // Save to history
      await addHistoryEntry(user.email, claim, factCheckResult.articles, accuracyData);
      toast({
        title: "Sleuthed!",
        description: "Your query has been processed and saved to history.",
      });

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
  }, [claim, user, toast]);
  
  if (authLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Access Truth Sleuth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Please log in to uncover the truth behind claims and access your personal history.
            </p>
            <Button onClick={() => router.push('/login')} size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">
            Uncover the Truth
            </h1>
            <p className="mt-2 text-muted-foreground">
            Enter a claim or statement below, and let our AI provide an accuracy assessment based on available information.
            </p>
        </div>
        
        <ClaimForm
          claim={claim}
          setClaim={setClaim}
          onSubmit={handleSubmit}
          isLoading={isLoading || (isLoadingInitialClaim && !claim)} // Show loading if initial claim is fetching AND claim is empty
        />

        {error && (
          <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(isLoading && (!articles && !accuracyResult)) ? null : // If main loading and no results yet, ResultsDisplay will show its own skeleton
          <ResultsDisplay
            articles={articles}
            accuracyResult={accuracyResult}
            isLoading={isLoading && (!articles && !accuracyResult)} // Pass loading only if no data yet
          />
        }
      </div>
    </div>
  );
}
