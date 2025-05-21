'use client';

import type { AssessAccuracyOutput } from '@/ai/flows/accuracy-assessment-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Newspaper, Link2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ResultsDisplayProps {
  articles: string[] | null;
  accuracyResult: AssessAccuracyOutput | null;
  isLoading: boolean;
}

function getAccuracyBadge(score: number) {
  if (score >= 0.75) {
    return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="mr-1 h-4 w-4" />Likely Accurate</Badge>;
  } else if (score >= 0.4) {
    return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white"><Info className="mr-1 h-4 w-4" />Mixed/Uncertain</Badge>;
  } else {
    return <Badge variant="destructive"><AlertTriangle className="mr-1 h-4 w-4" />Likely Inaccurate</Badge>;
  }
}


export default function ResultsDisplay({ articles, accuracyResult, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 mt-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-5 w-24 mt-2" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5 text-primary" />
              <Skeleton className="h-6 w-56" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accuracyResult && !articles) {
    return null; 
  }

  return (
    <div className="space-y-8 mt-8">
      {accuracyResult && (
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Target className="h-6 w-6 text-primary" />
              <span>Accuracy Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Accuracy Score: {Math.round(accuracyResult.accuracyScore * 100)}%
              </h3>
              {getAccuracyBadge(accuracyResult.accuracyScore)}
            </div>
            <Progress value={accuracyResult.accuracyScore * 100} className="w-full h-3" 
              aria-label={`Accuracy score ${Math.round(accuracyResult.accuracyScore * 100)}%`} />
            
            <div>
              <h4 className="text-md font-semibold mb-1 text-foreground">Explanation:</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{accuracyResult.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(articles && articles.length > 0) || (accuracyResult && accuracyResult.sources.length > 0) ? (
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Newspaper className="h-6 w-6 text-primary" />
              <span>Evidence & Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {articles && articles.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-2 text-foreground">Relevant Articles & Fact-Checks:</h4>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  {articles.map((article, index) => (
                    <li key={`article-${index}`} className="text-muted-foreground text-sm">{article}</li>
                  ))}
                </ul>
              </div>
            )}
            {accuracyResult && accuracyResult.sources.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-2 mt-4 flex items-center gap-2 text-foreground">
                  <Link2 className="h-5 w-5" />
                  Sources:
                </h4>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  {accuracyResult.sources.map((source, index) => (
                    <li key={`source-${index}`} className="text-sm break-all">
                      <a href={source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-accent transition-colors">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}