import type { Question } from '@/types';

const LIKERT: Question['options'] = [
  { id: '1', text: '非常不符合', value: 1 },
  { id: '2', text: '不太符合', value: 2 },
  { id: '3', text: '一般', value: 3 },
  { id: '4', text: '比较符合', value: 4 },
  { id: '5', text: '非常符合', value: 5 },
];

export const questions: Question[] = [
  // 兴趣测评 - 8题
  { id: 'i1', section: 'interest', text: '我喜欢动手操作工具和机械设备', dimension: 'realistic', options: LIKERT },
  { id: 'i2', section: 'interest', text: '我热衷于探索事物背后的原理和规律', dimension: 'investigative', options: LIKERT },
  { id: 'i3', section: 'interest', text: '我喜欢用艺术形式表达自己的想法', dimension: 'artistic', options: LIKERT },
  { id: 'i4', section: 'interest', text: '我享受帮助他人解决问题的过程', dimension: 'social', options: LIKERT },
  { id: 'i5', section: 'interest', text: '我喜欢领导团队并做出重要决策', dimension: 'enterprising', options: LIKERT },
  { id: 'i6', section: 'interest', text: '我倾向于按照既定规则和流程完成工作', dimension: 'conventional', options: LIKERT },
  { id: 'i7', section: 'interest', text: '我对编程、数据分析等技术工作感兴趣', dimension: 'investigative', options: LIKERT },
  { id: 'i8', section: 'interest', text: '我喜欢组织活动、与人打交道', dimension: 'social', options: LIKERT },

  // 能力自评 - 8题
  { id: 'a1', section: 'ability', text: '我能够快速拆解复杂问题并找到解决方案', dimension: 'analytical', options: LIKERT },
  { id: 'a2', section: 'ability', text: '我经常能提出新颖独特的创意', dimension: 'creative', options: LIKERT },
  { id: 'a3', section: 'ability', text: '我能清晰地表达观点并说服他人', dimension: 'communication', options: LIKERT },
  { id: 'a4', section: 'ability', text: '我擅长协调团队成员、推动项目进展', dimension: 'leadership', options: LIKERT },
  { id: 'a5', section: 'ability', text: '我学习新技术和工具的速度很快', dimension: 'technical', options: LIKERT },
  { id: 'a6', section: 'ability', text: '我能敏锐地感知他人的情绪和需求', dimension: 'emotional', options: LIKERT },
  { id: 'a7', section: 'ability', text: '我习惯用数据驱动决策而非直觉', dimension: 'analytical', options: LIKERT },
  { id: 'a8', section: 'ability', text: '我能在压力下保持冷静、理性应对', dimension: 'emotional', options: LIKERT },

  // 工作偏好 - 6题（情景选择）
  {
    id: 'p1',
    section: 'preference',
    text: '在工作节奏上，我更偏好：',
    options: [
      { id: 'p1a', text: '节奏稳定、任务可预期', value: 1 },
      { id: 'p1b', text: '有一定变化但大体可规划', value: 2 },
      { id: 'p1c', text: '充满挑战、每天都不一样', value: 3 },
    ],
  },
  {
    id: 'p2',
    section: 'preference',
    text: '在工作方式上，我更偏好：',
    options: [
      { id: 'p2a', text: '独立完成、深度专注', value: 1 },
      { id: 'p2b', text: '部分协作、部分独立', value: 2 },
      { id: 'p2c', text: '频繁沟通、团队协作', value: 3 },
    ],
  },
  {
    id: 'p3',
    section: 'preference',
    text: '在决策权限上，我更偏好：',
    options: [
      { id: 'p3a', text: '按标准流程执行即可', value: 1 },
      { id: 'p3b', text: '有一定的自主空间', value: 2 },
      { id: 'p3c', text: '自主决策、对结果负责', value: 3 },
    ],
  },
  {
    id: 'p4',
    section: 'preference',
    text: '在工作地点上，我更偏好：',
    options: [
      { id: 'p4a', text: '固定办公、面对面协作', value: 1 },
      { id: 'p4b', text: '灵活办公、混合模式', value: 2 },
      { id: 'p4c', text: '完全远程、自由安排', value: 3 },
    ],
  },
  {
    id: 'p5',
    section: 'preference',
    text: '在成长路径上，我更看重：',
    options: [
      { id: 'p5a', text: '专业深度、成为领域专家', value: 1 },
      { id: 'p5b', text: 'T型发展、广度深度兼备', value: 2 },
      { id: 'p5c', text: '管理路线、带领更大团队', value: 3 },
    ],
  },
  {
    id: 'p6',
    section: 'preference',
    text: '在公司规模上，我更偏好：',
    options: [
      { id: 'p6a', text: '大型企业、体系完善', value: 1 },
      { id: 'p6b', text: '中型公司、兼顾稳定与成长', value: 2 },
      { id: 'p6c', text: '创业公司、高速成长', value: 3 },
    ],
  },
];

export const LIKERT_OPTIONS = LIKERT;
