import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Assessment,
  DimensionScores,
  AbilityScores,
  CareerValue,
  DailyTask,
  AbilityGap,
  PreferenceAnswer,
  TopJobSnapshot,
  ActionPlanSnapshot,
} from '@/types';
import { questions } from '@/data/questions';
import { jobs as mockJobs } from '@/data/jobs';
import {
  calculateInterestScores,
  calculateAbilityScores,
  getTopCareerTypes,
  matchJobs,
  calculateAbilityGaps,
} from '@/utils/matching';
import { generateDailyPlan } from '@/utils/planGenerator';

interface CareerStore {
  currentStep: number;
  answers: Record<string, number>;
  valueRanking: CareerValue[];
  currentAssessment: Assessment | null;
  history: Assessment[];
  jobs: typeof mockJobs;
  favoriteJobIds: string[];
  selectedJobIds: string[];
  abilityGaps: AbilityGap[];
  dailyTasks: DailyTask[];
  targetJobId: string | null;

  setCurrentStep: (step: number) => void;
  setAnswer: (qid: string, value: number) => void;
  setValueRanking: (ranking: CareerValue[]) => void;
  submitAssessment: () => void;
  startReassessment: () => void;
  toggleFavorite: (jobId: string) => void;
  toggleCompare: (jobId: string) => void;
  clearCompare: () => void;
  setTargetJob: (jobId: string | null) => void;
  generateActionPlan: (jobId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  getMatchedJobs: () => (typeof mockJobs[0] & { matchScore: number })[];
  clearAll: () => void;
}

const DEFAULT_VALUES: CareerValue[] = ['achievement', 'stability', 'creativity', 'wealth', 'impact', 'balance'];

const STORE_VERSION = 2;

function isValidLikertValue(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v) && v >= 1 && v <= 5;
}

function isValidValueRanking(r: unknown): r is CareerValue[] {
  if (!Array.isArray(r)) return false;
  if (r.length !== 6) return false;
  const validSet = new Set(DEFAULT_VALUES);
  const seen = new Set();
  for (const v of r) {
    if (!validSet.has(v)) return false;
    if (seen.has(v)) return false;
    seen.add(v);
  }
  return true;
}

function sanitizeAnswers(answers: Record<string, number>): Record<string, number> {
  if (!answers || typeof answers !== 'object') return {};
  const sanitized: Record<string, number> = {};
  Object.keys(answers).forEach((k) => {
    const v = answers[k];
    if (isValidLikertValue(v)) {
      sanitized[k] = v;
    }
  });
  return sanitized;
}

function sanitizeAssessment(a: unknown): Assessment | null {
  if (!a || typeof a !== 'object') return null;
  const obj = a as Record<string, unknown>;
  if (typeof obj.id !== 'string' || !obj.id) return null;
  if (typeof obj.createdAt !== 'string') return null;
  if (typeof obj.interest !== 'object' || !obj.interest) return null;
  if (typeof obj.ability !== 'object' || !obj.ability) return null;
  if (!Array.isArray(obj.values)) return null;
  if (typeof obj.careerTypes !== 'object' || !Array.isArray(obj.careerTypes)) return null;
  return a as Assessment;
}

function sanitizeHistory(h: unknown): Assessment[] {
  if (!Array.isArray(h)) return [];
  return h.map(sanitizeAssessment).filter(Boolean) as Assessment[];
}

function sanitizeStringArray(arr: unknown, validSet?: Set<string>): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((x) => {
    if (typeof x !== 'string' || !x) return false;
    if (validSet && !validSet.has(x)) return false;
    return true;
  });
}

function sanitizeDailyTasks(t: unknown): DailyTask[] {
  if (!Array.isArray(t)) return [];
  return t.filter((x) => x && typeof x === 'object' && typeof x.id === 'string');
}

function sanitizeAbilityGaps(g: unknown): AbilityGap[] {
  if (!Array.isArray(g)) return [];
  return g.filter((x) => x && typeof x === 'object' && x.ability);
}

function migrateState(persistedState: unknown): Partial<CareerStore> {
  if (!persistedState || typeof persistedState !== 'object') {
    return {};
  }
  const state = persistedState as Record<string, unknown>;
  const version = typeof state.version === 'number' ? state.version : 0;
  const jobIds = new Set(mockJobs.map((j) => j.id));

  return {
    currentStep: typeof state.currentStep === 'number' && state.currentStep >= 0 && state.currentStep <= 5
      ? state.currentStep
      : 0,
    answers: sanitizeAnswers(state.answers as Record<string, number>),
    valueRanking: isValidValueRanking(state.valueRanking) ? state.valueRanking : DEFAULT_VALUES,
    currentAssessment: sanitizeAssessment(state.currentAssessment),
    history: sanitizeHistory(state.history),
    favoriteJobIds: sanitizeStringArray(state.favoriteJobIds, jobIds),
    selectedJobIds: sanitizeStringArray(state.selectedJobIds, jobIds).slice(0, 3),
    abilityGaps: sanitizeAbilityGaps(state.abilityGaps),
    dailyTasks: sanitizeDailyTasks(state.dailyTasks),
    targetJobId: typeof state.targetJobId === 'string' && jobIds.has(state.targetJobId)
      ? state.targetJobId
      : null,
  };
}

let _isSubmitting = false;

export const useCareerStore = create<CareerStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: {},
      valueRanking: DEFAULT_VALUES,
      currentAssessment: null,
      history: [],
      jobs: mockJobs,
      favoriteJobIds: [],
      selectedJobIds: [],
      abilityGaps: [],
      dailyTasks: [],
      targetJobId: null,

      setCurrentStep: (step) => {
        if (typeof step === 'number' && !Number.isNaN(step) && step >= 0 && step <= 5) {
          set({ currentStep: step });
        }
      },

      setAnswer: (qid, value) => {
        if (typeof qid !== 'string' || !qid) return;
        if (!isValidLikertValue(value)) return;
        set((state) => ({ answers: { ...state.answers, [qid]: value } }));
      },

      setValueRanking: (ranking) => {
        if (!isValidValueRanking(ranking)) return;
        set({ valueRanking: ranking });
      },

      submitAssessment: () => {
        if (_isSubmitting) return;
        _isSubmitting = true;
        try {
          const state = get();
          const interest: DimensionScores = calculateInterestScores(state.answers, questions);
          const ability: AbilityScores = calculateAbilityScores(state.answers, questions);
          const preferences: Record<string, number> = {};
          const preferenceAnswers: PreferenceAnswer[] = [];

          questions
            .filter((q) => q.section === 'preference')
            .forEach((q) => {
              const val = state.answers[q.id];
              if (typeof val === 'number' && !Number.isNaN(val) && val >= 1 && val <= 5) {
                preferences[q.id] = val;
                const selected = q.options.find((o) => o.value === val);
                preferenceAnswers.push({
                  questionId: q.id,
                  questionText: q.text,
                  selectedText: selected ? selected.text : '',
                  value: val,
                });
              }
            });

          const careerTypes = getTopCareerTypes(interest);

          const matchedJobs = matchJobs(mockJobs, {
            interest,
            ability,
            values: isValidValueRanking(state.valueRanking) ? state.valueRanking : DEFAULT_VALUES,
            preferences,
            careerTypes,
          } as Assessment);

          const topJobs: TopJobSnapshot[] = matchedJobs.slice(0, 3).map((j) => ({
            id: j.id,
            title: j.title,
            industry: j.industry,
            matchScore: j.matchScore,
            salaryRange: j.salaryRange,
          }));

          const assessment: Assessment = {
            id: `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            interest,
            ability,
            values: isValidValueRanking(state.valueRanking) ? state.valueRanking : DEFAULT_VALUES,
            preferences,
            preferenceAnswers,
            careerTypes,
            topJobs,
            actionPlan: null,
          };

          const currentHistory = Array.isArray(state.history) ? state.history : [];
          const validHistory = currentHistory.filter((h) => h && h.id);

          set({
            currentAssessment: assessment,
            history: [...validHistory, assessment],
            currentStep: 5,
          });
        } finally {
          setTimeout(() => {
            _isSubmitting = false;
          }, 300);
        }
      },

      startReassessment: () => {
        _isSubmitting = false;
        set({
          currentStep: 0,
          answers: {},
          valueRanking: DEFAULT_VALUES,
          selectedJobIds: [],
          abilityGaps: [],
          dailyTasks: [],
          targetJobId: null,
        });
      },

      toggleFavorite: (jobId) => {
        if (typeof jobId !== 'string' || !jobId) return;
        const job = get().jobs.find((j) => j.id === jobId);
        if (!job) return;
        set((state) => {
          const exists = state.favoriteJobIds.includes(jobId);
          return {
            favoriteJobIds: exists
              ? state.favoriteJobIds.filter((id) => id !== jobId)
              : [...state.favoriteJobIds, jobId],
          };
        });
      },

      toggleCompare: (jobId) =>
        set((state) => {
          if (typeof jobId !== 'string' || !jobId) return {};
          const job = state.jobs.find((j) => j.id === jobId);
          if (!job) return {};
          const exists = state.selectedJobIds.includes(jobId);
          if (exists) {
            return { selectedJobIds: state.selectedJobIds.filter((id) => id !== jobId) };
          }
          if (state.selectedJobIds.length >= 3) return {};
          return { selectedJobIds: [...state.selectedJobIds, jobId] };
        }),

      clearCompare: () => set({ selectedJobIds: [] }),

      setTargetJob: (jobId) => {
        if (jobId === null) {
          set({ targetJobId: null });
          return;
        }
        if (typeof jobId !== 'string' || !jobId) return;
        const job = get().jobs.find((j) => j.id === jobId);
        if (!job) return;
        set({ targetJobId: jobId });
      },

      generateActionPlan: (jobId) => {
        const state = get();
        const job = state.jobs.find((j) => j.id === jobId);
        if (!job || !state.currentAssessment) return;
        try {
          const gaps = calculateAbilityGaps(state.currentAssessment.ability, job);
          const tasks = generateDailyPlan(gaps, 30);
          const planSnapshot: ActionPlanSnapshot = {
            targetJobId: job.id,
            targetJobTitle: job.title,
            abilityGaps: gaps,
            dailyTasks: tasks,
          };
          const updatedAssessment: Assessment = {
            ...state.currentAssessment,
            actionPlan: planSnapshot,
          };
          const updatedHistory = (Array.isArray(state.history) ? state.history : []).map((h) =>
            h && h.id === updatedAssessment.id ? updatedAssessment : h
          );
          set({
            currentAssessment: updatedAssessment,
            history: updatedHistory,
            abilityGaps: gaps,
            dailyTasks: tasks,
            targetJobId: jobId,
          });
        } catch (e) {
          console.error('generateActionPlan failed:', e);
        }
      },

      toggleTaskComplete: (taskId) =>
        set((state) => {
          if (typeof taskId !== 'string' || !taskId) return {};
          const updatedTasks = state.dailyTasks.map((t) =>
            t && t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          let updatedAssessment = state.currentAssessment;
          let updatedHistory = state.history;
          if (updatedAssessment && updatedAssessment.actionPlan) {
            updatedAssessment = {
              ...updatedAssessment,
              actionPlan: { ...updatedAssessment.actionPlan, dailyTasks: updatedTasks },
            };
            updatedHistory = (Array.isArray(state.history) ? state.history : []).map((h) =>
              h && h.id === updatedAssessment!.id ? updatedAssessment! : h
            );
          }
          return { dailyTasks: updatedTasks, currentAssessment: updatedAssessment, history: updatedHistory };
        }),

      getMatchedJobs: () => {
        const state = get();
        if (!state.currentAssessment) {
          return state.jobs.map((j) => ({ ...j, matchScore: 0 }));
        }
        return matchJobs(state.jobs, state.currentAssessment);
      },

      clearAll: () => {
        _isSubmitting = false;
        set({
          currentStep: 0,
          answers: {},
          valueRanking: DEFAULT_VALUES,
          currentAssessment: null,
          history: [],
          favoriteJobIds: [],
          selectedJobIds: [],
          abilityGaps: [],
          dailyTasks: [],
          targetJobId: null,
        });
      },
    }),
    {
      name: 'career-compass-store',
      version: STORE_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        try {
          const migrated = migrateState(persistedState);
          return { ...(persistedState as object), ...migrated, version: STORE_VERSION };
        } catch (e) {
          console.error('State migration failed, using defaults:', e);
          return { version: STORE_VERSION };
        }
      },
      partialize: (state) => ({
        version: STORE_VERSION,
        currentStep: state.currentStep,
        answers: state.answers,
        valueRanking: state.valueRanking,
        currentAssessment: state.currentAssessment,
        history: state.history,
        favoriteJobIds: state.favoriteJobIds,
        selectedJobIds: state.selectedJobIds,
        abilityGaps: state.abilityGaps,
        dailyTasks: state.dailyTasks,
        targetJobId: state.targetJobId,
      }),
    }
  )
);
