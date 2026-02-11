// types.ts

/**
 * Represents a single solution option for a crisis.
 */
export interface Solution {
  id: string;
  text: string;
  outcome: 'success' | 'failure'; // Indicates if this solution leads to success or failure
  successMessage?: string; // Message displayed on success
  failureMessage?: string; // Message displayed on failure, often leading to Plan B
  memeImage?: string; // Optional image URL for meme related to the outcome
}

/**
 * Represents a world crisis that the player needs to "solve".
 */
export interface Crisis {
  id: string;
  title: string;
  description: string;
  imageUrl: string; // Image representing the crisis
  solutions: Solution[];
  planB?: Crisis; // Optional Plan B crisis, if solutions fail
}

/**
 * Represents the current state of the game, including crisis, outcome, and hope value.
 */
export interface GameState {
  currentCrisis: Crisis;
  hopeValue: number;
  message: string;
  showShareReport: boolean;
  isDailyChallenge: boolean;
  todaySavedCount: number;
}
