'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

interface ClaimFormProps {
  claim: string;
  setClaim: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ClaimForm({ claim, setClaim, onSubmit, isLoading }: ClaimFormProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Enter Your Claim</CardTitle>
      </CardHeader>
      <form onSubmit={handleFormSubmit}>
        <CardContent>
          <Textarea
            placeholder={isLoading && !claim ? "Loading initial claim..." : "e.g., The moon is made of cheese."}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={3}
            className="resize-none text-base"
            disabled={isLoading && !claim} 
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Sleuth It!
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}