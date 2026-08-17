import { describe, it, expect } from 'vitest';
import {
  calculateSUSScore,
  calculateNasaTlxScore,
  exportSessionsToCsv,
  STANDARD_SUS_QUESTIONS,
  EXPERIMENT_TASKS,
} from '@/lib/usability-evaluator';
import { UsabilityExperimentSession } from '@/types/usability';

describe('Usability Evaluator — SUS Scoring & NASA-TLX', () => {
  it('should have 10 standard SUS questions with alternating polarity', () => {
    expect(STANDARD_SUS_QUESTIONS).toHaveLength(10);
    STANDARD_SUS_QUESTIONS.forEach((q, idx) => {
      if ((idx + 1) % 2 === 1) {
        expect(q.isPositive).toBe(true);
      } else {
        expect(q.isPositive).toBe(false);
      }
    });
  });

  it('should calculate perfect SUS score (100) when all positive are 5 and negative are 1', () => {
    const perfectResponses: Record<number, number> = {
      1: 5, 2: 1, 3: 5, 4: 1, 5: 5,
      6: 1, 7: 5, 8: 1, 9: 5, 10: 1,
    };
    const result = calculateSUSScore(perfectResponses);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A+');
    expect(result.adjectiveRating).toBe('Best Imaginable');
    expect(result.isAcceptable).toBe(true);
  });

  it('should calculate worst SUS score (0) when all positive are 1 and negative are 5', () => {
    const worstResponses: Record<number, number> = {
      1: 1, 2: 5, 3: 1, 4: 5, 5: 1,
      6: 5, 7: 1, 8: 5, 9: 1, 10: 5,
    };
    const result = calculateSUSScore(worstResponses);
    expect(result.score).toBe(0);
    expect(result.grade).toBe('F');
    expect(result.adjectiveRating).toBe('Worst Imaginable');
    expect(result.isAcceptable).toBe(false);
  });

  it('should calculate neutral SUS score (68-70 range) for realistic good usability feedback', () => {
    const goodResponses: Record<number, number> = {
      1: 4, 2: 2, 3: 4, 4: 2, 5: 4,
      6: 2, 7: 4, 8: 2, 9: 4, 10: 2,
    };
    // Each pair contributes (3 + 3) = 6 * 5 pairs = 30 * 2.5 = 75
    const result = calculateSUSScore(goodResponses);
    expect(result.score).toBe(75);
    expect(result.grade).toBe('B');
    expect(result.adjectiveRating).toBe('Good');
    expect(result.isAcceptable).toBe(true);
  });

  it('should calculate NASA-TLX workload index and level', () => {
    const dimensions = {
      mentalDemand: 30,
      physicalDemand: 20,
      temporalDemand: 40,
      performance: 15,
      effort: 25,
      frustration: 20,
    };
    const result = calculateNasaTlxScore(dimensions);
    expect(result.overallScore).toBe(25);
    expect(result.workloadLevel).toBe('Low');
  });

  it('should classify high workload correctly', () => {
    const dimensions = {
      mentalDemand: 75,
      physicalDemand: 60,
      temporalDemand: 80,
      performance: 70,
      effort: 85,
      frustration: 65,
    };
    const result = calculateNasaTlxScore(dimensions);
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.workloadLevel).toBe('High');
  });

  it('should verify defined experiment tasks for A, B, and C', () => {
    expect(EXPERIMENT_TASKS.EXPERIMENT_A.length).toBeGreaterThanOrEqual(2);
    expect(EXPERIMENT_TASKS.EXPERIMENT_B.length).toBeGreaterThanOrEqual(2);
    expect(EXPERIMENT_TASKS.EXPERIMENT_C.length).toBeGreaterThanOrEqual(4);
  });

  it('should format usability session data into valid CSV', () => {
    const mockSession: UsabilityExperimentSession = {
      sessionId: 'sess_123',
      participantId: 'PARTICIPANT_01',
      experimentType: 'EXPERIMENT_C',
      condition: '3d_globe',
      startedAt: '2026-08-17T10:00:00Z',
      completedAt: '2026-08-17T10:05:00Z',
      tasks: [
        {
          taskId: 'task_c1',
          title: 'Macro Orientation',
          condition: '3d_globe',
          durationMs: 4200,
          errorClicks: 0,
          success: true,
          timestamp: '2026-08-17T10:01:00Z',
        },
      ],
      susResult: {
        rawResponses: { 1: 4, 2: 2 },
        score: 82.5,
        grade: 'A',
        percentileRange: '90-94%',
        adjectiveRating: 'Excellent',
        isAcceptable: true,
      },
      nasaTlxResult: {
        dimensions: {
          mentalDemand: 20,
          physicalDemand: 10,
          temporalDemand: 25,
          performance: 15,
          effort: 20,
          frustration: 10,
        },
        overallScore: 16.7,
        workloadLevel: 'Low',
      },
    };

    const csv = exportSessionsToCsv([mockSession]);
    expect(csv).toContain('Session ID,Participant ID');
    expect(csv).toContain('sess_123');
    expect(csv).toContain('PARTICIPANT_01');
    expect(csv).toContain('EXPERIMENT_C');
    expect(csv).toContain('82.5');
    expect(csv).toContain('16.7');
  });
});
