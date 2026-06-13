import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, Brain, Heart, Briefcase, Check, GripVertical, Compass } from 'lucide-react';
import { useCareerStore } from '@/store/useCareerStore';
import { questions } from '@/data/questions';
import type { CareerValue } from '@/types';
import { VALUE_LABELS } from '@/types';
import { cn } from '@/utils/export';

const STEPS = [
  { key: 'welcome', title: '开始测评', desc: '约 3 分钟，4 个维度', icon: Sparkles },
  { key: 'interest', title: '兴趣测评', desc: '8 道题', icon: Heart },
  { key: 'ability', title: '能力自评', desc: '8 道题', icon: Brain },
  { key: 'values', title: '价值观排序', desc: '拖拽排序', icon: Compass },
  { key: 'preference', title: '工作偏好', desc: '6 道题', icon: Briefcase },
];

const ALL_VALUES: CareerValue[] = ['achievement', 'stability', 'creativity', 'wealth', 'impact', 'balance'];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, answers, setAnswer, valueRanking, setValueRanking, submitAssessment, currentAssessment } = useCareerStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const interestQuestions = questions.filter((q) => q.section === 'interest');
  const abilityQuestions = questions.filter((q) => q.section === 'ability');
  const preferenceQuestions = questions.filter((q) => q.section === 'preference');

  const currentList = [interestQuestions, abilityQuestions, preferenceQuestions];

  const getSectionQuestions = () => {
    if (currentStep === 1) return interestQuestions;
    if (currentStep === 2) return abilityQuestions;
    if (currentStep === 4) return preferenceQuestions;
    return [];
  };

  const isStepComplete = (step: number) => {
    if (step === 0) return true;
    if (step === 3) return valueRanking.length === 6;
    const qs = currentList[step > 3 ? step - 1 : step - 1] || [];
    return qs.every((q) => answers[q.id] != null);
  };

  const handleNext = () => {
    if (currentStep === 4) {
      submitAssessment();
      navigate('/report');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex == null || dragIndex === i) return;
    const next = [...valueRanking];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setValueRanking(next);
    setDragIndex(i);
  };
  const handleDragEnd = () => setDragIndex(null);

  const progressPct = currentStep === 0 ? 0 : Math.round((currentStep / 4) * 100);

  if (currentAssessment && currentStep >= 5) {
    return (
      <div className="container py-16 text-center">
        <div className="card max-w-xl mx-auto p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-mint-100 text-mint-500 flex items-center justify-center mb-6">
            <Check size={32} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-900 mb-3">测评已完成</h1>
          <p className="text-ink-500 mb-8">你已完成职业诊断，可以查看报告或开始复测。</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/report')} className="btn-primary">
              查看报告 <ArrowRight size={16} />
            </button>
            <button
              onClick={() => useCareerStore.getState().startReassessment()}
              className="btn-ghost"
            >
              重新测评
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-16">
      {currentStep > 0 && (
        <div className="mb-10">
          <div className="progress-bar mb-4">
            <div className="progress-fill bg-gradient-to-r from-sun-400 to-sun-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="hidden md:flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    i < currentStep
                      ? 'bg-mint-500 text-white'
                      : i === currentStep
                      ? 'bg-ink-900 text-white shadow-lift scale-110'
                      : 'bg-ink-100 text-ink-500'
                  )}
                >
                  {i < currentStep ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <div>
                  <div className={cn('text-sm font-semibold', i <= currentStep ? 'text-ink-900' : 'text-ink-500')}>
                    {s.title}
                  </div>
                  <div className="text-xs text-ink-500">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 0 && (
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-ink-900 text-sun-400 flex items-center justify-center mb-6 animate-pulse-slow">
              <Compass size={40} strokeWidth={2} />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-ink-900 mb-4 text-balance">
              发现你的职业方向
            </h1>
            <p className="text-lg text-ink-500 max-w-xl mx-auto text-balance">
              通过兴趣、能力、价值观、工作偏好四大维度的科学测评，
              为你生成个性化职业诊断报告，找到最适合你的职业路径。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STEPS.slice(1).map((s, i) => (
              <div key={s.key} className="card p-5 text-left animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-sun-100 text-sun-500 flex items-center justify-center mb-3">
                  <s.icon size={20} />
                </div>
                <div className="font-semibold text-ink-900 text-sm">{s.title}</div>
                <div className="text-xs text-ink-500 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setCurrentStep(1)} className="btn-sun text-base px-10 py-4">
            开始测评 <ArrowRight size={18} />
          </button>
          <p className="text-xs text-ink-500 mt-4">所有数据仅保存在本地，无需注册</p>
        </div>
      )}

      {(currentStep === 1 || currentStep === 2 || currentStep === 4) && (
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-6">
            <div className="text-sm font-semibold text-sun-500 uppercase tracking-wide mb-1">
              {STEPS[currentStep].title}
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              根据你的真实感受选择，没有对错之分
            </h2>
          </div>

          <div className="space-y-5">
            {getSectionQuestions().map((q, idx) => (
              <div key={q.id} className="card p-5 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="font-medium text-ink-900 mb-4">
                  <span className="text-sun-500 mr-2">{idx + 1}.</span>
                  {q.text}
                </div>
                <div className={cn(
                  'grid gap-2',
                  q.options.length > 3 ? 'grid-cols-5' : 'grid-cols-3'
                )}>
                  {q.options.map((opt) => {
                    const active = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-center',
                          active
                            ? 'bg-ink-900 text-white shadow-lift scale-105'
                            : 'bg-ink-100 text-ink-700 hover:bg-ink-300/50 hover:scale-102'
                        )}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={handlePrev} className="btn-ghost">
              <ArrowLeft size={16} /> 上一步
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className={cn(
                'btn-primary',
                !isStepComplete(currentStep) && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
              )}
            >
              下一步 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-6">
            <div className="text-sm font-semibold text-sun-500 uppercase tracking-wide mb-1">
              价值观排序
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">
              按对你的重要程度从高到低排序
            </h2>
            <p className="text-ink-500 text-sm">拖动卡片调整顺序，排在前面的表示对你更重要</p>
          </div>

          <div className="space-y-3 mb-8">
            {(valueRanking.length === 6 ? valueRanking : ALL_VALUES).map((v, i) => (
              <div
                key={v}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'card p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all',
                  dragIndex === i && 'opacity-50 scale-[0.98] shadow-lift'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-sun-100 text-sun-500 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ink-900">{VALUE_LABELS[v]}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{getValueDesc(v)}</div>
                </div>
                <GripVertical className="text-ink-300" size={20} />
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={handlePrev} className="btn-ghost">
              <ArrowLeft size={16} /> 上一步
            </button>
            <button onClick={handleNext} className="btn-primary">
              下一步 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getValueDesc(v: CareerValue): string {
  const map: Record<CareerValue, string> = {
    achievement: '在工作中获得成就感与自我实现',
    stability: '工作稳定、风险低、有安全感',
    creativity: '发挥创意、做有想象力的工作',
    wealth: '获得高收入与优渥的物质回报',
    impact: '对社会或他人产生积极影响',
    balance: '工作与生活平衡、不加班',
  };
  return map[v];
}
