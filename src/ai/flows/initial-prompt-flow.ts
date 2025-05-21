// src/ai/flows/initial-prompt-flow.ts
'use server';

/**
 * @fileOverview Provides a pre-filled claim for the Truth Sleuth app.
 *
 * - getInitialClaim - A function that returns a pre-filled claim.
 * - InitialClaimOutput - The return type for the getInitialClaim function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialClaimOutputSchema = z.object({
  claim: z.string().describe('A pre-filled claim for the user to explore.'),
});
export type InitialClaimOutput = z.infer<typeof InitialClaimOutputSchema>;

export async function getInitialClaim(): Promise<InitialClaimOutput> {
  return initialPromptFlow();
}

const initialPrompt = ai.definePrompt({
  name: 'initialPrompt',
  output: {schema: InitialClaimOutputSchema},
  prompt: `Return a single controversial claim suitable for fact-checking. The claim should be short, and it should be something that can be easily checked with online sources. Make it interesting and something a user would want to investigate. Return it in JSON format.`, 
});

const initialPromptFlow = ai.defineFlow(
  {
    name: 'initialPromptFlow',
    outputSchema: InitialClaimOutputSchema,
  },
  async () => {
    const {output} = await initialPrompt({});
    return output!;
  }
);
