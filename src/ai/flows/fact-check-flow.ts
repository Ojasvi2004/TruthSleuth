'use server';
/**
 * @fileOverview Retrieves articles and fact-checks related to a claim using the Perplexity API.
 *
 * - factCheckRetrieval - A function that retrieves relevant articles and fact-checks related to a claim.
 * - FactCheckRetrievalInput - The input type for the factCheckRetrieval function.
 * - FactCheckRetrievalOutput - The return type for the factCheckRetrieval function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FactCheckRetrievalInputSchema = z.object({
  claim: z.string().describe('The claim to check.'),
});
export type FactCheckRetrievalInput = z.infer<typeof FactCheckRetrievalInputSchema>;

const FactCheckRetrievalOutputSchema = z.object({
  articles: z
    .array(z.string())
    .describe('A list of relevant articles and fact-checks related to the claim.'),
});
export type FactCheckRetrievalOutput = z.infer<typeof FactCheckRetrievalOutputSchema>;

export async function factCheckRetrieval(input: FactCheckRetrievalInput): Promise<FactCheckRetrievalOutput> {
  return factCheckRetrievalFlow(input);
}

const factCheckRetrievalPrompt = ai.definePrompt({
  name: 'factCheckRetrievalPrompt',
  input: {schema: FactCheckRetrievalInputSchema},
  output: {schema: FactCheckRetrievalOutputSchema},
  prompt: `You are an AI assistant that retrieves relevant articles and fact-checks related to a claim.

  Claim: {{{claim}}}

  Please provide a list of relevant articles and fact-checks.`,
});

const factCheckRetrievalFlow = ai.defineFlow(
  {
    name: 'factCheckRetrievalFlow',
    inputSchema: FactCheckRetrievalInputSchema,
    outputSchema: FactCheckRetrievalOutputSchema,
  },
  async input => {
    const {output} = await factCheckRetrievalPrompt(input);
    return output!;
  }
);
