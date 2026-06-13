import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  ListTodo,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useCareerStore } from '@/store/useCareerStore';
import type { DailyTask } from '@/types';
import { ABILITY_LABELS, TASK_CATEGORY_LABELS } from '@/types';
import { calculatePlanProgress } from '@/utils/planGenerator';
import { cn } from '@/utils/export';

export default function ActionPage() {
  const navigate = useNavigate();
  const {
    targetJobId,
    jobs,
    abilityGaps,
    dailyTasks,
    toggleTaskComplete,
    currentAssessment,
    generateActionPlan,
  } = useCareerStore();

  const [expandedWeek, setExpandedWeek] = useState(0);

  const targetJob = useMemo(
    () => jobs.find((j) => j.id === targetJobId) || null,
    [jobs, targetJobId]
  );

  const progress = useMemo(() => calculatePlanProgress(dailyTasks), [dailyTasks]);

  const today = useMemo(() => {
    const todayTasks = dailyTasks.filter((t) => !t.completed);
    return todayTasks.slice(0, 3);
  }, [dailyTasks]);

  const weeks = useMemo(() => {
    const w: DailyTask[][] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * 7;
      const end = start + 7;
      const days = dailyTasks.filter((t) => t.day > start && t.day <= end);
      if (days.length > 0) w.push(days);
    }
    return w;
  }, [dailyTasks]);

  if (!currentAssessment) {
    return (
      <div className="container py-10 md:py-14">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">行动清单</h1>
          <p className="text-ink-500 text-lg">基于你的测评结果，生成专属的 30 天提升计划</p>
        </div>

        <div className="card max-w-lg mx-auto p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-sun-100 text-sun-500 flex items-center justify-center mb-5">
            <Sparkles size={32} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-3">先完成职业诊断</h2>
          <p className="text-ink-500 mb-6">
            完成 3 分钟测评后，我们会为你分析能力差距、推荐目标岗位，并自动生成 30 天行动清单
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            去做测评 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (!targetJob) {
    const recommendedJobs = jobs.slice(0, 4);
    return (
      <div className="container py-10 md:py-14">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">行动清单</h1>
          <p className="text-ink-500 text-lg">选择目标岗位，为你生成专属的 30 天提升计划</p>
        </div>

        <div className="card max-w-lg mx-auto p-10 text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-sun-100 text-sun-500 flex items-center justify-center mb-5">
            <ListTodo size={32} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink-900 mb-3">还没有设定目标岗位</h2>
          <p className="text-ink-500 mb-6">选择一个你感兴趣的岗位，我们将为你分析能力差距并生成行动计划</p>
          <button onClick={() => navigate('/jobs')} className="btn-primary">
            浏览岗位库 <ArrowRight size={16} />
          </button>
        </div>

        {recommendedJobs.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold text-ink-900 mb-4">快速选择热门岗位</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    generateActionPlan(job.id);
                  }}
                  className="card p-5 text-left hover:shadow-lift hover:-translate-y-1 transition-all"
                >
                  <div className="font-display text-lg font-semibold text-ink-900 mb-1">{job.title}</div>
                  <div className="text-sm text-ink-500 mb-3">{job.industry}</div>
                  <div className="text-sm font-semibold text-sun-500 flex items-center gap-1">
                    生成计划 <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900">行动清单</h1>
          <span className="tag bg-sun-100 text-sun-500 text-sm">目标：{targetJob.title}</span>
        </div>
        <p className="text-ink-500 text-lg">30 天能力提升计划 · 每天进步一点点</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-7 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-1">整体进度</div>
              <div className="font-display text-4xl font-semibold text-ink-900">{progress}%</div>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#F59E0B"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 251} 251`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp size={24} className="text-sun-500" />
              </div>
            </div>
          </div>

          <div className="h-3 rounded-full bg-ink-100 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sun-400 to-sun-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-ink-500">
            <span>已完成 {dailyTasks.filter((t) => t.completed).length} 项</span>
            <span>共 {dailyTasks.length} 项</span>
          </div>
        </div>

        <div className="card p-7 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-500 uppercase tracking-wide mb-4">
            <Zap size={16} className="text-sun-500" /> 今日待办
          </div>
          {today.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <CheckCircle2 size={36} className="text-mint-500 mb-2" />
              <p className="text-ink-700 font-medium">今日任务全部完成！</p>
              <p className="text-sm text-ink-500">继续保持，明天加油</p>
            </div>
          ) : (
            <div className="space-y-3">
              {today.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTaskComplete(task.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-ink-100 transition-colors text-left group"
                >
                  <Circle
                    size={20}
                    className="mt-0.5 text-ink-300 group-hover:text-sun-500 transition-colors flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 text-sm">{task.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{task.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {abilityGaps.length > 0 && (
        <div className="card p-7 mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={20} className="text-rose-500" />
            <h2 className="font-display text-xl font-semibold text-ink-900">能力差距分析</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {abilityGaps.map((gap) => (
              <div
                key={gap.ability}
                className={cn(
                  'p-5 rounded-xl border',
                  gap.priority === 'high'
                    ? 'bg-rose-50 border-rose-200'
                    : gap.priority === 'medium'
                    ? 'bg-sun-50 border-sun-200'
                    : 'bg-mint-50 border-mint-200'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-semibold text-ink-900">{ABILITY_LABELS[gap.ability]}</div>
                  <span
                    className={cn(
                      'tag text-xs',
                      gap.priority === 'high'
                        ? 'bg-rose-100 text-rose-500'
                        : gap.priority === 'medium'
                        ? 'bg-sun-100 text-sun-500'
                        : 'bg-mint-100 text-mint-500'
                    )}
                  >
                    {gap.priority === 'high' ? '高优先级' : gap.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <div>
                    <span className="text-ink-500">当前：</span>
                    <span className="font-semibold text-ink-900">{gap.current.toFixed(1)}</span>
                  </div>
                  <ArrowRight size={16} className="text-ink-300" />
                  <div>
                    <span className="text-ink-500">目标：</span>
                    <span className="font-semibold text-ink-900">{gap.required.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-ink-300 to-ink-500" style={{ width: `${(gap.current / 5) * 100}%` }} />
                </div>
                <div className="h-2 rounded-full bg-white/60 overflow-hidden mt-1">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      gap.priority === 'high'
                        ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                        : gap.priority === 'medium'
                        ? 'bg-gradient-to-r from-sun-400 to-sun-500'
                        : 'bg-gradient-to-r from-mint-400 to-mint-500'
                    )}
                    style={{ width: `${(gap.required / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={20} className="text-ink-700" />
          <h2 className="font-display text-xl font-semibold text-ink-900">30 天行动计划</h2>
        </div>

        <div className="space-y-4">
          {weeks.map((week, wi) => {
            const isExpanded = expandedWeek === wi;
            const weekDone = week.filter((t) => t.completed).length;
            const weekPct = Math.round((weekDone / week.length) * 100);
            return (
              <div key={wi} className="card overflow-hidden animate-slide-up" style={{ animationDelay: `${wi * 60}ms` }}>
                <button
                  onClick={() => setExpandedWeek(isExpanded ? -1 : wi)}
                  className="w-full p-5 flex items-center justify-between hover:bg-ink-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sun-100 text-sun-500 flex items-center justify-center font-display font-bold text-xl">
                      {wi + 1}
                    </div>
                    <div>
                      <div className="font-display text-lg font-semibold text-ink-900">第 {wi + 1} 周</div>
                      <div className="text-sm text-ink-500">
                        完成 {weekDone}/{week.length} 项
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sun-400 to-sun-500 transition-all"
                          style={{ width: `${weekPct}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-ink-500" /> : <ChevronDown size={20} className="text-ink-500" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-ink-100">
                    <div className="grid gap-2 pt-4">
                      {week.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-xl transition-all',
                            task.completed ? 'bg-mint-50' : 'bg-ink-50 hover:bg-ink-100'
                          )}
                        >
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {task.completed ? (
                              <CheckCircle2 size={22} className="text-mint-500" />
                            ) : (
                              <Circle size={22} className="text-ink-300 hover:text-sun-500 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-ink-500">Day {task.day}</span>
                              <span className={cn('tag text-xs', TASK_CATEGORY_LABELS[task.category].color)}>
                                {TASK_CATEGORY_LABELS[task.category].label}
                              </span>
                            </div>
                            <div className={cn('font-medium text-sm', task.completed ? 'text-ink-500 line-through' : 'text-ink-900')}>
                              {task.title}
                            </div>
                            <div className={cn('text-xs mt-1', task.completed ? 'text-ink-300' : 'text-ink-500')}>
                              {task.description}
                            </div>
                          </div>
                          {task.completed && (
                            <span className="tag bg-mint-100 text-mint-500 text-xs">
                              <Check size={12} /> 已完成
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <button onClick={() => navigate('/jobs')} className="btn-ghost">
          <Target size={16} /> 更换目标岗位
        </button>
        <button onClick={() => navigate('/history')} className="btn-primary">
          <Sparkles size={16} /> 查看历史与导出
        </button>
      </div>
    </div>
  );
}
