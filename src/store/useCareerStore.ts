import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Assessment,
  DimensionScores,
  AbilityScores,
  CareerValue,
  DailyTask,
  AbilityGap,
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

      setCurrentStep: (step) => set({ currentStep: step }),

      setAnswer: (qid, value) =>
        set((state) => ({ answers: { ...state.answers, [qid]: value } })),

      setValueRanking: (ranking) => set({ valueRanking: ranking }),

      submitAssessment: () => {
        const state = get();
        const interest: DimensionScores = calculateInterestScores(state.answers, questions);
        const ability: AbilityScores = calculateAbilityScores(state.answers, questions);
        const preferences: Record<string, number> = {};
        questions
          .filter((q) => q.section === 'preference')
          .forEach((q) => {
            if (state.answers[q.id] != null) preferences[q.id] = state.answers[q.id];
          });

        const careerTypes = getTopCareerTypes(interest);

        const assessment: Assessment = {
          id: `assess-${Date.now()}`,
          createdAt: new Date().toISOString(),
          interest,
          ability,
          values: state.valueRanking,
          preferences,
          careerTypes,
        };

        set({
          currentAssessment: assessment,
          history: [...state.history, assessment],
          currentStep: 5,
        });
      },

      startReassessment: () => {
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

      toggleFavorite: (jobId) =>
        set((state) => ({
          favoriteJobIds: state.favoriteJobIds.includes(jobId)
            ? state.favoriteJobIds.filter((id) => id !== jobId)
            : [...state.favoriteJobIds, jobId],
        })),

      toggleCompare: (jobId) =>
        set((state) => {
          const exists = state.selectedJobIds.includes(jobId);
          if (exists) {
            return { selectedJobIds: state.selectedJobIds.filter((id) => id !== jobId) };
          }
          if (state.selectedJobIds.length >= 3) return {};
          return { selectedJobIds: [...state.selectedJobIds, jobId] };
        }),

      clearCompare: () => set({ selectedJobIds: [] }),

      setTargetJob: (jobId) => set({ targetJobId: jobId }),

      generateActionPlan: (jobId) => {
        const state = get();
        const job = state.jobs.find((j) => j.id === jobId);
        if (!job || !state.currentAssessment) return;
        const gaps = calculateAbilityGaps(state.currentAssessment.ability, job);
        const tasks = generateDailyPlan(gaps, 30);
        set({ abilityGaps: gaps, dailyTasks: tasks, targetJobId: jobId });
      },

      toggleTaskComplete: (taskId) =>
        set((state) => ({
          dailyTasks: state.dailyTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        })),

      getMatchedJobs: () => {
        const state = get();
        if (!state.currentAssessment) {
          return state.jobs.map((j) => ({ ...j, matchScore: 60 }));
        }
        return matchJobs(state.jobs, state.currentAssessment);
      },

      clearAll: () =>
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
        }),
    }),
    {
      name: 'career-compass-store',
      partialize: (state) => ({
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
