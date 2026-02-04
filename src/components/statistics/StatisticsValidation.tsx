import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { TrendingUp, Target, CheckCircle, XCircle, Award, Zap, BarChart3 } from 'lucide-react';
import type { StatisticsSummary, ValidationRecord } from '@/types/lottery';

interface StatisticsValidationProps {
  stats: StatisticsSummary;
  validations: ValidationRecord[];
  predictionCount: number;
}

export function StatisticsValidation({ stats, validations, predictionCount }: StatisticsValidationProps) {
  const accuracyData = useMemo(() => {
    return [
      { name: '百位', accuracy: stats.hundredAccuracy, color: '#3b82f6' },
      { name: '十位', accuracy: stats.tenAccuracy, color: '#10b981' },
      { name: '个位', accuracy: stats.oneAccuracy, color: '#f59e0b' },
      { name: '整体', accuracy: stats.overallAccuracy, color: '#8b5cf6' }
    ];
  }, [stats]);

  const recentValidations = useMemo(() => {
    return validations.slice(-20).reverse();
  }, [validations]);

  const trendData = useMemo(() => {
    return stats.recentAccuracy.map((acc, idx) => ({
      index: idx + 1,
      accuracy: acc
    }));
  }, [stats.recentAccuracy]);

  const getHitBadge = (hit: boolean) => {
    return hit 
      ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />中</Badge>
      : <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />挂</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 准确率概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm mb-1">百位准确率</p>
                <p className="text-3xl font-bold text-white font-mono">{stats.hundredAccuracy}%</p>
              </div>
              <Target className="w-10 h-10 text-blue-400/50" />
            </div>
            <Progress value={stats.hundredAccuracy} className="h-2 mt-3 bg-blue-900/50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm mb-1">十位准确率</p>
                <p className="text-3xl font-bold text-white font-mono">{stats.tenAccuracy}%</p>
              </div>
              <Target className="w-10 h-10 text-green-400/50" />
            </div>
            <Progress value={stats.tenAccuracy} className="h-2 mt-3 bg-green-900/50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm mb-1">个位准确率</p>
                <p className="text-3xl font-bold text-white font-mono">{stats.oneAccuracy}%</p>
              </div>
              <Target className="w-10 h-10 text-amber-400/50" />
            </div>
            <Progress value={stats.oneAccuracy} className="h-2 mt-3 bg-amber-900/50" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm mb-1">整体准确率</p>
                <p className="text-3xl font-bold text-white font-mono">{stats.overallAccuracy}%</p>
              </div>
              <Award className="w-10 h-10 text-purple-400/50" />
            </div>
            <Progress value={stats.overallAccuracy} className="h-2 mt-3 bg-purple-900/50" />
          </CardContent>
        </Card>
      </div>

      {/* 连续记录 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">当前连续命中</p>
                <p className="text-2xl font-bold text-white font-mono">{stats.currentStreak} 期</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">最大连续命中</p>
                <p className="text-2xl font-bold text-white font-mono">{stats.maxStreak} 期</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 准确率对比 */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              各位置准确率对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, '准确率']}
                  />
                  <Bar dataKey="accuracy" name="准确率">
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 准确率趋势 */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              近期准确率走势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="index" stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value}%`, '准确率']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  暂无足够数据进行趋势分析
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 验证记录表 */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            验证记录
            <span className="text-sm font-normal text-gray-400">(最近20期)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            {recentValidations.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-800">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-2">期号</th>
                    <th className="text-center p-2">预测百位</th>
                    <th className="text-center p-2">预测十位</th>
                    <th className="text-center p-2">预测个位</th>
                    <th className="text-center p-2">实际开奖</th>
                    <th className="text-center p-2">百位</th>
                    <th className="text-center p-2">十位</th>
                    <th className="text-center p-2">个位</th>
                  </tr>
                </thead>
                <tbody>
                  {recentValidations.map((v) => (
                    <tr
                      key={v.id}
                      className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-2 text-gray-300">{v.period}</td>
                      <td className="p-2 text-center">
                        <span className="text-blue-400 font-mono">
                          {v.prediction.hundredRanking.slice(0, predictionCount).join(', ')}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-green-400 font-mono">
                          {v.prediction.tenRanking.slice(0, predictionCount).join(', ')}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-amber-400 font-mono">
                          {v.prediction.oneRanking.slice(0, predictionCount).join(', ')}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="text-white font-mono font-bold">
                          {v.actualHundred}{v.actualTen}{v.actualOne}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {getHitBadge(v.hundredHit)}
                        <span className="text-gray-500 text-xs ml-1">(#{v.hundredRank})</span>
                      </td>
                      <td className="p-2 text-center">
                        {getHitBadge(v.tenHit)}
                        <span className="text-gray-500 text-xs ml-1">(#{v.tenRank})</span>
                      </td>
                      <td className="p-2 text-center">
                        {getHitBadge(v.oneHit)}
                        <span className="text-gray-500 text-xs ml-1">(#{v.oneRank})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无验证记录
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
