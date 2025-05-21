import { config } from 'dotenv';
config();

import '@/ai/flows/fact-check-flow.ts';
import '@/ai/flows/accuracy-assessment-flow.ts';
import '@/ai/flows/initial-prompt-flow.ts';