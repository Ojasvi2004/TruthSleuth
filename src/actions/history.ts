// src/actions/history.ts
'use server';

import clientPromise from '@/lib/mongodb';
import type { AssessAccuracyOutput } from '@/ai/flows/accuracy-assessment-flow';
import type { HistoryEntry } from '@/types/history';
import { ObjectId } from 'mongodb';

const DB_NAME = 'journaldb'; // As per your URI
const COLLECTION_NAME = 'truthSleuthHistory';

export async function addHistoryEntry(
  userId: string,
  claim: string,
  articles: string[] | null,
  accuracyResult: AssessAccuracyOutput | null
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save history.');
  }
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<Omit<HistoryEntry, '_id'>>(COLLECTION_NAME);

    const newEntry = {
      userId,
      claim,
      articles,
      accuracyResult,
      timestamp: new Date(),
    };

    await collection.insertOne(newEntry);
  } catch (error) {
    console.error('Failed to add history entry:', error);
    throw new Error('Could not save your query to history.');
  }
}

export async function getHistoryEntries(userId: string): Promise<HistoryEntry[]> {
   if (!userId) {
    throw new Error('User ID is required to fetch history.');
  }
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<HistoryEntry>(COLLECTION_NAME);

    const entries = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50) // Optional: limit number of entries
      .toArray();
    
    // Convert ObjectId to string for client-side compatibility
    return entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
    }));
  } catch (error) {
    console.error('Failed to get history entries:', error);
    throw new Error('Could not retrieve your history.');
  }
}

export async function getHistoryEntryById(userId: string, entryId: string): Promise<HistoryEntry | null> {
  if (!userId || !entryId) {
    throw new Error('User ID and Entry ID are required.');
  }
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<HistoryEntry>(COLLECTION_NAME);

    const entry = await collection.findOne({ _id: new ObjectId(entryId), userId });
    if (entry) {
      return {
        ...entry,
        _id: entry._id.toString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get history entry by ID:', error);
    // Handle potential ObjectId conversion error
    if (error instanceof Error && error.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
        console.warn("Invalid entryId format:", entryId);
        return null;
    }
    throw new Error('Could not retrieve the specific history entry.');
  }
}
