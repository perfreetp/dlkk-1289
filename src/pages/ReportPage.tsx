import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, TrendingUp, Award, Target } from 'lucide-react';
import { useCareerStore } from '@/store/useCareerStore';
import RadarChart from '@/components/charts/RadarChart';
import ProgressBar from '@/components/ui/ProgressBar';
import { INTEREST_LABELS, ABILITY_LABELS, VALUE_LABELS } from '@/types';
import { formatDate, cn } from '@/utils/export';

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentAssessment, getMatchedJobs, generateActionPlan, setTargetJob } = useCareerStore();

  if (!currentAssessment) {
    return (
      <div className="container py-20 text-center">
        <div className="card max-w-lg mx-auto p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-sun-100 text-sun-500 flex items-center justify-center mb-5">
            <Sparkles size={32} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 mb-3">还没有测评结果</h1>
          <p className="text-ink-500 mb-6">请先完成职业诊断问卷，获取你的专属报告</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            去做测评 <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const { interest, ability, values, careerTypes, createdAt } = currentAssessment;
  const matchedJobs = getMatchedJobs().slice(0, 6);

  const radarData = (Object.keys(interest) as (keyof typeof interest)[]).map((k) => ({
    dimension: INTEREST_LABELS[k],
    score: interest[k],
  }));

  const abilityData = (Object.keys(ability) as (keyof typeof ability)[]).map((k) => ({
    dimension: ABILITY_LABELS[k],
    score: ability[k],
  }));

  const handleGeneratePlan = (jobId: string) => {
    setTargetJob(jobId);
    generateActionPlan(jobId);
    navigate('/action');
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-3">
          <span>生成于 {formatDate(createdAt)}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">
          你的职业画像
        </h1>
        <p className="text-ink-500 text-lg">基于多维度测评，为你定制的职业适配分析报告</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="card p-7 bg-gradient-to-br from-ink-900 to-ink-800 text-white h-full animate-slide-up">
            <div className="flex items-center gap-2 text-sun-400 text-sm font-semibold mb-4">
              <Award size={16} /> 你的核心职业类型
            </div>
            <div className="space-y-3 mb-6">
              {careerTypes.map((ct, i) => (
                <div key={ct.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-sun-400">
                      {i + 1}
                    </span>
                    <span className="font-display text-lg font-semibold">{ct.label}</span>
                  </div>
                  <span className="text-sm text-sun-400">{(ct.score / 5 * 100).toFixed(0)}分</span>
                </div>
              ))}
            </div>
            <div className="pt-5 border-t border-white/10">
              <p className="text-sm text-white/70 leading-relaxed">
                {generatePersonalityDesc(careerTypes.map(c => c.type))}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-4">
              <Star size={16} className="text-sun-500" /> 兴趣维度分布
            </div>
            <RadarChart
              data={radarData}
              series={[{ key: 'score', color: '#F59E0B', name: '兴趣' }]}
              height={260}
            />
          </div>
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-4">
              <TrendingUp size={16} className="text-mint-500" /> 能力自评分布
            </div>
            <RadarChart
              data={abilityData}
              series={[{ key: 'score', color: '#10B981', name: '能力' }]}
              height={260}
            />
          </div>
        </div>
      </div>

      <div className="card p-7 mb-8 animate-slide-up">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-5">
          <Target size={16} className="text-rose-500" /> 职业价值观排序
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {values.map((v, i) => (
            <div
              key={v}
              className={cn(
                'p-4 rounded-xl text-center transition-all',
                i === 0 ? 'bg-sun-100' : i === 1 ? 'bg-mint-100' : 'bg-ink-100'
              )}
            >
              <div className={cn(
                'text-2xl font-bold font-display mb-1',
                i === 0 ? 'text-sun-500' : i === 1 ? 'text-mint-500' : 'text-ink-700'
              )}>
                #{i + 1}
              </div>
              <div className="font-semibold text-ink-900 text-sm">{VALUE_LABELS[v]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-ink-900">为你推荐的岗位</h2>
          <button onClick={() => navigate('/jobs')} className="text-sm text-ink-500 hover:text-ink-900 flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matchedJobs.map((job, i) => (
            <div
              key={job.id}
              className="card p-6 group hover:shadow-lift hover:-translate-y-1 transition-all animate-slide-up cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => handleGeneratePlan(job.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink-900 group-hover:text-sun-500 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-ink-500">{job.industry}</p>
                </div>
                <span className="tag bg-sun-100 text-sun-500 text-sm font-bold px-3 py-1">
                  {job.matchScore}%
                </span>
              </div>
              <ProgressBar value={job.matchScore} color="sun" showLabel={false} className="mb-4" />
              <div className="flex items-center justify-between">
                <span className="text-ink-700 font-semibold">{job.salaryRange}</span>
                <div className="flex gap-1 flex-wrap justify-end">
                  {job.tags.slice(0, 2).map((t) => (
                    <span key={t} className="tag bg-ink-100 text-ink-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-ink-100 text-sm text-ink-500 group-hover:text-sun-500 transition-colors flex items-center gap-1">
                生成行动计划 <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => navigate('/')} className="btn-ghost">
          重新测评
        </button>
        <button onClick={() => navigate('/jobs')} className="btn-primary">
          浏览岗位库 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function generatePersonalityDesc(types: string[]): string {
  const descs: Record<string, string> = {
    realistic: '喜欢动手实践、追求结果导向，适合技术或操作性强的工作。',
    investigative: '好奇心强，热爱研究分析，适合数据、科研或技术类岗位。',
    artistic: '富有想象力和创造力，追求自我表达，适合设计、内容或创意类工作。',
    social: '热心助人、善于沟通，适合教育、咨询或人力资源类岗位。',
    enterprising: '有领导力、喜欢冒险，适合管理、销售或创业类方向。',
    conventional: '细致严谨、有条理，适合财务、行政或流程类工作。',
  };
  return types.slice(0, 2).map((t) => descs[t] || '').join('');
}
