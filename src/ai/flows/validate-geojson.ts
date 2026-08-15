'use server';

/**
 * @fileOverview Fast, deterministic GeoJSON validation utility (RFC 7946).
 * Replaced heavy LLM token calls with 0ms deterministic validation.
 */

import { validateGeoJSONDeterministic } from '@/lib/geojson-validator';

export type ValidateGeoJSONInput = string;

export interface ValidateGeoJSONOutput {
  isValid: boolean;
  feedback: string;
}

export async function validateGeoJSON(input: ValidateGeoJSONInput): Promise<ValidateGeoJSONOutput> {
  const result = validateGeoJSONDeterministic(input);
  return {
    isValid: result.isValid,
    feedback: result.feedback,
  };
}

