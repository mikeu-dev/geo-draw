export type ExperimentType = 'EXPERIMENT_A' | 'EXPERIMENT_B' | 'EXPERIMENT_C';

export type ConditionA = 'black' | 'dark_gradient' | 'dark_stars';
export type ConditionB = 'no_atmosphere' | 'subtle_atmosphere' | 'strong_atmosphere';
export type ConditionC = '2d_mercator' | '3d_globe';

export type AnyCondition = ConditionA | ConditionB | ConditionC;

export interface UsabilityTask {
  id: string;
  title: string;
  description: string;
  hint?: string;
  targetFeatureId?: string;
  expectedAction: 'click_feature' | 'draw_polygon' | 'move_vertex' | 'inspect_coordinate' | 'boundary_detect';
  targetCoordinates?: [number, number]; // [lon, lat]
}

export interface TaskRecord {
  taskId: string;
  title: string;
  condition: AnyCondition;
  durationMs: number;
  errorClicks: number;
  success: boolean;
  precisionDeviationMeters?: number;
  timestamp: string;
}

export interface SUSQuestion {
  id: number;
  text: string;
  isPositive: boolean; // Odd items (1,3,5,7,9) positive; even items (2,4,6,8,10) negative
}

export interface SUSResult {
  rawResponses: Record<number, number>; // 1-10 -> 1-5 scale
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  percentileRange: string;
  adjectiveRating: 'Best Imaginable' | 'Excellent' | 'Good' | 'OK' | 'Poor' | 'Worst Imaginable';
  isAcceptable: boolean;
}

export interface NasaTlxDimensions {
  mentalDemand: number; // 0 - 100
  physicalDemand: number;
  temporalDemand: number;
  performance: number; // 0 (good) - 100 (poor)
  effort: number;
  frustration: number;
}

export interface NasaTlxResult {
  dimensions: NasaTlxDimensions;
  overallScore: number; // 0 - 100
  workloadLevel: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface UsabilityExperimentSession {
  sessionId: string;
  participantId: string;
  experimentType: ExperimentType;
  condition: AnyCondition;
  startedAt: string;
  completedAt?: string;
  tasks: TaskRecord[];
  susResult?: SUSResult;
  nasaTlxResult?: NasaTlxResult;
}
