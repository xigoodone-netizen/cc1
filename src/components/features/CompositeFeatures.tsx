import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Hash, Calculator, GitBranch, Grid3X3 } from 'lucide-react';
import type { LotteryDraw } from '@/types/lottery';
import { 
  calculateSumTail, 
  calculateSpanTail, 
  calculateSumSpanCombo,
  calculateSizeOddEvenCombo,
  calculatePrimeRoadCombo,
  calculateHotWarmColdZone,
  calculateMissingLayers,
  calculateFollowRelations,
  calculateDigitSum,
  calculateProductTail
} from '@/utils/featureCalculator';

interface CompositeFeaturesProps {
  draws: LotteryDraw[];
  windowSize: number;
}

export function CompositeFeatures({ draws, windowSize }: CompositeFeaturesProps) {
  const compositeData = useMemo(() => {
    if (draws.length < windowSize) return null;
    
    const currentDraw = draws[draws.length - 1];
    const relations = calculateFollowRelations(draws, windowSize);
    
    return {
      sumTail: calculateSumTail(currentDraw),
      spanTail: calculateSpanTail(currentDraw),
      sumSpanCombo: calculateSumSpanCombo(currentDraw),
      sizeOddEvenCombo: calculateSizeOddEvenCombo(currentDraw),
      primeRoadCombo: calculatePrimeRoadCombo(currentDraw),
      hotWarmColdZone: calculateHotWarmColdZone(draws, windowSize),
      missingLayers: calculateMissingLayers(draws),
      followRelations: relations,
      digitSum: calculateDigitSum(currentDraw),
      productTail: calculateProductTail(currentDraw)
    };
  }, [draws, windowSize]);

  if (!compositeData) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="p-8 text-center text-gray-500">
          数据不足，需要至少 {windowSize} 期数据
        </CardContent>
      </Card>
    );
  }

  const features = [
    {
      icon: Hash,
      title: '和值尾 / 跨度尾',
      color: 'blue',
      content: (
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">和值尾</p>
            <p className="text-3xl font-bold text-blue-400 font-mono">{compositeData.sumTail}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">跨度尾</p>
            <p className="text-3xl font-bold text-green-400 font-mono">{compositeData.spanTail}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">和跨组合</p>
            <p className="text-lg font-bold text-amber-400 font-mono">{compositeData.sumSpanCombo}</p>
          </div>
        </div>
      )
    },
    {
      icon: Calculator,
      title: '数字和 / 乘积尾',
      color: 'purple',
      content: (
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">数字和</p>
            <p className="text-3xl font-bold text-purple-400 font-mono">{compositeData.digitSum}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">乘积尾</p>
            <p className="text-3xl font-bold text-pink-400 font-mono">{compositeData.productTail}</p>
          </div>
        </div>
      )
    },
    {
      icon: Grid3X3,
      title: '组合形态',
      color: 'amber',
      content: (
        <div className="space-y-2">
          <div>
            <p className="text-gray-500 text-xs mb-1">大小单双组合</p>
            <p className="text-lg font-bold text-amber-400 font-mono">{compositeData.sizeOddEvenCombo}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">质合012路组合</p>
            <p className="text-lg font-bold text-cyan-400 font-mono">{compositeData.primeRoadCombo}</p>
          </div>
        </div>
      )
    },
    {
      icon: Layers,
      title: '热温冷分区',
      color: 'red',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">热</Badge>
            <span className="text-white font-mono">
              {compositeData.hotWarmColdZone.hot.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">温</Badge>
            <span className="text-white font-mono">
              {compositeData.hotWarmColdZone.warm.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">冷</Badge>
            <span className="text-white font-mono">
              {compositeData.hotWarmColdZone.cold.join(', ')}
            </span>
          </div>
        </div>
      )
    },
    {
      icon: GitBranch,
      title: '遗漏分层',
      color: 'green',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">1-3期</Badge>
            <span className="text-white font-mono text-sm">
              {compositeData.missingLayers.layer1.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">4-7期</Badge>
            <span className="text-white font-mono text-sm">
              {compositeData.missingLayers.layer2.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">8期+</Badge>
            <span className="text-white font-mono text-sm">
              {compositeData.missingLayers.layer3.join(', ')}
            </span>
          </div>
        </div>
      )
    },
    {
      icon: GitBranch,
      title: '跟随关系',
      color: 'cyan',
      content: (
        <div className="max-h-[150px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-1">当前</th>
                <th className="text-left p-1">下期可能</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(compositeData.followRelations.entries()).slice(0, 10).map(([digit, followers]) => (
                <tr key={digit} className="border-t border-gray-700">
                  <td className="p-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                      {digit}
                    </span>
                  </td>
                  <td className="p-1">
                    <div className="flex gap-1">
                      {followers.map((f, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-700 text-gray-300 font-mono text-xs"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  ];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
    cyan: 'from-cyan-500 to-cyan-700'
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          复合特征分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-gray-300 font-medium">{feature.title}</h4>
              </div>
              {feature.content}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
