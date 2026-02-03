import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { LotteryDraw } from '@/types/lottery';
import { calculateAllFeatures } from '@/utils/featureCalculator';

interface FeatureMatrixProps {
  draws: LotteryDraw[];
  windowSize: number;
}

export function FeatureMatrix({ draws, windowSize }: FeatureMatrixProps) {
  const features = useMemo(() => {
    if (draws.length < windowSize) return null;
    return calculateAllFeatures(draws, windowSize);
  }, [draws, windowSize]);

  const featureList = useMemo(() => {
    if (!features) return [];

    return [
      // 基础特征 (10个)
      { category: '基础', name: '冷热号', status: 'active', value: features.basic.hotCold.filter(h => h.category === 'hot').length + '热' },
      { category: '基础', name: '连中/连挂', status: 'active', value: features.basic.streaks.filter(s => s.currentStreak === 'hit').length + '连中' },
      { category: '基础', name: '和值', status: 'active', value: features.basic.sumValue },
      { category: '基础', name: '跨度', status: 'active', value: features.basic.spanValue },
      { category: '基础', name: '大小比', status: 'active', value: `${features.basic.sizeRatio.big}:${features.basic.sizeRatio.small}` },
      { category: '基础', name: '单双比', status: 'active', value: `${features.basic.oddEvenRatio.odd}:${features.basic.oddEvenRatio.even}` },
      { category: '基础', name: '质合比', status: 'active', value: `${features.basic.primeCompositeRatio.prime}:${features.basic.primeCompositeRatio.composite}` },
      { category: '基础', name: '012路比', status: 'active', value: `${features.basic.road012Ratio.road0}:${features.basic.road012Ratio.road1}:${features.basic.road012Ratio.road2}` },
      { category: '基础', name: 'AC值', status: 'active', value: features.basic.acValue },
      { category: '基础', name: '奇偶模式', status: 'active', value: features.basic.oddEvenPattern },
      
      // 位置特征 (10个)
      { category: '位置', name: '百位走势', status: 'active', value: features.position.hundred.digit },
      { category: '位置', name: '十位走势', status: 'active', value: features.position.ten.digit },
      { category: '位置', name: '个位走势', status: 'active', value: features.position.one.digit },
      { category: '位置', name: '位置和', status: 'active', value: features.position.positionSum },
      { category: '位置', name: '位置差', status: 'active', value: `百十${features.position.positionDiff.ht}` },
      { category: '位置', name: '重号位置', status: features.position.repeatPosition.some(r => r) ? 'active' : 'inactive', value: features.position.repeatPosition.filter(Boolean).length + '个' },
      { category: '位置', name: '邻号位置', status: features.position.neighborPosition.some(n => n) ? 'active' : 'inactive', value: features.position.neighborPosition.filter(Boolean).length + '个' },
      { category: '位置', name: '斜连号', status: features.position.diagonalPattern !== '无' ? 'active' : 'inactive', value: features.position.diagonalPattern },
      { category: '位置', name: '对称号', status: features.position.symmetryPattern !== '无对称' ? 'active' : 'inactive', value: features.position.symmetryPattern },
      { category: '位置', name: '振幅', status: 'active', value: `百${features.position.hundred.amplitude}` },
      
      // 复合特征 (10个)
      { category: '复合', name: '和值尾', status: 'active', value: features.composite.sumTail },
      { category: '复合', name: '跨度尾', status: 'active', value: features.composite.spanTail },
      { category: '复合', name: '和跨组合', status: 'active', value: features.composite.sumSpanCombo },
      { category: '复合', name: '大小单双', status: 'active', value: features.composite.sizeOddEvenCombo.slice(0, 8) + '...' },
      { category: '复合', name: '质合012路', status: 'active', value: features.composite.primeRoadCombo.slice(0, 8) + '...' },
      { category: '复合', name: '热温冷分区', status: 'active', value: features.composite.hotWarmColdZone.hot.length + '热' },
      { category: '复合', name: '遗漏分层', status: 'active', value: features.composite.missingLayers.layer1.length + '层1' },
      { category: '复合', name: '跟随关系', status: 'active', value: '已计算' },
      { category: '复合', name: '数字和', status: 'active', value: features.composite.digitSum },
      { category: '复合', name: '乘积尾', status: 'active', value: features.composite.productTail }
    ];
  }, [features]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '基础':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case '位置':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case '复合':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  if (!features) {
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
          <Grid3X3 className="w-5 h-5 text-cyan-400" />
          30个特征矩阵总览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {featureList.map((feature, index) => (
            <div
              key={index}
              className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${getCategoryColor(feature.category)} text-xs`}>
                  {feature.category}
                </Badge>
                {getStatusIcon(feature.status)}
              </div>
              <p className="text-gray-400 text-xs mb-1">{feature.name}</p>
              <p className="text-white font-mono text-sm font-medium truncate">
                {feature.value}
              </p>
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">基础</Badge>
            <span className="text-gray-500 text-sm">基础特征 (10个)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">位置</Badge>
            <span className="text-gray-500 text-sm">位置特征 (10个)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">复合</Badge>
            <span className="text-gray-500 text-sm">复合特征 (10个)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
