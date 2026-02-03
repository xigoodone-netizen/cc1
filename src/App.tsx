import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from 'sonner';
import { 
  Sparkles, 
  Settings,
  Clock,
  CheckCircle2,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';

import { useLotteryData } from '@/hooks/useLotteryData';
import { BasicFeatures } from '@/components/features/BasicFeatures';
import { PositionFeatures } from '@/components/features/PositionFeatures';
import { CompositeFeatures } from '@/components/features/CompositeFeatures';
import { FeatureMatrix } from '@/components/features/FeatureMatrix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [pulse, setPulse] = useState(false);
  
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

  // 辅助：获取该位置的核心特征
  const getFeatureLabel = (idx: number) => {
    const features = ['马尔可夫链', '遗漏回补', '周期识别'];
    return features[idx % features.length];
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        
        * { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          font-size: 14px !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        .font-mono, .prediction-digit, .stat-number {
          font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace !important;
        }
        
        .big-number { 
          font-size: 26px !important; 
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          line-height: 1 !important;
        }
        
        .huge-number { 
          font-size: 48px !important; 
          font-weight: 900 !important;
          letter-spacing: -0.04em !important;
          line-height: 1 !important;
          text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
        }
        
        .prediction-main-digit { 
          font-size: 56px !important; 
          font-weight: 900 !important;
          letter-spacing: -0.03em !important;
          line-height: 1 !important;
          text-shadow: 0 0 40px currentColor, 0 0 20px currentColor;
          filter: brightness(1.2);
        }
        
        .prediction-secondary-digit {
          font-size: 32px !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          opacity: 0.7;
        }
        
        .table-digit {
          font-size: 18px !important;
          font-weight: 800 !important;
          letter-spacing: 0.05em !important;
        }
        
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 10px currentColor;
        }
        
        .glow-box {
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.2), 0 0 60px rgba(99, 102, 241, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        
        .label-text {
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase;
        }
        
        .data-text {
          font-size: 15px !important;
          font-weight: 600 !important;
          letter-spacing: 0.02em !important;
        }
      `}</style>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Toaster position="top-right" richColors />
      
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform glow-box">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent" style={{ fontSize: '18px' }}>彩票智能分析系统</span>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="label-text text-indigo-400/90">AI PRO ENGINE</span>
                <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                <span className="label-text text-slate-500">V3.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 transition-all ${pulse ? 'border-indigo-500/50 bg-indigo-500/5 glow-box' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] glow-text'}`} />
              <span className="label-text text-slate-300">
                {isSyncing ? '同步中...' : '在线'}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6 relative">
        
        {showSettings && (
          <Card className="bg-white/5 border-white/5 backdrop-blur-md rounded-3xl overflow-hidden mb-6">
            <CardContent className="p-8 flex flex-wrap items-center gap-12">
              <div className="flex-1 min-w-[300px] space-y-4">
                <div className="flex justify-between items-end">
                  <span className="label-text text-slate-400">分析窗口</span>
                  <span className="big-number font-mono text-indigo-400">{windowSize} <span className="data-text text-slate-500">期</span></span>
                </div>
                <Slider value={[windowSize]} onValueChange={(v) => setWindowSize(v[0])} min={10} max={200} step={10} />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={generateSampleData} className="border-white/10 hover:bg-white/5 rounded-2xl h-12 label-text">生成模拟数据</Button>
                <Button variant="destructive" onClick={clearData} className="bg-red-500/10 text-red-500 border-red-500/20 rounded-2xl h-12 label-text">清空本地缓存</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-12 gap-6">
          
          <div className="col-span-12 lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-b from-white/5 to-transparent border-white/5 p-8 rounded-[2rem] glow-box">
              <p className="label-text text-slate-400 mb-4">综合准确率</p>
              <p className="huge-number font-mono text-white glow-text">{stats.overallAccuracy}<span className="data-text text-slate-500 ml-2">%</span></p>
              <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="label-text text-slate-400">连中</span>
                  <span className="big-number font-mono text-indigo-400 glow-text">{stats.currentStreak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="label-text text-slate-400">验证</span>
                  <span className="big-number font-mono text-slate-300">{validations.length}</span>
                </div>
              </div>
            </Card>

            <Button onClick={syncRemoteData} disabled={isSyncing} className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl label-text shadow-xl shadow-indigo-600/20 glow-box">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Activity className="w-4 h-4 mr-3" />}
              {isSyncing ? '同步中...' : '刷新数据'}
            </Button>
          </div>

          <div className="col-span-12 lg:col-span-7 space-y-6">
            <Card className="bg-[#0a0a0f] border-white/5 shadow-2xl rounded-[2rem] overflow-hidden glow-box">
              <CardHeader className="px-8 pt-6 pb-2 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="label-text text-indigo-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 glow-text" /> 下期智能预测建议
                  </CardTitle>
                  {currentPrediction && (
                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 font-mono font-bold glow-box">
                      期号: {currentPrediction.period.slice(-6)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-10 px-10">
                {currentPrediction ? (
                  <div className="grid grid-cols-3 gap-12">
                    {['百位', '十位', '个位'].map((label, idx) => {
                      const data = idx === 0 ? currentPrediction.hundred : idx === 1 ? currentPrediction.ten : currentPrediction.one;
                      return (
                        <div key={label} className="flex flex-col items-center">
                          <p className="label-text text-slate-400 mb-8">{label}</p>
                          <div className="space-y-6 flex flex-col items-center">
                            {data.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`prediction-digit ${i === 0 ? 'prediction-main-digit text-white glow-text' : 'prediction-secondary-digit text-slate-400'}`}>
                                  {item.digit}
                                </div>
                                <div className={`data-text ${i === 0 ? 'text-indigo-400' : 'text-slate-600'}`}>
                                  {item.probability}%
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full glow-box">
                            <span className="label-text text-indigo-400/80">
                              {getFeatureLabel(idx)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                    <Clock className="w-6 h-6 text-slate-700 mb-2" />
                    <p className="label-text text-slate-600">等待数据同步...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0f] border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="px-8 py-4 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="label-text text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 glow-text" /> 实时命中验证流水 (近10期)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="label-text text-slate-500 bg-black/40 border-b border-white/5">
                        <th className="px-8 py-4">期号/时间</th>
                        <th className="px-8 py-4">实际开奖</th>
                        <th className="px-8 py-4">系统预测 (百/十/个)</th>
                        <th className="px-8 py-4">状态</th>
                        <th className="px-8 py-4">结果</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {validations.length > 0 ? (
                        [...validations].reverse().slice(0, 10).map((v) => (
                          <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-5">
                              <span className="data-text text-slate-300">#{v.period.slice(-4)}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="table-digit font-mono text-white glow-text">
                                {v.actualHundred}{v.actualTen}{v.actualOne}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex gap-4">
                                <span className="data-text font-mono text-slate-300">
                                  {v.prediction.hundredRanking.slice(0, 3).join('')}
                                </span>
                                <span className="data-text font-mono text-slate-300">
                                  {v.prediction.tenRanking.slice(0, 3).join('')}
                                </span>
                                <span className="data-text font-mono text-slate-300">
                                  {v.prediction.oneRanking.slice(0, 3).join('')}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex gap-2">
                                <span className={`label-text ${v.hundredHit ? 'text-green-500 glow-text' : 'text-slate-600'}`}>{v.hundredHit ? '中' : '挂'}</span>
                                <span className={`label-text ${v.tenHit ? 'text-green-500 glow-text' : 'text-slate-600'}`}>{v.tenHit ? '中' : '挂'}</span>
                                <span className={`label-text ${v.oneHit ? 'text-green-500 glow-text' : 'text-slate-600'}`}>{v.oneHit ? '中' : '挂'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              {v.hundredHit || v.tenHit || v.oneHit ? (
                                <span className="label-text text-green-500 glow-text">命中</span>
                              ) : (
                                <span className="label-text text-slate-700">未中</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-20 text-center label-text text-slate-700">暂无验证记录</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <Card className="bg-[#0a0a0f] border-white/5 h-full flex flex-col overflow-hidden rounded-[2rem]">
              <CardHeader className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="label-text text-slate-400 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> 实时采集流
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[800px] custom-scrollbar">
                <div className="divide-y divide-white/5">
                  {[...draws].reverse().slice(0, 20).map((draw) => (
                    <div key={draw.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                      <div className="space-y-0.5">
                        <p className="data-text text-slate-300">{formatPeriod(draw.period).split(' ')[1]}</p>
                        <p className="label-text text-slate-600">#{draw.period.slice(-4)}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {[draw.hundred, draw.ten, draw.one].map((n, i) => (
                          <div key={i} className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center data-text font-mono text-blue-400 glow-box">
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="pt-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl">
                <TabsTrigger value="dashboard" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 label-text">分析矩阵</TabsTrigger>
                <TabsTrigger value="features" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 label-text">特征分布</TabsTrigger>
                <TabsTrigger value="matrix" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 label-text">走势矩阵</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CompositeFeatures draws={draws} windowSize={windowSize} />
                  <BasicFeatures draws={draws} windowSize={windowSize} />
               </div>
            </TabsContent>
            <TabsContent value="features" className="mt-0">
               <PositionFeatures draws={draws} windowSize={windowSize} />
            </TabsContent>
            <TabsContent value="matrix" className="mt-0">
              <FeatureMatrix draws={draws} windowSize={windowSize} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mt-24 py-12 border-t border-white/5 text-center">
        <p className="label-text text-slate-600">AI PREDICTION ENGINE v3.0 STABLE</p>
      </footer>
    </div>
  );
}

export default App;
