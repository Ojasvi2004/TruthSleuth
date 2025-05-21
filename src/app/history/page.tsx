// src/app/history/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getHistoryEntries, getHistoryEntryById } from '@/actions/history';
import type { HistoryEntry } from '@/types/history';
import { HistoryList } from '@/components/truth-sleuth/HistoryList';
import ResultsDisplay from '@/components/truth-sleuth/ResultsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Inbox, ChevronLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/history');
    }
  }, [user, authLoading, router]);

  const loadHistory = useCallback(async () => {
    if (user) {
      setIsLoadingHistory(true);
      setError(null);
      try {
        const entries = await getHistoryEntries(user.email);
        setHistory(entries);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load history.";
        console.error(errorMessage, e);
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error Loading History",
          description: errorMessage,
        });
      } finally {
        setIsLoadingHistory(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSelectHistoryItem = useCallback(async (entryId: string) => {
    if (!user) return;
    setIsLoadingHistory(true); // Re-use loading state for fetching single item
    try {
      const entry = await getHistoryEntryById(user.email, entryId);
      setSelectedEntry(entry);
    } catch (e) {
       const errorMessage = e instanceof Error ? e.message : "Failed to load history item.";
       console.error(errorMessage, e);
       setError(errorMessage);
       toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, toast]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem-1px)] items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (selectedEntry) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => setSelectedEntry(null)} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Original Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground">{selectedEntry.claim}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sleuthed on: {new Date(selectedEntry.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <ResultsDisplay 
          articles={selectedEntry.articles} 
          accuracyResult={selectedEntry.accuracyResult}
          isLoading={false} // Data is already loaded
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Your Sleuthing History</h1>
        <p className="mt-2 text-muted-foreground">Review your past claims and their assessments.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoadingHistory ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <Card className="text-center shadow-md">
          <CardHeader>
             <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl">No History Yet</CardTitle>
            <CardDescription className="mt-2">
              You haven&apos;t sleuthed any claims. Start by making your first query on the{' '}
              <Button variant="link" onClick={() => router.push('/')} className="p-0 h-auto text-base">main page</Button>.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <HistoryList history={history} onSelectItem={handleSelectHistoryItem} />
      )}
    </div>
  );
}
