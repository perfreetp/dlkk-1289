import type { DailyTask, AbilityGap, AbilityDimension, DailyTaskCategory } from '@/types';
import { ABILITY_LABELS } from '@/types';

const TASK_TEMPLATES: Record<AbilityDimension, { title: string; desc: string; category: DailyTaskCategory }[]> = {
  analytical: [
    { title: '阅读一篇数据分析文章', desc: '关注数据分析方法论，做笔记总结3个要点', category: 'learn' },
    { title: '练习一个业务分析案例', desc: '假设一个业务场景，写出分析思路和框架', category: 'practice' },
    { title: '复盘本周决策', desc: '回顾本周3个重要决策，用数据角度评估是否合理', category: 'reflect' },
  ],
  creative: [
    { title: '浏览优秀设计作品', desc: '收集5个优质产品/设计案例，提炼创新点', category: 'learn' },
    { title: '30分钟头脑风暴', desc: '围绕一个主题，产出至少10个创意点子', category: 'practice' },
    { title: '尝试跨界联想', desc: '将两个不相关领域的概念结合，产生新想法', category: 'reflect' },
  ],
  communication: [
    { title: '学习沟通表达技巧', desc: '阅读一篇沟通类文章或观看10分钟演讲视频', category: 'learn' },
    { title: '主动发起深度交流', desc: '和同事/朋友进行一次有主题的深度对话', category: 'practice' },
    { title: '复盘当日沟通', desc: '回顾今天一次重要对话，分析可改进之处', category: 'reflect' },
  ],
  leadership: [
    { title: '阅读领导力文章', desc: '学习团队管理和领导艺术的方法论', category: 'learn' },
    { title: '承担小组牵头角色', desc: '在工作/学习项目中主动承担组织协调', category: 'practice' },
    { title: '建立反馈习惯', desc: '给一位伙伴真诚的建设性反馈', category: 'network' },
  ],
  technical: [
    { title: '学习新技术知识点', desc: '通过文档或教程学习1个技术概念或工具', category: 'learn' },
    { title: '动手编码练习', desc: '写至少50行代码，完成一个小功能或练习', category: 'practice' },
    { title: '阅读优秀开源代码', desc: '阅读GitHub上一个优质项目的核心实现', category: 'learn' },
  ],
  emotional: [
    { title: '情绪觉察练习', desc: '记录今日3次情绪波动，分析触发原因', category: 'reflect' },
    { title: '学习共情表达', desc: '阅读一篇关于共情和情绪智力的文章', category: 'learn' },
    { title: '真诚关心他人', desc: '主动关心一位朋友/同事的近况', category: 'network' },
  ],
};

const GENERAL_TASKS = [
  { title: '更新职业目标追踪', desc: '花10分钟回顾本周进展与目标差距', category: 'reflect' as DailyTaskCategory },
  { title: '拓展行业人脉', desc: '在LinkedIn或社群添加1位目标领域从业者', category: 'network' as DailyTaskCategory },
  { title: '行业资讯阅读', desc: '阅读3篇目标行业的最新资讯或深度文章', category: 'learn' as DailyTaskCategory },
];

export function generateDailyPlan(gaps: AbilityGap[], days: number = 30): DailyTask[] {
  const tasks: DailyTask[] = [];
  const highPriority = gaps.filter((g) => g.priority === 'high');
  const mediumPriority = gaps.filter((g) => g.priority === 'medium');
  const lowPriority = gaps.filter((g) => g.priority === 'low');
  const allGaps = [...highPriority, ...mediumPriority, ...lowPriority];

  for (let day = 1; day <= days; day++) {
    let pool: { title: string; desc: string; category: DailyTaskCategory }[] = [];

    if (allGaps.length > 0) {
      const gapIdx = (day - 1) % allGaps.length;
      const gap = allGaps[gapIdx];
      const templates = TASK_TEMPLATES[gap.ability];
      pool = pool.concat(templates.map((t) => ({
        ...t,
        title: `【${ABILITY_LABELS[gap.ability]}】${t.title}`,
      })));
    }

    pool = pool.concat(GENERAL_TASKS);

    const taskIdx = (day - 1) % pool.length;
    const task = pool[taskIdx];
    const secondTask = pool[(taskIdx + 1) % pool.length];

    tasks.push({
      id: `task-${day}-1`,
      day,
      title: task.title,
      description: task.desc,
      category: task.category,
      completed: false,
    });

    if (day % 3 === 0) {
      tasks.push({
        id: `task-${day}-2`,
        day,
        title: secondTask.title,
        description: secondTask.desc,
        category: secondTask.category,
        completed: false,
      });
    }
  }

  return tasks;
}

export function calculatePlanProgress(tasks: DailyTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}
