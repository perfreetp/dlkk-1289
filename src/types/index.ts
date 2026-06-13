export interface DimensionScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface AbilityScores {
  analytical: number;
  creative: number;
  communication: number;
  leadership: number;
  technical: number;
  emotional: number;
}

export type CareerValue =
  | 'achievement'
  | 'stability'
  | 'creativity'
  | 'wealth'
  | 'impact'
  | 'balance';

export type InterestDimension = keyof DimensionScores;
export type AbilityDimension = keyof AbilityScores;

export interface Job {
  id: string;
  title: string;
  industry: string;
  salaryRange: string;
  minSalary: number;
  maxSalary: number;
  requiredAbilities: Partial<AbilityScores>;
  dailyDescription: string;
  growthPath: string[];
  growthScore: number;
  tags: string[];
  matchDimensions: Partial<DimensionScores>;
  preferredValues: CareerValue[];
}

export interface PreferenceAnswer {
  questionId: string;
  questionText: string;
  selectedText: string;
  value: number;
}

export interface TopJobSnapshot {
  id: string;
  title: string;
  industry: string;
  matchScore: number;
  salaryRange: string;
}

export interface ActionPlanSnapshot {
  targetJobId: string;
  targetJobTitle: string;
  abilityGaps: AbilityGap[];
  dailyTasks: DailyTask[];
}

export interface Assessment {
  id: string;
  createdAt: string;
  interest: DimensionScores;
  ability: AbilityScores;
  values: CareerValue[];
  preferences: Record<string, number>;
  preferenceAnswers: PreferenceAnswer[];
  careerTypes: { type: string; score: number; pct: number; label: string }[];
  topJobs: TopJobSnapshot[];
  actionPlan: ActionPlanSnapshot | null;
}

export type DailyTaskCategory = 'learn' | 'practice' | 'network' | 'reflect';

export interface DailyTask {
  id: string;
  day: number;
  title: string;
  description: string;
  category: DailyTaskCategory;
  completed: boolean;
}

export interface AbilityGap {
  ability: AbilityDimension;
  current: number;
  required: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
}

export interface Question {
  id: string;
  section: 'interest' | 'ability' | 'values' | 'preference';
  text: string;
  dimension?: InterestDimension | AbilityDimension;
  options: QuestionOption[];
}

export interface MatchedJob extends Job {
  matchScore: number;
}

export const INTEREST_LABELS: Record<InterestDimension, string> = {
  realistic: '现实型',
  investigative: '研究型',
  artistic: '艺术型',
  social: '社会型',
  enterprising: '企业型',
  conventional: '常规型',
};

export const ABILITY_LABELS: Record<AbilityDimension, string> = {
  analytical: '分析能力',
  creative: '创造力',
  communication: '沟通能力',
  leadership: '领导力',
  technical: '技术能力',
  emotional: '情商',
};

export const VALUE_LABELS: Record<CareerValue, string> = {
  achievement: '成就满足',
  stability: '稳定安全',
  creativity: '创造自由',
  wealth: '经济报酬',
  impact: '社会影响',
  balance: '工作生活平衡',
};

export const TASK_CATEGORY_LABELS: Record<DailyTaskCategory, { label: string; color: string }> = {
  learn: { label: '学习', color: 'bg-sun-100 text-sun-500' },
  practice: { label: '实践', color: 'bg-mint-100 text-mint-500' },
  network: { label: '社交', color: 'bg-ink-100 text-ink-700' },
  reflect: { label: '反思', color: 'bg-rose-100 text-rose-500' },
};
