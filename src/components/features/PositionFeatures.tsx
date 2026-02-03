import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import type { LotteryDraw } from '@/types/lottery';
import { calculatePositionStats, calculatePositionDiff, calculateRepeatPosition, calculateNeighborPosition, calculateDiagonalPattern, calculateSymmetryPattern } from '@/utils/featureCalculator';

interface PositionFeaturesProps {
  draws: LotteryDraw[];
  windowSize: number;
}

export function PositionFeatures({ draws, windowSize }: PositionFeaturesProps) {
  const positionData = useMemo(() => {
    if (draws.length < windowSize) return null;
    
    const recentDraws = draws.slice(-windowSize);
    const currentDraw = draws[draws.length - 1];
    const previousDraw = draws.length > 1 ? draws[draws.length - 2] : currentDraw;
    
    return {
      hundred: {
        trend: recentDraws.map((d, i) => ({ index: i + 1, value: d.hundred })),
        stats: calculatePositionStats(draws, 'hundred', windowSize)
      },
      ten: {
        trend: recentDraws.map((d, i) => ({ index: i + 1, value: d.ten })),
        stats: calculatePositionStats(draws, 'ten', windowSize)
      },
      one: {
        trend: recentDraws.map((d, i) => ({ index: i + 1, value: d.one })),
        stats: calculatePositionStats(draws, 'one', windowSize)
      },
      diff: calculatePositionDiff(currentDraw),
      repeat: calculateRepeatPosition(currentDraw, previousDraw),
      neighbor: calculateNeighborPosition(currentDraw, previousDraw),
      diagonal: calculateDiagonalPattern(draws),
      symmetry: calculateSymmetryPattern(currentDraw)
    };
  }, [draws, windowSize]);

  if (!positionData) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center text-gray-500">
          数据不足，需要至少 {windowSize} 期数据
        </CardContent>
      </Card>
    );
  }

  const positions = [
    { key: 'hundred', label: '百位', color: '#3b82f6', data: positionData.hundred },
    { key: 'ten', label: '十位', color: '#10b981', data: positionData.ten },
    { key: 'one', label: '个位', color: '#f59e0b', data: positionData.one }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-400" />
          位置特征分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 三位置走势图 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {positions.map((pos) => (
            <div key={pos.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-300 font-medium flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pos.color }}
                  />
                  {pos.label}
                </h4>
                <span className="text-2xl font-bold font-mono" style={{ color: pos.color }}>
                  {pos.data.stats.digit}
                </span>
              </div>
              
              <div className="h-[150px] bg-gray-800/50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pos.data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="index" stroke="#6b7280" fontSize={10} />
                    <YAxis domain={[0, 9]} stroke="#6b7280" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={pos.color} 
                      strokeWidth={2} 
                      dot={{ fill: pos.color, strokeWidth: 0, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-500">遗漏:</span>
                  <span className="ml-1 text-white font-mono">{pos.data.stats.currentMissing}</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-500">振幅:</span>
                  <span className="ml-1 text-white font-mono">{pos.data.stats.amplitude}</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-500">频次:</span>
                  <span className="ml-1 text-white font-mono">{pos.data.stats.frequency}</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-500">最大遗漏:</span>
                  <span className="ml-1 text-white font-mono">{pos.data.stats.maxMissing}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 位置关系分析 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">位置差</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">百-十:</span>
                <span className="text-white font-mono">{positionData.diff.ht}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">十-个:</span>
                <span className="text-white font-mono">{positionData.diff.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">百-个:</span>
                <span className="text-white font-mono">{positionData.diff.ho}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">重号位置</span>
            </div>
            <div className="flex gap-2">
              {['百位', '十位', '个位'].map((label, idx) => (
                <span
                  key={label}
                  className={`px-2 py-1 rounded text-xs ${
                    positionData.repeat[idx]
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-gray-400 text-sm">邻号位置</span>
            </div>
            <div className="flex gap-2">
              {['百位', '十位', '个位'].map((label, idx) => (
                <span
                  key={label}
                  className={`px-2 py-1 rounded text-xs ${
                    positionData.neighbor[idx]
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400 text-sm">特殊模式</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">斜连:</span>
                <span className="text-white">{positionData.diagonal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">对称:</span>
                <span className="text-white">{positionData.symmetry}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
