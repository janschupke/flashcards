export interface CharacterPerformance {
  characterIndex: number;
  correct: number;
  total: number;
  lastSeen?: number;
}

export interface StoredCounters {
  correctAnswers: number;
  totalSeen: number;
  totalAttempted: number;
  lastUpdated: number;
}

export interface StorageData {
  characterPerformance: CharacterPerformance[];
}
