import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Download,
  Sparkles,
  History as HistoryIcon,
  GitCompare,
  Compass,
  ArrowRight,
  Star,
  TrendingUp,
  FileText,
  Briefcase,
  Target,
  ListTodo,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCareerStore } from '@/store/useCareerStore';
import type { Assessment } from '@/types';
import { INTEREST_LABELS, ABILITY_LABELS, VALUE_LABELS, CareerValue } from '@/types';
import { matchJobs } from '@/utils/matching';
import { jobs as allJobsData } from '@/data/jobs';
import RadarChart from '@/components/charts/RadarChart';
import Modal from '@/components/ui/Modal';
import { exportElementAsImage, formatDate, cn } from '@/utils/export';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, startReassessment } = useCareerStore();
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  const [showCompare, setShowCompare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportAssessment, setExportAssessment] = useState<Assessment | null>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const sortedHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    const valid = history.filter((a) => a && a.id && a.createdAt);
    return [...valid].sort((a, b) => {
      const t1 = new Date(a.createdAt).getTime();
      const t2 = new Date(b.createdAt).getTime();
      if (Number.isNaN(t1) || Number.isNaN(t2)) return 0;
      return t2 - t1;
    });
  }, [history]);

  const [assess1, assess2] = compareIds;
  const a1 = (assess1 && sortedHistory.find((a) => a.id === assess1)) || null;
  const a2 = (assess2 && sortedHistory.find((a) => a.id === assess2)) || null;

  const handleToggleCompare = (id: string) => {
    if (typeof id !== 'string' || !id) return;
    setCompareIds((prev) => {
      const safePrev: [string | null, string | null] = [
        typeof prev[0] === 'string' ? prev[0] : null,
        typeof prev[1] === 'string' ? prev[1] : null,
      ];
      if (safePrev[0] === id) return [null, safePrev[1]];
      if (safePrev[1] === id) return [safePrev[0], null];
      if (!safePrev[0]) return [id, safePrev[1]];
      if (!safePrev[1]) return [safePrev[0], id];
      return [id, safePrev[1]];
    });
  };

  const handleExport = (assessment: Assessment) => {
    if (!assessment) return;
    setExportAssessment(assessment);
    setShowExport(true);
  };

  const doDownload = async () => {
    if (exportCardRef.current) {
      await exportElementAsImage(exportCardRef.current, 'career-diagnosis.png');
    }
  };

  if (sortedHistory.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="card max-w-lg mx-auto p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-sun-100 text-sun-500 flex items-center justify-center mb-5">
            <HistoryIcon size={32} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 mb-3">暂无历史记录</h1>
          <p className="text-ink-500 mb-6">完成职业诊断后，你的报告将保存在这里，可随时查看与对比</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            开始测评 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">历史记录</h1>
          <p className="text-ink-500 text-lg">
            共 {sortedHistory.length} 次测评 · 追踪你的成长轨迹
          </p>
        </div>
        <div className="flex gap-3">
          {(assess1 && assess2) && (
            <button onClick={() => setShowCompare(true)} className="btn-sun">
              <GitCompare size={16} /> 对比两次测评
            </button>
          )}
          <button
            onClick={() => {
              startReassessment();
              navigate('/');
            }}
            className="btn-ghost"
          >
            <Sparkles size={16} /> 重新测评
          </button>
        </div>
      </div>

      {(assess1 || assess2) && (
        <div className="card p-4 mb-6 bg-sun-100/30 border-sun-300 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm">
            <span className="font-semibold text-ink-900">对比模式：</span>
            <span className="text-ink-700">
              已选择 {[assess1, assess2].filter(Boolean).length}/2 次测评
            </span>
          </div>
          <button onClick={() => setCompareIds([null, null])} className="text-sm text-ink-500 hover:text-ink-900">
            清除选择
          </button>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-5 md:left-6 top-0 bottom-0 w-px bg-ink-200" />

        <div className="space-y-5">
          {sortedHistory.map((assess, i) => {
            const isSelected = compareIds.includes(assess.id);
            const topJobs = assess.topJobs && assess.topJobs.length > 0
              ? assess.topJobs
              : matchJobs(allJobsData, assess).slice(0, 3).map((j) => ({
                  id: j.id, title: j.title, industry: j.industry, matchScore: j.matchScore, salaryRange: j.salaryRange,
                }));
            const prevAssess = i < sortedHistory.length - 1 ? sortedHistory[i + 1] : null;
            const careerChanged = prevAssess && prevAssess.careerTypes[0]?.type !== assess.careerTypes[0]?.type;
            const topValueChanged = prevAssess && prevAssess.values[0] !== assess.values[0];
            return (
              <div key={assess.id} className="relative pl-14 md:pl-16 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="absolute left-0 md:left-1 top-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-4 border-sun-400 flex items-center justify-center shadow-card">
                  <Calendar size={16} className="text-sun-500" />
                </div>

                <div className={cn(
                  'card p-6 transition-all',
                  isSelected && 'ring-2 ring-sun-500 shadow-lift'
                )}>
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <div className="text-sm text-ink-500 mb-1">
                        {formatDate(assess.createdAt)} · 第 {sortedHistory.length - i} 次测评
                      </div>
                      <h3 className="font-display text-xl font-semibold text-ink-900 mb-2">
                        {assess.careerTypes.slice(0, 2).map((c) => c.label).join(' + ')} 型
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {assess.careerTypes.map((ct) => (
                          <span key={ct.type} className="tag bg-sun-100 text-sun-500">
                            <Star size={12} /> {ct.label} {ct.pct}%
                          </span>
                        ))}
                      </div>
                      {(careerChanged || topValueChanged) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {careerChanged && (
                            <span className="tag bg-rose-100 text-rose-500 text-xs">
                              <TrendingUp size={10} /> 核心类型变化
                            </span>
                          )}
                          {topValueChanged && (
                            <span className="tag bg-mint-100 text-mint-500 text-xs">
                              <Compass size={10} /> 首要价值观变化
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCompare(assess.id)}
                        className={cn(
                          'btn-soft !py-2 !px-3 text-sm',
                          isSelected && 'bg-sun-500 text-white hover:bg-sun-400'
                        )}
                      >
                        <GitCompare size={14} />
                        {isSelected ? '已选择' : '对比'}
                      </button>
                      <button
                        onClick={() => handleExport(assess)}
                        className="btn-primary !py-2 !px-3 text-sm"
                      >
                        <Download size={14} /> 导出
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-ink-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Compass size={12} /> 价值观 Top 3
                      </div>
                      <div className="space-y-1.5">
                        {assess.values.slice(0, 3).map((v, idx) => (
                          <div key={v} className="flex items-center gap-2">
                            <span className={cn(
                              'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                              idx === 0 ? 'bg-sun-100 text-sun-500' : idx === 1 ? 'bg-mint-100 text-mint-500' : 'bg-ink-100 text-ink-700'
                            )}>
                              {idx + 1}
                            </span>
                            <span className="font-medium text-ink-900 text-sm">{VALUE_LABELS[v]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-sun-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <FileText size={12} /> Top 3 推荐岗位
                      </div>
                      <div className="space-y-2">
                        {topJobs.map((job, idx) => (
                          <div key={job.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn(
                                'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0',
                                idx === 0 ? 'bg-sun-500 text-white' : 'bg-ink-100 text-ink-700'
                              )}>
                                {idx + 1}
                              </span>
                              <span className="font-medium text-ink-900 text-sm truncate">{job.title}</span>
                            </div>
                            <span className="text-xs text-sun-500 font-bold flex-shrink-0 ml-1">{job.matchScore}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-mint-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Target size={12} /> 能力自评
                      </div>
                      <div className="space-y-1.5">
                        {(Object.entries(assess.ability) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="font-medium text-ink-900 text-sm">{ABILITY_LABELS[k as keyof typeof ABILITY_LABELS]}</span>
                            <span className="text-xs text-ink-500">{v.toFixed(1)}/5</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-ink-900 rounded-xl p-4 text-white">
                      <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Briefcase size={12} /> 工作偏好
                      </div>
                      {assess.preferenceAnswers && assess.preferenceAnswers.length > 0 ? (
                        <div className="space-y-1.5">
                          {assess.preferenceAnswers.slice(0, 3).map((pa) => (
                            <div key={pa.questionId}>
                              <span className="text-xs text-white/50">{pa.questionText.replace('，我更偏好：', '')}</span>
                              <div className="text-sm font-medium text-white">{pa.selectedText}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-white/40">未记录偏好</div>
                      )}
                    </div>
                  </div>

                  {assess.actionPlan && (
                    <div className="border-t border-ink-100 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-ink-700">
                        <ListTodo size={14} className="text-sun-500" />
                        <span className="font-medium">行动计划：{assess.actionPlan.targetJobTitle}</span>
                        <span className="text-ink-400">
                          · {assess.actionPlan.dailyTasks.filter((t) => t.completed).length}/{assess.actionPlan.dailyTasks.length} 已完成
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const store = useCareerStore.getState();
                          store.setCurrentStep(5);
                          store.setTargetJob(assess.actionPlan!.targetJobId);
                          useCareerStore.setState({
                            abilityGaps: assess.actionPlan!.abilityGaps,
                            dailyTasks: assess.actionPlan!.dailyTasks,
                            currentAssessment: assess,
                          });
                          navigate('/action');
                        }}
                        className="text-sm text-sun-500 font-semibold hover:underline flex items-center gap-1"
                      >
                        查看计划 <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        title="测评对比"
        className="max-w-4xl"
      >
        <div className="p-6">
          {!a1 || !a2 ? (
            <div className="text-center py-10 text-ink-500">请选择两次测评进行对比</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="card p-5">
                  <div className="text-sm text-ink-500 mb-1">测评 A</div>
                  <div className="font-display text-lg font-semibold text-ink-900 mb-2">
                    {formatDate(a1.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {a1.careerTypes.slice(0, 2).map((c) => (
                      <span key={c.type} className="tag bg-sun-100 text-sun-500 text-xs">{c.label}</span>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <div className="text-sm text-ink-500 mb-1">测评 B</div>
                  <div className="font-display text-lg font-semibold text-ink-900 mb-2">
                    {formatDate(a2.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {a2.careerTypes.slice(0, 2).map((c) => (
                      <span key={c.type} className="tag bg-mint-100 text-mint-500 text-xs">{c.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <div className="text-sm font-semibold text-ink-700">兴趣维度对比</div>
              </div>
              <RadarChart
                data={(Object.keys(a1.interest) as (keyof typeof a1.interest)[]).map((k) => ({
                  dimension: INTEREST_LABELS[k],
                  A: a1.interest[k],
                  B: a2.interest[k],
                }))}
                series={[
                  { key: 'A', color: '#F59E0B', name: `A · ${formatDate(a1.createdAt)}` },
                  { key: 'B', color: '#10B981', name: `B · ${formatDate(a2.createdAt)}` },
                ]}
                height={300}
              />

              <div className="mt-8 mb-2 flex items-center gap-2">
                <div className="text-sm font-semibold text-ink-700">能力自评对比</div>
              </div>
              <RadarChart
                data={(Object.keys(a1.ability) as (keyof typeof a1.ability)[]).map((k) => ({
                  dimension: ABILITY_LABELS[k],
                  A: a1.ability[k],
                  B: a2.ability[k],
                }))}
                series={[
                  { key: 'A', color: '#F59E0B', name: `A · ${formatDate(a1.createdAt)}` },
                  { key: 'B', color: '#10B981', name: `B · ${formatDate(a2.createdAt)}` },
                ]}
                height={300}
              />

              <div className="mt-8 mb-4 flex items-center gap-2">
                <div className="text-sm font-semibold text-ink-700">价值观排序变化</div>
              </div>
              <div className="card p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  <div className="text-xs font-semibold text-sun-500 text-center">
                    A · {formatDate(a1.createdAt)}
                  </div>
                  <div className="w-6" />
                  <div className="text-xs font-semibold text-mint-500 text-center">
                    B · {formatDate(a2.createdAt)}
                  </div>

                  {(Object.keys(VALUE_LABELS) as CareerValue[]).map((v) => {
                    const rankA = a1.values.indexOf(v) + 1;
                    const rankB = a2.values.indexOf(v) + 1;
                    const diff = rankA - rankB;
                    return (
                      <div key={v} className="contents">
                        <div className={cn(
                          'px-4 py-2.5 rounded-xl text-sm flex items-center justify-between',
                          rankA <= 2 ? 'bg-sun-100 text-ink-900' : 'bg-ink-50 text-ink-700'
                        )}>
                          <span className="font-medium">{VALUE_LABELS[v]}</span>
                          <span className="text-xs font-bold text-sun-500">#{rankA}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-xs font-bold">
                          {diff > 0 ? (
                            <span className="text-mint-500 flex items-center gap-0.5">
                              ↑{diff}
                            </span>
                          ) : diff < 0 ? (
                            <span className="text-rose-500 flex items-center gap-0.5">
                              ↓{Math.abs(diff)}
                            </span>
                          ) : (
                            <span className="text-ink-400">—</span>
                          )}
                        </div>
                        <div className={cn(
                          'px-4 py-2.5 rounded-xl text-sm flex items-center justify-between',
                          rankB <= 2 ? 'bg-mint-100 text-ink-900' : 'bg-ink-50 text-ink-700'
                        )}>
                          <span className="font-medium">{VALUE_LABELS[v]}</span>
                          <span className="text-xs font-bold text-mint-500">#{rankB}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={showExport}
        onClose={() => setShowExport(false)}
        title="导出诊断摘要"
        className="max-w-2xl"
      >
        <div className="p-6">
          {exportAssessment && (
            <>
              <div
                ref={exportCardRef}
                className="paper-bg rounded-2xl p-8 mb-6 border border-ink-100"
                style={{ width: '100%' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-ink-900 text-sun-400 flex items-center justify-center">
                    <Compass size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold text-ink-900">职业罗盘</div>
                    <div className="text-sm text-ink-500">职业诊断摘要 · {formatDate(exportAssessment.createdAt)}</div>
                  </div>
                </div>

                <div className="card p-5 mb-5 bg-gradient-to-br from-ink-900 to-ink-800 text-white">
                  <div className="text-sun-400 text-xs font-semibold uppercase tracking-wide mb-3">你的职业画像</div>
                  <div className="font-display text-3xl font-semibold mb-2">
                    {exportAssessment.careerTypes.slice(0, 2).map((c) => c.label).join(' + ')} 型
                  </div>
                  <div className="text-sm text-white/70">
                    在兴趣维度上表现出强烈的 {exportAssessment.careerTypes[0]?.label} 特质
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="card p-4">
                    <div className="text-xs font-semibold text-ink-500 uppercase mb-2">核心兴趣维度</div>
                    <div className="space-y-1">
                      {exportAssessment.careerTypes.slice(0, 3).map((c, i) => (
                        <div key={c.type} className="flex items-center justify-between text-sm">
                          <span className="text-ink-900">{i + 1}. {c.label}</span>
                          <span className="text-sun-500 font-semibold">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-xs font-semibold text-ink-500 uppercase mb-2">价值观排序</div>
                    <div className="space-y-1">
                      {exportAssessment.values.slice(0, 3).map((v, i) => (
                        <div key={v} className="text-sm text-ink-900">
                          {i + 1}. {VALUE_LABELS[v]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {exportAssessment.topJobs && exportAssessment.topJobs.length > 0 && (
                  <div className="card p-4 mb-5">
                    <div className="text-xs font-semibold text-ink-500 uppercase mb-2">Top 3 推荐岗位</div>
                    <div className="space-y-1">
                      {exportAssessment.topJobs.map((job, i) => (
                        <div key={job.id} className="flex items-center justify-between text-sm">
                          <span className="text-ink-900">{i + 1}. {job.title}（{job.industry}）</span>
                          <span className="text-sun-500 font-semibold">{job.matchScore}% 匹配</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exportAssessment.preferenceAnswers && exportAssessment.preferenceAnswers.length > 0 && (
                  <div className="card p-4 mb-5">
                    <div className="text-xs font-semibold text-ink-500 uppercase mb-2">工作偏好</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {exportAssessment.preferenceAnswers.map((pa) => (
                        <div key={pa.questionId} className="text-sm">
                          <span className="text-ink-500">{pa.questionText.replace('，我更偏好：', '')}：</span>
                          <span className="text-ink-900 font-medium">{pa.selectedText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center text-xs text-ink-500">
                  由 职业罗盘 Career Compass 生成
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowExport(false)} className="btn-ghost">
                  取消
                </button>
                <button onClick={doDownload} className="btn-primary">
                  <Download size={16} /> 下载 PNG
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
