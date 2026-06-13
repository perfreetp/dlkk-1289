import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  GitCompare,
  X,
  TrendingUp,
  DollarSign,
  Briefcase,
  BookOpen,
  Star,
  Target,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useCareerStore } from '@/store/useCareerStore';
import type { Job } from '@/types';
import { ABILITY_LABELS } from '@/types';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import SalaryBarChart from '@/components/charts/SalaryBarChart';
import { cn } from '@/utils/export';

type SortOption = 'match' | 'salary' | 'growth';

export default function JobsPage() {
  const navigate = useNavigate();
  const {
    getMatchedJobs,
    favoriteJobIds,
    toggleFavorite,
    selectedJobIds,
    toggleCompare,
    clearCompare,
    generateActionPlan,
    setTargetJob,
    currentAssessment,
  } = useCareerStore();

  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 50);
    setSearch(val);
  };

  const allJobs = getMatchedJobs();

  const industries = useMemo(() => {
    const set = new Set(allJobs.map((j) => j.industry));
    return ['all', ...Array.from(set)];
  }, [allJobs]);

  const filteredJobs = useMemo(() => {
    let list = [...allJobs];
    if (onlyFavorites) {
      list = list.filter((j) => favoriteJobIds.includes(j.id));
    }
    if (search) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (industry !== 'all') {
      list = list.filter((j) => j.industry === industry);
    }
    list.sort((a, b) => {
      if (sortBy === 'salary') return b.maxSalary - a.maxSalary;
      if (sortBy === 'growth') return b.growthScore - a.growthScore;
      return b.matchScore - a.matchScore;
    });
    return list;
  }, [allJobs, search, industry, sortBy, onlyFavorites, favoriteJobIds]);

  const selectedForCompare = selectedJobIds
    .map((id) => allJobs.find((j) => j.id === id))
    .filter(Boolean) as (Job & { matchScore: number })[];

  const handleGeneratePlan = (jobId: string) => {
    setTargetJob(jobId);
    generateActionPlan(jobId);
    navigate('/action');
  };

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-3">岗位库</h1>
        <p className="text-ink-500 text-lg">探索不同职业路径，找到最适合你的方向</p>
      </div>

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" size={18} />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="搜索岗位名称或标签..."
            className="input-field pl-11"
            maxLength={50}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-500" />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input-field !py-2.5 !w-auto cursor-pointer"
          >
            {industries.map((i) => (
              <option key={i} value={i}>
                {i === 'all' ? '全部行业' : i}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
            onlyFavorites
              ? 'bg-rose-100 text-rose-500 shadow-sm'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-300/50'
          )}
        >
          <Heart size={16} fill={onlyFavorites ? 'currentColor' : 'none'} />
          只看收藏
          {favoriteJobIds.length > 0 && (
            <span className={cn(
              'ml-0.5 text-xs font-bold',
              onlyFavorites ? 'text-rose-500' : 'text-ink-500'
            )}>
              {favoriteJobIds.length}
            </span>
          )}
        </button>

        <div className="flex gap-1 bg-ink-100 rounded-full p-1">
          {[
            { v: 'match', label: '匹配度' },
            { v: 'salary', label: '薪资' },
            { v: 'growth', label: '成长' },
          ].map((s) => (
            <button
              key={s.v}
              onClick={() => setSortBy(s.v as SortOption)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                sortBy === s.v ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {selectedJobIds.length > 0 && (
          <button
            onClick={() => setShowCompare(true)}
            className="btn-sun !py-2.5 !px-5"
          >
            <GitCompare size={16} />
            对比 ({selectedJobIds.length})
          </button>
        )}
      </div>

      {!currentAssessment && (
        <div className="card p-5 mb-6 bg-sun-100/40 border-sun-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="text-sun-500" size={22} />
            <div>
              <div className="font-semibold text-ink-900">完成测评可查看个性化匹配度</div>
              <div className="text-sm text-ink-500">基于你的兴趣、能力、价值观精准推荐</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary !py-2.5 !px-5">
            去测评
          </button>
        </div>
      )}

      {filteredJobs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job, i) => {
            const isFav = favoriteJobIds.includes(job.id);
            const isSel = selectedJobIds.includes(job.id);
            return (
              <div
                key={job.id}
                className={cn(
                  'card p-6 group hover:shadow-lift transition-all animate-slide-up cursor-pointer',
                  isSel && 'ring-2 ring-sun-500'
                )}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-ink-900 group-hover:text-sun-500 transition-colors truncate">
                    {job.title}
                  </h3>
                  <p className="text-sm text-ink-500 flex items-center gap-1 mt-0.5">
                    <Briefcase size={13} /> {job.industry}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(job.id);
                  }}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2',
                    isFav ? 'bg-rose-100 text-rose-500' : 'bg-ink-100 text-ink-500 hover:bg-rose-50 hover:text-rose-500'
                  )}
                >
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>

              {currentAssessment && (
                <ProgressBar value={job.matchScore} color="sun" showLabel={true} className="mb-4" />
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-mint-500" />
                  <span className="text-sm font-semibold text-ink-900">{job.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-sun-500" />
                  <span className="text-sm font-semibold text-ink-900">成长 {job.growthScore}/5</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.slice(0, 3).map((t) => (
                  <span key={t} className="tag bg-ink-100 text-ink-700">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare(job.id);
                  }}
                  className={cn(
                    'text-xs font-medium flex items-center gap-1 transition-colors',
                    isSel ? 'text-sun-500' : 'text-ink-500 hover:text-ink-900'
                  )}
                >
                  <GitCompare size={14} />
                  {isSel ? '已加入对比' : '加入对比'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGeneratePlan(job.id);
                  }}
                  className="text-xs font-medium text-sun-500 flex items-center gap-1 hover:underline"
                >
                  制定计划 <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="card max-w-lg mx-auto p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-ink-100 text-ink-500 flex items-center justify-center mb-5">
            <Search size={32} />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">
            {onlyFavorites && favoriteJobIds.length === 0 ? '还没有收藏岗位' : '没有找到匹配的岗位'}
          </h2>
          <p className="text-ink-500 mb-4">
            {onlyFavorites && favoriteJobIds.length === 0
              ? '浏览岗位库，点击心形图标收藏心仪的岗位'
              : search
              ? '试试其他搜索词或调整筛选条件'
              : '暂无岗位数据加载中...'}
          </p>
          {onlyFavorites && (
            <button onClick={() => setOnlyFavorites(false)} className="btn-primary">
              浏览全部岗位 <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      <Modal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        className="max-w-3xl"
      >
        {selectedJob && (
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="tag bg-sun-100 text-sun-500 text-sm">
                <Briefcase size={14} /> {selectedJob.industry}
              </span>
              <span className="tag bg-mint-100 text-mint-500 text-sm">
                <DollarSign size={14} /> {selectedJob.salaryRange}
              </span>
              <span className="tag bg-ink-100 text-ink-700 text-sm">
                <TrendingUp size={14} /> 成长空间 {selectedJob.growthScore}/5
              </span>
              {selectedJob.tags.map((t) => (
                <span key={t} className="tag bg-ink-100 text-ink-700 text-sm">
                  {t}
                </span>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-3">
                <BookOpen size={16} className="text-sun-500" /> 日常工作内容
              </div>
              <p className="text-ink-700 leading-relaxed">{selectedJob.dailyDescription}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-3">
                <Target size={16} className="text-mint-500" /> 能力要求
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedJob.requiredAbilities).map(([k, v]) => (
                  <div key={k} className="p-3 bg-ink-100/60 rounded-xl">
                    <div className="text-sm font-medium text-ink-900 mb-1">
                      {ABILITY_LABELS[k as keyof typeof ABILITY_LABELS]}
                    </div>
                    <ProgressBar value={(v as number) * 20} color="mint" showLabel={false} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 mb-3">
                <TrendingUp size={16} className="text-sun-500" /> 成长路径
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedJob.growthPath.map((p, i) => (
                  <div key={p} className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-white border border-ink-200 rounded-xl text-sm font-medium text-ink-900">
                      {p}
                    </span>
                    {i < selectedJob.growthPath.length - 1 && <ArrowRight size={16} className="text-ink-300" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  toggleFavorite(selectedJob.id);
                }}
                className={cn(
                  'btn-ghost flex-1',
                  favoriteJobIds.includes(selectedJob.id) && 'bg-rose-100 text-rose-500 border-rose-300 hover:bg-rose-100'
                )}
              >
                <Heart size={16} fill={favoriteJobIds.includes(selectedJob.id) ? 'currentColor' : 'none'} />
                {favoriteJobIds.includes(selectedJob.id) ? '已收藏' : '收藏'}
              </button>
              <button onClick={() => handleGeneratePlan(selectedJob.id)} className="btn-primary flex-1">
                生成行动计划 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        title="岗位对比"
        className="max-w-4xl"
      >
        <div className="p-6">
          {selectedForCompare.length === 0 ? (
            <div className="text-center py-10 text-ink-500">请先选择要对比的岗位</div>
          ) : (
            <>
              <SalaryBarChart
                data={selectedForCompare.map((j) => ({
                  name: j.title,
                  min: j.minSalary,
                  max: j.maxSalary,
                }))}
                height={260}
              />

              <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: `repeat(${selectedForCompare.length}, minmax(0, 1fr))` }}>
                {selectedForCompare.map((job) => (
                  <div key={job.id} className="card p-5">
                    <h4 className="font-display text-lg font-semibold text-ink-900 mb-2">{job.title}</h4>
                    <div className="text-sm text-ink-500 mb-3">{job.industry}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ink-500">匹配度</span>
                        <span className="font-semibold text-sun-500">{job.matchScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">成长空间</span>
                        <span className="font-semibold text-mint-500">{job.growthScore}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">薪资范围</span>
                        <span className="font-semibold text-ink-900">{job.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={clearCompare} className="btn-ghost">
                  <X size={16} /> 清空对比
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
