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
  if (typeof score !== 'number' || Number.isNaN(score) || !Number.isFinite(score)) return 0;
  if (typeof max !== 'number' || Number.isNaN(max) || max <= 0 || !Number.isFinite(max)) return 0;
  return Math.min(100, Math.max(0, (score / max) * 100));
}

export function calculateInterestScores(
  answers: Record<string, number>,
  questions: { id: string; dimension?: string; section: string }[]
): DimensionScores {
  if (!answers || typeof answers !== 'object') {
    answers = {};
  }
  if (!Array.isArray(questions)) {
    questions = [];
  }
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
      if (typeof val === 'number' && !Number.isNaN(val) && val >= 1 && val <= 5) {
        dimSums[q.dimension!].push(val);
      }
    });

  const result: DimensionScores = {
    realistic: 2.5,
    investigative: 2.5,
    artistic: 2.5,
    social: 2.5,
    enterprising: 2.5,
    conventional: 2.5,
  };

  (Object.keys(result) as (keyof DimensionScores)[]).forEach((key) => {
    const arr = dimSums[key];
    if (arr.length > 0) {
      const sum = arr.reduce((a, b) => {
        const av = typeof a === 'number' && !Number.isNaN(a) ? a : 0;
        const bv = typeof b === 'number' && !Number.isNaN(b) ? b : 0;
        return av + bv;
      }, 0);
      const avg = sum / arr.length;
      result[key] = Math.min(5, Math.max(1, avg));
    }
  });

  return result;
}

export function calculateAbilityScores(
  answers: Record<string, number>,
  questions: { id: string; dimension?: string; section: string }[]
): AbilityScores {
  if (!answers || typeof answers !== 'object') {
    answers = {};
  }
  if (!Array.isArray(questions)) {
    questions = [];
  }
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
      if (typeof val === 'number' && !Number.isNaN(val) && val >= 1 && val <= 5) {
        dimSums[q.dimension!].push(val);
      }
    });

  const result: AbilityScores = {
    analytical: 2.5,
    creative: 2.5,
    communication: 2.5,
    leadership: 2.5,
    technical: 2.5,
    emotional: 2.5,
  };

  (Object.keys(result) as (keyof AbilityScores)[]).forEach((key) => {
    const arr = dimSums[key];
    if (arr.length > 0) {
      const sum = arr.reduce((a, b) => {
        const av = typeof a === 'number' && !Number.isNaN(a) ? a : 0;
        const bv = typeof b === 'number' && !Number.isNaN(b) ? b : 0;
        return av + bv;
      }, 0);
      const avg = sum / arr.length;
      result[key] = Math.min(5, Math.max(1, avg));
    }
  });

  return result;
}

export function getTopCareerTypes(interest: DimensionScores) {
  if (!interest || typeof interest !== 'object') {
    return [];
  }
  const keys = (Object.keys(interest) as (keyof DimensionScores)[]).filter(
    (k) => typeof interest[k] === 'number' && !Number.isNaN(interest[k])
  );
  const entries = keys.map((k) => ({
    type: k,
    score: interest[k],
    pct: Math.round(normalizeScore(interest[k], 5)),
    label: INTEREST_LABELS[k] || k,
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, 3);
}

function cosineSimilarity(
  a: Partial<DimensionScores>,
  b: DimensionScores
): number {
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return 0;
  const keys = (Object.keys(a) as (keyof DimensionScores)[]).filter(
    (k) => typeof a[k] === 'number' && !Number.isNaN(a[k]!) && typeof b[k] === 'number' && !Number.isNaN(b[k])
  );
  if (keys.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  keys.forEach((k) => {
    const av = a[k] ?? 0;
    const bv = b[k] ?? 0;
    if (Number.isNaN(av) || Number.isNaN(bv)) return;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  });
  if (normA <= 0 || normB <= 0 || Number.isNaN(normA) || Number.isNaN(normB)) return 0;
  const sqrtA = Math.sqrt(normA);
  const sqrtB = Math.sqrt(normB);
  if (sqrtA <= 0 || sqrtB <= 0 || Number.isNaN(sqrtA) || Number.isNaN(sqrtB)) return 0;
  const result = dot / (sqrtA * sqrtB);
  return Math.min(1, Math.max(0, Number.isNaN(result) ? 0 : result));
}

function valueMatchScore(jobValues: CareerValue[], userValues: CareerValue[]): number {
  if (!Array.isArray(userValues) || userValues.length === 0) return 0.5;
  if (!Array.isArray(jobValues) || jobValues.length === 0) return 0.5;
  const rankMap = new Map<CareerValue, number>();
  userValues.forEach((v, i) => {
    if (v) rankMap.set(v, userValues.length - i);
  });
  let score = 0;
  jobValues.forEach((v) => {
    if (rankMap.has(v)) {
      const rv = rankMap.get(v);
      if (typeof rv === 'number') score += rv;
    }
  });
  const maxPossible = userValues.length * Math.min(jobValues.length, userValues.length);
  if (maxPossible <= 0 || Number.isNaN(score)) return 0.5;
  const result = score / maxPossible;
  return Math.min(1, Math.max(0, Number.isNaN(result) ? 0.5 : result));
}

export function matchJobs(jobs: Job[], assessment: Assessment): MatchedJob[] {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];
  if (!assessment || !assessment.interest || !assessment.values) {
    return jobs.map((j) => ({ ...j, matchScore: 0 }));
  }
  const safeJobs = jobs.filter((j) => j && j.id);
  return safeJobs
    .map((job) => {
      try {
        const interestSim = cosineSimilarity(job.matchDimensions || {}, assessment.interest);
        const valSim = valueMatchScore(job.preferredValues || [], assessment.values);
        const rawScore = interestSim * 0.7 + valSim * 0.3;
        const matchScore = Math.min(100, Math.max(0, Math.round((Number.isNaN(rawScore) ? 0 : rawScore) * 100)));
        return { ...job, matchScore };
      } catch (e) {
        console.error('matchJobs error for job:', job.id, e);
        return { ...job, matchScore: 0 };
      }
    })
    .sort((a, b) => {
      const sa = typeof a.matchScore === 'number' && !Number.isNaN(a.matchScore) ? a.matchScore : 0;
      const sb = typeof b.matchScore === 'number' && !Number.isNaN(b.matchScore) ? b.matchScore : 0;
      return sb - sa;
    });
}

export function calculateAbilityGaps(
  userAbility: AbilityScores,
  job: Job
): AbilityGap[] {
  if (!userAbility || !job || !job.requiredAbilities) return [];
  const required = job.requiredAbilities;
  const gaps: AbilityGap[] = [];
  const abilityKeys = (Object.keys(required) as AbilityDimension[]).filter(
    (k) => typeof required[k] === 'number' && !Number.isNaN(required[k]!)
  );
  abilityKeys.forEach((ability) => {
    const current = typeof userAbility[ability] === 'number' && !Number.isNaN(userAbility[ability])
      ? userAbility[ability]
      : 2.5;
    const target = required[ability]!;
    const gap = Math.max(0, target - current);
    if (gap > 0 && !Number.isNaN(gap)) {
      const priority = gap >= 1.5 ? 'high' : gap >= 0.8 ? 'medium' : 'low';
      gaps.push({ ability, current, required: target, gap, priority });
    }
  });
  gaps.sort((a, b) => {
    const ga = Number.isNaN(a.gap) ? 0 : a.gap;
    const gb = Number.isNaN(b.gap) ? 0 : b.gap;
    return gb - ga;
  });
  return gaps;
}
