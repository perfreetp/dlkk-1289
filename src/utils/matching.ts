import type {
  DimensionScores,
  AbilityScores,
  Job,
  MatchedJob,
  Assessment,
  CareerValue,
  AbilityGap,
  AbilityDimension,
} from '@/types';
import { INTEREST_LABELS } from '@/types';

export function normalizeScore(score: number, max: number = 5): number {
  return Math.min(100, Math.max(0, (score / max) * 100));
}

export function calculateInterestScores(
  answers: Record<string, number>,
  questions: { id: string; dimension?: string; section: string }[]
): DimensionScores {
  const dimSums: Record<string, number[]> = {
    realistic: [],
    investigative: [],
    artistic: [],
    social: [],
    enterprising: [],
    conventional: [],
  };

  questions
    .filter((q) => q.section === 'interest' && q.dimension)
    .forEach((q) => {
      const val = answers[q.id];
      if (val != null) {
        dimSums[q.dimension!].push(val);
      }
    });

  const result: DimensionScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  (Object.keys(result) as (keyof DimensionScores)[]).forEach((key) => {
    const arr = dimSums[key];
    result[key] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 2.5;
  });

  return result;
}

export function calculateAbilityScores(
  answers: Record<string, number>,
  questions: { id: string; dimension?: string; section: string }[]
): AbilityScores {
  const dimSums: Record<string, number[]> = {
    analytical: [],
    creative: [],
    communication: [],
    leadership: [],
    technical: [],
    emotional: [],
  };

  questions
    .filter((q) => q.section === 'ability' && q.dimension)
    .forEach((q) => {
      const val = answers[q.id];
      if (val != null) {
        dimSums[q.dimension!].push(val);
      }
    });

  const result: AbilityScores = {
    analytical: 0,
    creative: 0,
    communication: 0,
    leadership: 0,
    technical: 0,
    emotional: 0,
  };

  (Object.keys(result) as (keyof AbilityScores)[]).forEach((key) => {
    const arr = dimSums[key];
    result[key] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 2.5;
  });

  return result;
}

export function getTopCareerTypes(interest: DimensionScores) {
  const entries = (Object.keys(interest) as (keyof DimensionScores)[]).map((k) => ({
    type: k,
    score: interest[k],
    pct: Math.round(normalizeScore(interest[k], 5)),
    label: INTEREST_LABELS[k],
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, 3);
}

function cosineSimilarity(
  a: Partial<DimensionScores>,
  b: DimensionScores
): number {
  const keys = Object.keys(a) as (keyof DimensionScores)[];
  if (keys.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  keys.forEach((k) => {
    const av = a[k] ?? 0;
    const bv = b[k] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function valueMatchScore(jobValues: CareerValue[], userValues: CareerValue[]): number {
  if (!userValues || userValues.length === 0) return 0.5;
  const rankMap = new Map<CareerValue, number>();
  userValues.forEach((v, i) => rankMap.set(v, userValues.length - i));
  let score = 0;
  jobValues.forEach((v) => {
    if (rankMap.has(v)) score += rankMap.get(v)!;
  });
  const maxPossible = userValues.length * Math.min(jobValues.length, userValues.length);
  return maxPossible > 0 ? score / maxPossible : 0.5;
}

export function matchJobs(jobs: Job[], assessment: Assessment): MatchedJob[] {
  return jobs
    .map((job) => {
      const interestSim = cosineSimilarity(job.matchDimensions, assessment.interest);
      const valSim = valueMatchScore(job.preferredValues, assessment.values);
      const matchScore = Math.round((interestSim * 0.7 + valSim * 0.3) * 100);
      return { ...job, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function calculateAbilityGaps(
  userAbility: AbilityScores,
  job: Job
): AbilityGap[] {
  const required = job.requiredAbilities;
  const gaps: AbilityGap[] = [];
  (Object.keys(required) as AbilityDimension[]).forEach((ability) => {
    const current = userAbility[ability];
    const target = required[ability]!;
    const gap = Math.max(0, target - current);
    if (gap > 0) {
      const priority = gap >= 1.5 ? 'high' : gap >= 0.8 ? 'medium' : 'low';
      gaps.push({ ability, current, required: target, gap, priority });
    }
  });
  gaps.sort((a, b) => b.gap - a.gap);
  return gaps;
}
