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
  Zap,
  RefreshCw,
  Trophy
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

  // 模拟数据更新时的视觉脉冲
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

  return (
    <div className="min-h-screen bg-[#020205] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 背景动态装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Toaster position="top-right" richColors />
      
      {/* 顶部导航 - 磨砂玻璃效果 */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black tracking-tight text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">彩票智能分析系统</span>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="text-[10px] font-bold text-indigo-500/80 tracking-widest uppercase">AI PRO ENGINE</span>
                <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                <span className="text-[10px] font-medium text-slate-600">V2.7</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 transition-all ${pulse ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                {isSyncing ? '实时同步中...' : '连接正常'}
              </span>
            </div>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6 relative">
        
        {/* 设置面板 */}
        {showSettings && (
          <Card className="bg-white/5 border-white/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 rounded-3xl overflow-hidden">
            <CardContent className="p-8 flex flex-wrap items-center gap-12">
              <div className="flex-1 min-w-[300px] space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">分析窗口大小</span>
                    <p className="text-xs text-slate-600 mt-1">基于最近的历史期数进行深度特征建模</p>
                  </div>
                  <span className="text-lg font-mono font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">{windowSize} 期</span>
                </div>
                <Slider value={[windowSize]} onValueChange={(v) => setWindowSize(v[0])} min={10} max={200} step={10} />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={generateSampleData} className="border-white/10 hover:bg-white/5 rounded-2xl px-6 h-12 text-sm font-bold">生成模拟数据</Button>
                <Button variant="destructive" onClick={clearData} className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 rounded-2xl px-6 h-12 text-sm font-bold">清空本地缓存</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-12 gap-6">
          
          {/* 左侧：统计面板 - 增强视觉冲击 */}
          <div className="col-span-12 lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-b from-white/5 to-transparent border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">综合准确率</p>
              <div className="relative inline-block">
                <p className="text-6xl font-black text-white tracking-tighter leading-none">{stats.overallAccuracy}<span className="text-xl font-medium text-slate-600 ml-1">%</span></p>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-indigo-500/30 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.overallAccuracy}%` }} />
                </div>
              </div>
              
              <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-500">当前连中</span>
                  </div>
                  <span className="text-xl font-black text-indigo-400 font-mono">{stats.currentStreak}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-bold text-slate-500">已验证</span>
                  </div>
                  <span className="text-xl font-black text-slate-300 font-mono">{validations.length}</span>
                </div>
              </div>
            </Card>

            <Button 
              onClick={syncRemoteData} 
              disabled={isSyncing} 
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 h-14 rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/20 border-t border-white/10 active:scale-95 transition-all"
            >
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Activity className="w-4 h-4 mr-3" />}
              {isSyncing ? '同步中...' : '刷新数据流'}
            </Button>
          </div>

          {/* 中间：预测与验证 (核心) */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* 下期预测 - 更加精致的卡片 */}
            <Card className="bg-[#0a0a0f] border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <CardHeader className="px-10 pt-8 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                    <CardTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                      下期智能预测建议
                    </CardTitle>
                  </div>
                  {currentPrediction && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">TARGET PERIOD</span>
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 font-mono font-bold rounded-lg">
                        {currentPrediction.period.slice(-6)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-10 px-12">
                {currentPrediction ? (
                  <div className="grid grid-cols-3 gap-12">
                    {['百位', '十位', '个位'].map((label, idx) => {
                      const data = idx === 0 ? currentPrediction.hundred : idx === 1 ? currentPrediction.ten : currentPrediction.one;
                      return (
                        <div key={label} className="text-center group">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 group-hover:text-indigo-400 transition-colors">{label}</p>
                          <div className="relative mb-8">
                            <div className="absolute inset-0 bg-indigo-500/5 rounded-[2rem] blur-2xl group-hover:bg-indigo-500/15 transition-all" />
                            <div className="relative bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 rounded-[2rem] py-10 shadow-inner group-hover:border-white/10 transition-all">
                              <p className="text-7xl font-black text-white leading-none tracking-tighter group-hover:scale-110 transition-transform duration-500">{data[0].digit}</p>
                              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full">
                                <span className="text-[10px] font-black text-indigo-400">{data[0].probability}%</span>
                                <span className="text-[8px] font-bold text-indigo-400/50 uppercase">PROB</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-center gap-4">
                            {data.slice(1, 3).map((item, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase">备选 {i+2}</span>
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-black text-slate-400 group-hover:text-slate-200 transition-colors">
                                  {item.digit}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                      <Clock className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-xs text-slate-600 font-black uppercase tracking-[0.3em]">等待云端数据同步中</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 验证记录 - 极致清晰的表格 */}
            <Card className="bg-[#0a0a0f] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CardHeader className="px-10 py-6 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-green-500 rounded-full" /> 实时命中验证流水
                </CardTitle>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">最近 10 期记录</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-600 font-black uppercase tracking-[0.15em] bg-black/40 border-b border-white/5">
                        <th className="px-10 py-4">开奖时间</th>
                        <th className="px-10 py-4 text-center">实际开奖</th>
                        <th className="px-10 py-4 text-center">状态</th>
                        <th className="px-10 py-4 text-right">命中排名 (百/十/个)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {validations.length > 0 ? (
                        [...validations].reverse().slice(0, 10).map((v) => (
                          <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-10 py-6">
                              <p className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">{formatPeriod(v.period).split(' ')[1]}</p>
                              <p className="text-[10px] font-bold text-slate-600 mt-1">{formatPeriod(v.period).split(' ')[0]}</p>
                            </td>
                            <td className="px-10 py-6">
                              <div className="flex justify-center gap-2.5">
                                {[v.actualHundred, v.actualTen, v.actualOne].map((num, i) => (
                                  <span key={i} className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:border-indigo-500/30 transition-all">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-10 py-6 text-center">
                              {v.hundredHit || v.tenHit || v.oneHit ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">命中</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">未中</span>
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold">
                                <span className={`px-2 py-0.5 rounded ${v.hundredHit ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600'}`}>{v.hundredRank}</span>
                                <span className="text-slate-800">/</span>
                                <span className={`px-2 py-0.5 rounded ${v.tenHit ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600'}`}>{v.tenRank}</span>
                                <span className="text-slate-800">/</span>
                                <span className={`px-2 py-0.5 rounded ${v.oneHit ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-600'}`}>{v.oneRank}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-24 text-center">
                            <p className="text-xs font-black text-slate-700 uppercase tracking-[0.4em]">等待首期数据同步验证</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：采集列表 - 增强质感 */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="bg-[#0a0a0f] border-white/5 h-full flex flex-col overflow-hidden shadow-2xl rounded-[2.5rem]">
              <CardHeader className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Database className="w-4 h-4 text-blue-500" /> 实时采集流
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[850px] custom-scrollbar">
                <div className="divide-y divide-white/5">
                  {[...draws].reverse().slice(0, 20).map((draw) => (
                    <div key={draw.id} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-slate-400 group-hover:text-white transition-colors">{formatPeriod(draw.period).split(' ')[1]}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">期号 {draw.period.slice(-4)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[draw.hundred, draw.ten, draw.one].map((n, i) => (
                          <div key={i} className="w-10 h-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-xl font-black text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
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

        {/* 底部详情选项卡 */}
        <div className="pt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-white/5 border border-white/5 p-1.5 rounded-2xl backdrop-blur-md">
                <TabsTrigger value="dashboard" className="rounded-xl px-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">综合分析矩阵</TabsTrigger>
                <TabsTrigger value="features" className="rounded-xl px-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">位置特征分布</TabsTrigger>
                <TabsTrigger value="matrix" className="rounded-xl px-12 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">走势规律矩阵</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <CompositeFeatures draws={draws} windowSize={windowSize} />
                  <BasicFeatures draws={draws} windowSize={windowSize} />
               </div>
            </TabsContent>

            <TabsContent value="features" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
               <PositionFeatures draws={draws} windowSize={windowSize} />
            </TabsContent>

            <TabsContent value="matrix" className="mt-0 animate-in fade-in zoom-in-95 duration-500">
              <FeatureMatrix draws={draws} windowSize={windowSize} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="mt-32 py-16 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">AI PREDICTION ANALYTICS PRO</p>
          </div>
          <p className="text-[10px] text-slate-700 font-medium">数据流每 60 秒自动更新 · 基于深度学习模式识别算法</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
