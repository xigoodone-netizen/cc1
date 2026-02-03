import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Flame, Snowflake, Activity, TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';
import type { LotteryDraw } from '@/types/lottery';
import { calculateHotCold, calculateStreaks, calculateSumValue, calculateSpan, calculateSizeRatio, calculateOddEvenRatio, calculatePrimeCompositeRatio, calculateRoad012Ratio } from '@/utils/featureCalculator';

interface BasicFeaturesProps {
  draws: LotteryDraw[];
  windowSize: number;
}

export function BasicFeatures({ draws, windowSize }: BasicFeaturesProps) {
  const [activeTab, setActiveTab] = useState('hotcold');

  const hotColdData = useMemo(() => {
    if (draws.length < windowSize) return [];
    return calculateHotCold(draws, windowSize);
  }, [draws, windowSize]);

  const streakData = useMemo(() => {
    if (draws.length < 2) return [];
    return calculateStreaks(draws);
  }, [draws]);

  const sumSpanData = useMemo(() => {
    if (draws.length < windowSize) return [];
    return draws.slice(-windowSize).map((draw, idx) => ({
      index: idx + 1,
      period: draw.period.slice(-4),
      sum: calculateSumValue(draw),
      span: calculateSpan(draw)
    }));
  }, [draws, windowSize]);

  const ratioData = useMemo(() => {
    if (draws.length === 0) return null;
    const lastDraw = draws[draws.length - 1];
    return {
      size: calculateSizeRatio(lastDraw),
      oddEven: calculateOddEvenRatio(lastDraw),
      primeComposite: calculatePrimeCompositeRatio(lastDraw),
      road012: calculateRoad012Ratio(lastDraw)
    };
  }, [draws]);

  if (draws.length < windowSize) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center text-gray-500">
          数据不足，需要至少 {windowSize} 期数据
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          基础特征分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border border-gray-700 mb-4">
            <TabsTrigger value="hotcold" className="data-[state=active]:bg-blue-600">
              <Flame className="w-4 h-4 mr-1" />
              冷热号
            </TabsTrigger>
            <TabsTrigger value="streaks" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              连中连挂
            </TabsTrigger>
            <TabsTrigger value="sumspan" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              和值跨度
            </TabsTrigger>
            <TabsTrigger value="ratios" className="data-[state=active]:bg-blue-600">
              <PieIcon className="w-4 h-4 mr-1" />
              比例分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hotcold" className="mt-0">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Flame className="w-3 h-3 mr-1" />
                  热号
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  温号
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Snowflake className="w-3 h-3 mr-1" />
                  冷号
                </Badge>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotColdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="digit" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="frequency" name="出现频次">
                      {hotColdData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.category === 'hot' ? '#ef4444' : entry.category === 'warm' ? '#f59e0b' : '#3b82f6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-sm mb-2">热号</p>
                  <p className="text-white font-mono">
                    {hotColdData.filter(h => h.category === 'hot').map(h => h.digit).join(', ')}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-yellow-400 text-sm mb-2">温号</p>
                  <p className="text-white font-mono">
                    {hotColdData.filter(h => h.category === 'warm').map(h => h.digit).join(', ')}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-400 text-sm mb-2">冷号</p>
                  <p className="text-white font-mono">
                    {hotColdData.filter(h => h.category === 'cold').map(h => h.digit).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="mt-0">
            <div className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="digit" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="consecutiveHits" name="连中期数" fill="#10b981" />
                    <Bar dataKey="consecutiveMisses" name="连挂期数" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-400 text-sm mb-2">当前连中</p>
                  <p className="text-white font-mono">
                    {streakData.filter(s => s.currentStreak === 'hit').map(s => `${s.digit}(${s.consecutiveHits})`).join(', ') || '无'}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 text-sm mb-2">当前连挂</p>
                  <p className="text-white font-mono">
                    {streakData.filter(s => s.currentStreak === 'miss').map(s => `${s.digit}(${s.consecutiveMisses})`).join(', ') || '无'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sumspan" className="mt-0">
            <div className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sumSpanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="sum" name="和值" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="span" name="跨度" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                  <p className="text-blue-400 text-sm mb-1">当前和值</p>
                  <p className="text-2xl text-white font-mono font-bold">
                    {sumSpanData[sumSpanData.length - 1]?.sum}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                  <p className="text-amber-400 text-sm mb-1">当前跨度</p>
                  <p className="text-2xl text-white font-mono font-bold">
                    {sumSpanData[sumSpanData.length - 1]?.span}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-center">
                  <p className="text-purple-400 text-sm mb-1">平均和值</p>
                  <p className="text-2xl text-white font-mono font-bold">
                    {Math.round(sumSpanData.reduce((a, b) => a + b.sum, 0) / sumSpanData.length)}
                  </p>
                </div>
                <div className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20 text-center">
                  <p className="text-pink-400 text-sm mb-1">平均跨度</p>
                  <p className="text-2xl text-white font-mono font-bold">
                    {Math.round(sumSpanData.reduce((a, b) => a + b.span, 0) / sumSpanData.length)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ratios" className="mt-0">
            {ratioData && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm text-center">大小比</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '大数(5-9)', value: ratioData.size.big },
                            { name: '小数(0-4)', value: ratioData.size.small }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-400 text-sm text-center">单双比</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '奇数', value: ratioData.oddEven.odd },
                            { name: '偶数', value: ratioData.oddEven.even }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#f59e0b" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-400 text-sm text-center">质合比</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '质数', value: ratioData.primeComposite.prime },
                            { name: '合数', value: ratioData.primeComposite.composite }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#06b6d4" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-400 text-sm text-center">012路比</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '0路', value: ratioData.road012.road0 },
                            { name: '1路', value: ratioData.road012.road1 },
                            { name: '2路', value: ratioData.road012.road2 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#ec4899" />
                          <Cell fill="#84cc16" />
                          <Cell fill="#f97316" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
