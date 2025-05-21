// src/ai/flows/accuracy-assessment-flow.ts
'use server';

/**
 * @fileOverview Assesses the accuracy of a claim based on provided evidence.
 *
 * - assessAccuracy - A function that assesses the accuracy of a claim.
 * - AssessAccuracyInput - The input type for the assessAccuracy function.
 * - AssessAccuracyOutput - The return type for the assessAccuracy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessAccuracyInputSchema = z.object({
  claim: z.string().describe('The claim to assess.'),
  evidence: z.string().describe('The evidence to use to assess the claim.'),
});
export type AssessAccuracyInput = z.infer<typeof AssessAccuracyInputSchema>;

const AssessAccuracyOutputSchema = z.object({
  accuracyScore: z.number().describe('The accuracy score of the claim (0-1).'),
  explanation: z.string().describe('The explanation of the accuracy score.'),
  sources: z.array(z.string()).describe('The sources used to assess the claim.'),
});
export type AssessAccuracyOutput = z.infer<typeof AssessAccuracyOutputSchema>;

export async function assessAccuracy(input: AssessAccuracyInput): Promise<AssessAccuracyOutput> {
  return assessAccuracyFlow(input);
}

const assessAccuracyPrompt = ai.definePrompt({
  name: 'assessAccuracyPrompt',
  input: {schema: AssessAccuracyInputSchema},
  output: {schema: AssessAccuracyOutputSchema},
  prompt: `You are an AI assistant that assesses the accuracy of a claim based on the provided evidence. 

  Provide an accuracy score between 0 and 1, where 0 is completely inaccurate and 1 is completely accurate.
  Provide an explanation for the accuracy score.
  List the sources used to assess the claim.

  Claim: {{{claim}}}
  Evidence: {{{evidence}}}
  `,
});

const assessAccuracyFlow = ai.defineFlow(
  {
    name: 'assessAccuracyFlow',
    inputSchema: AssessAccuracyInputSchema,
    outputSchema: AssessAccuracyOutputSchema,
  },
  async input => {
    const {output} = await assessAccuracyPrompt(input);
    return output!;
  }
);
