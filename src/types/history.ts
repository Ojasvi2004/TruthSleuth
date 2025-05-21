// src/types/history.ts
import type { AssessAccuracyOutput } from '@/ai/flows/accuracy-assessment-flow';
import type { ObjectId } from 'mongodb';

export interface HistoryEntry {
  _id: ObjectId | string; // ObjectId from MongoDB, string when passing around
  userId: string;
  claim: string;
  articles: string[] | null;
  accuracyResult: AssessAccuracyOutput | null;
  timestamp: Date;
}
