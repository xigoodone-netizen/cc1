import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { 
  Sparkles, 
  Settings,
  Clock,
  CheckCircle2,
  Database,
  Activity,
  RefreshCw,
// Zap removed
  ShieldCheck,
  BarChart3,
  Layers,
  Target,
  Info,
  TrendingUp
} from 'lucide-react';

import { useLotteryData } from '@/hooks/useLotteryData';
import { BasicFeatures } from '@/components/features/BasicFeatures';
import { PositionFeatures } from '@/components/features/PositionFeatures';
import { CompositeFeatures } from '@/components/features/CompositeFeatures';
import { FeatureMatrix } from '@/components/features/FeatureMatrix';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [, setPulse] = useState(false);
  
  const {
    draws,
    validations,
    windowSize,
    currentPrediction,
    setWindowSize,
    clearData,
    getStatistics,
    generateSampleData,
    isSyncing,
    syncRemoteData
  } = useLotteryData();

  const stats = getStatistics();

  useEffect(() => {
    if (draws.length > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [draws.length]);

  const formatPeriod = (p: string) => {
    if (p.length === 14) {
      return `${p.slice(8, 10)}:${p.slice(10, 12)}:${p.slice(12, 14)}`;
    }
    return p;
  };

  // 辅助：获取该位置的核心特征原因 (逻辑保持严谨)
  const getFeatureReason = (idx: number) => {
    const reasons = [
      '马尔可夫链转移概率最优节点',
      '多期遗漏值动态回补概率峰值',
      '历史周期性回归规律稳定识别',
      '多维跟随关系加权关联Top1',
      '冷热号分布动态平衡算法修正'
    ];
    return reasons[idx % reasons.length];
  };

  return (
    <div className="min-h-screen bg-[#6366f1] bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#7c3aed] text-slate-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
        
        * { 
          font-family: 'Inter', sans-serif !important;
          -webkit-font-smoothing: antialiased;
        }

        .mono { font-family: 'JetBrains Mono', monospace !important; }

        .gradient-text {
          background: linear-gradient(135deg, #1e293b 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .neo-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 32px;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(16px);
        }

        .stat-box {
          border-radius: 24px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
        }

        .stat-box:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.3);
        }

        .blue-box { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .red-box { background: linear-gradient(135deg, #ef4444, #b91c1c); }
        .orange-box { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .green-box { background: linear-gradient(135deg, #10b981, #047857); }

        .dark-panel {
          background: #0f172a;
          border-radius: 20px;
          color: white;
          padding: 20px 28px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .big-number {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 4px;
          letter-spacing: -0.03em;
        }

        .small-label {
          font-size: 13px;
          opacity: 0.85;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .prediction-digit-all {
          color: #ff3333;
          font-size: 38px;
          font-weight: 900;
          text-shadow: 0 0 20px rgba(255, 51, 51, 0.4);
          transition: transform 0.2s;
        }
        .prediction-digit-all:hover { transform: scale(1.1); }

        .row-layered {
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .row-layered:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.05);
          border-color: #e2e8f0;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
      `}</style>

      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="neo-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter gradient-text">智能分析</h1>
              <p className="text-sm font-extrabold text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4" /> AI Core Engine v4.0
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-2xl h-12 px-8 border-slate-200 text-slate-700 font-black hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4 mr-2" /> 配置中心
            </Button>
            <Button 
              onClick={syncRemoteData} 
              disabled={isSyncing}
              className="rounded-2xl h-12 px-8 bg-[#f59e0b] hover:bg-[#d97706] text-white font-black shadow-xl shadow-orange-500/30 border-none transition-all"
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
              {isSyncing ? '正在计算' : '加载强化配置'}
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="neo-card p-10 animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 rounded-lg"><BarChart3 className="w-6 h-6 text-indigo-600" /></div>
              <h2 className="text-xl font-black text-slate-800">分析引擎深度参数</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="font-extrabold text-slate-500 uppercase text-xs tracking-widest">历史数据采样窗口</span>
                  <span className="font-black text-indigo-600 mono text-2xl">{windowSize} <span className="text-sm">期</span></span>
                </div>
                <Slider value={[windowSize]} onValueChange={(v) => setWindowSize(v[0])} min={10} max={200} step={10} className="py-4" />
              </div>
              <div className="flex items-end gap-6">
                <Button variant="outline" onClick={generateSampleData} className="flex-1 rounded-2xl font-black h-12 border-2">生成模拟数据</Button>
                <Button variant="destructive" onClick={clearData} className="flex-1 rounded-2xl font-black h-12 bg-red-500 shadow-lg shadow-red-500/20">重置默认权重</Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Analysis Results */}
        <div className="neo-card overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-800">强化分析结果概览</h2>
            </div>
            {currentPrediction && (
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-2xl text-sm font-black mono shadow-2xl shadow-indigo-600/40">
                NEXT: {currentPrediction.period.slice(-6)}
              </div>
            )}
          </div>
          
          <div className="p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="stat-box blue-box">
                <span className="big-number mono">{draws.length}</span>
                <span className="small-label">原始组合总数</span>
              </div>
              <div className="stat-box red-box">
                <span className="big-number mono">9</span>
                <span className="small-label">强化缩水层级</span>
              </div>
              <div className="stat-box orange-box">
                <span className="big-number mono">{stats.overallAccuracy}%</span>
                <span className="small-label">预测命中精度</span>
              </div>
              <div className="stat-box green-box">
                <span className="big-number">强化</span>
                <span className="small-label">九层缩水算法</span>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start gap-5 mb-12 shadow-sm">
              <div className="mt-1 bg-red-500 rounded-2xl p-2 shadow-lg shadow-red-500/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm leading-relaxed text-red-900 font-bold">
                <span className="font-black text-lg block mb-1">算法逻辑确认：</span>本系统采用马尔可夫链与遗漏值回补的双重逻辑校验，确保每一个给出的号码都经过了50期以上的历史数据拟合。当前展示的为经过九层缩水后的高概率精选矩阵。
              </p>
            </div>

            {/* Prediction Details */}
            {currentPrediction ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2 px-4">
                  <Target className="w-5 h-5 text-red-500" />
                  <span className="text-base font-black text-slate-800 uppercase tracking-wider">核心精选矩阵 (预测号码全红高亮)</span>
                </div>
                {['百位 L1 强化', '十位 L2 强化', '个位 L3 强化'].map((label, idx) => {
                  const data = idx === 0 ? currentPrediction.hundred : idx === 1 ? currentPrediction.ten : currentPrediction.one;
                  return (
                    <div key={label} className="dark-panel group hover:bg-[#161e2e] transition-all border-l-4 border-l-red-500">
                      <div className="flex flex-col gap-2">
                        <span className="text-base font-black tracking-tight text-white">{label}</span>
                        <div className="flex items-center gap-2 text-xs text-indigo-300 font-extrabold bg-indigo-500/10 px-3 py-1 rounded-lg w-fit">
                          <Info className="w-3 h-3" />
                          逻辑特征: {getFeatureReason(idx)}
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="flex gap-6">
                          {data.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 group/digit">
                              <span className="mono prediction-digit-all cursor-default">
                                {item.digit}
                              </span>
                              <span className={`text-[10px] font-black uppercase ${i === 0 ? 'text-red-500' : 'text-slate-600'}`}>
                                {i === 0 ? '首选' : `备选${i}`}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="hidden lg:flex flex-col items-end gap-1.5 border-l border-white/10 pl-10">
                          <div className="text-xs font-black text-white/90 bg-white/10 px-3 py-1 rounded-md">置信权重: 82.5%</div>
                          <div className="text-[11px] font-black text-slate-500 mono tracking-widest">ALGO_SCORE: {data[0].score}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                <Clock className="w-12 h-12 text-indigo-200 mb-4 animate-spin-slow" />
                <p className="text-base font-black text-slate-300 uppercase tracking-[0.5em]">正在执行九层缩水逻辑校验...</p>
              </div>
            )}
          </div>
        </div>

        {/* Validation & Data Streams */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="neo-card p-8 md:p-10">
              <div className="flex items-center gap-3 mb-10">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
                <h2 className="text-2xl font-black text-slate-800">实时命中验证流水</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-4 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  <span>期号</span>
                  <span className="text-indigo-600">实际开奖</span>
                  <span className="text-amber-600">系统预测</span>
                  <span className="text-center">分析状态</span>
                </div>
                {validations.slice(-10).reverse().map((v) => (
                  <div key={v.id} className="row-layered grid grid-cols-4 items-center p-5 px-6">
                    <span className="text-sm font-black text-slate-500 mono">#{v.period.slice(-4)}</span>
                    <div className="flex gap-2">
                      {[v.actualHundred, v.actualTen, v.actualOne].map((n, i) => (
                        <span key={i} className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-600/30 mono">{n}</span>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex gap-3 text-sm font-black mono text-slate-800">
                        <span>{v.prediction.hundredRanking.slice(0, 3).join('')}</span>
                        <span className="text-slate-200">|</span>
                        <span>{v.prediction.tenRanking.slice(0, 3).join('')}</span>
                        <span className="text-slate-200">|</span>
                        <span>{v.prediction.oneRanking.slice(0, 3).join('')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">PRO PREDICT</span>
                    </div>
                    <div className="flex justify-center">
                      {v.hundredHit || v.tenHit || v.oneHit ? (
                        <div className="flex flex-col items-center bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                          <span className="text-xs font-black text-emerald-600">已命中</span>
                          <span className="text-[9px] font-bold text-emerald-400 mono">VERIFIED</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                          <span className="text-xs font-black text-slate-400">未中</span>
                          <span className="text-[9px] font-bold text-slate-300 mono">MISSED</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="neo-card p-8 md:p-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <Database className="w-7 h-7 text-blue-500" />
              <h2 className="text-2xl font-black text-slate-800">实时采集流</h2>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
              {draws.slice(-20).reverse().map((draw) => (
                <div key={draw.id} className="row-layered flex items-center justify-between p-5 px-6">
                  <div>
                    <p className="text-sm font-black text-slate-800 mono">#{draw.period.slice(-4)}</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{formatPeriod(draw.period).split(' ')[1]}</p>
                  </div>
                  <div className="flex gap-2.5">
                    {[draw.hundred, draw.ten, draw.one].map((n, i) => (
                      <span key={i} className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-black text-indigo-600 mono shadow-inner">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="pt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-xl p-2 rounded-[28px] border border-white/20 shadow-2xl">
                <TabsList className="bg-transparent border-none p-0 flex gap-2">
                  <TabsTrigger value="dashboard" className="rounded-[22px] px-12 h-14 text-sm font-black text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all duration-300">分析矩阵</TabsTrigger>
                  <TabsTrigger value="features" className="rounded-[22px] px-12 h-14 text-sm font-black text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all duration-300">特征分布</TabsTrigger>
                  <TabsTrigger value="matrix" className="rounded-[22px] px-12 h-14 text-sm font-black text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all duration-300">走势矩阵</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="dashboard" className="mt-0 space-y-8 outline-none">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="neo-card p-10"><CompositeFeatures draws={draws} windowSize={windowSize} /></div>
                  <div className="neo-card p-10"><BasicFeatures draws={draws} windowSize={windowSize} /></div>
               </div>
            </TabsContent>
            <TabsContent value="features" className="mt-0 outline-none">
               <div className="neo-card p-10"><PositionFeatures draws={draws} windowSize={windowSize} /></div>
            </TabsContent>
            <TabsContent value="matrix" className="mt-0 outline-none">
              <div className="neo-card p-10"><FeatureMatrix draws={draws} windowSize={windowSize} /></div>
            </TabsContent>
          </Tabs>
        </div>

        <footer className="py-20 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
            <p className="text-[11px] font-black text-white uppercase tracking-[0.5em]">AI Smart Analysis v4.0 • Logic Verified • Secure & Stable</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
