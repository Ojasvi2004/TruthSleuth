// src/components/truth-sleuth/HistoryList.tsx
'use client';

import type { HistoryEntry } from '@/types/history';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, Eye } from 'lucide-react';

interface HistoryListProps {
  history: HistoryEntry[];
  onSelectItem: (entryId: string) => void;
}

export function HistoryList({ history, onSelectItem }: HistoryListProps) {
  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <Card key={entry._id.toString()} className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <span>Claim</span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{entry.claim}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelectItem(entry._id.toString())}
              className="shrink-0"
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              Sleuthed on: {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
            </CardDescription>
            {entry.accuracyResult && (
               <p className="text-xs text-muted-foreground mt-1">
                Accuracy: <span className={`font-semibold ${
                  entry.accuracyResult.accuracyScore >= 0.75 ? 'text-green-600' : 
                  entry.accuracyResult.accuracyScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(entry.accuracyResult.accuracyScore * 100)}%
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
