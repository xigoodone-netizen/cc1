import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, TrendingUp, Brain } from 'lucide-react';
import { toast } from 'sonner';
import type { LotteryDraw, PredictionResult } from '@/types/lottery';

interface PredictionCenterProps {
  draws: LotteryDraw[];
  windowSize: number;
  currentPrediction: PredictionResult | null;
  onGeneratePrediction: () => PredictionResult | null;
}

export function PredictionCenter({ 
  draws, 
  windowSize, 
  currentPrediction, 
  onGeneratePrediction 
}: PredictionCenterProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (draws.length < windowSize + 1) {
      toast.error(`需要至少 ${windowSize + 1} 期数据才能生成预测`);
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      const prediction = onGeneratePrediction();
      setIsGenerating(false);
      if (prediction) {
        toast.success('预测生成成功！');
      } else {
        toast.error('预测生成失败');
      }
    }, 1000);
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (rank <= 6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-700 text-gray-400';
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'text-green-400';
    if (prob >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* 预测控制面板 */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            预测中心
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">统计窗口: <span className="text-white font-mono">{windowSize}</span> 期</p>
              <p className="text-gray-500 text-xs">
                当前数据: <span className="text-white font-mono">{draws.length}</span> 期
                {draws.length < windowSize + 1 && (
                  <span className="text-red-400 ml-2">(需要 {windowSize + 1} 期)</span>
                )}
              </p>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || draws.length < windowSize + 1}
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  生成预测
                </>
              )}
            </Button>
          </div>

          {currentPrediction && (
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">预测期号</p>
                  <p className="text-2xl font-bold text-white font-mono">{currentPrediction.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">整体置信度</p>
                  <p className={`text-3xl font-bold font-mono ${getProbabilityColor(currentPrediction.overallConfidence)}`}>
                    {currentPrediction.overallConfidence}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">置信度</span>
                  <span className={getProbabilityColor(currentPrediction.overallConfidence)}>
                    {currentPrediction.overallConfidence}%
                  </span>
                </div>
                <Progress 
                  value={currentPrediction.overallConfidence} 
                  className="h-2 bg-gray-700"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 预测结果 */}
      {currentPrediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 百位预测 */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                百位预测排序
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentPrediction.hundred.map((item, index) => (
                  <div
                    key={item.digit}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <Badge className={`${getRankColor(index + 1)} min-w-[2.5rem] text-center`}>
                      #{index + 1}
                    </Badge>
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-mono text-xl font-bold">
                      {item.digit}
                    </span>
                    <div className="flex-1">
                      <Progress value={item.probability} className="h-2 bg-gray-700" />
                    </div>
                    <span className={`text-sm font-mono ${getProbabilityColor(item.probability)}`}>
                      {item.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 十位预测 */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                十位预测排序
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentPrediction.ten.map((item, index) => (
                  <div
                    key={item.digit}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <Badge className={`${getRankColor(index + 1)} min-w-[2.5rem] text-center`}>
                      #{index + 1}
                    </Badge>
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20 text-green-400 font-mono text-xl font-bold">
                      {item.digit}
                    </span>
                    <div className="flex-1">
                      <Progress value={item.probability} className="h-2 bg-gray-700" />
                    </div>
                    <span className={`text-sm font-mono ${getProbabilityColor(item.probability)}`}>
                      {item.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 个位预测 */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                个位预测排序
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentPrediction.one.map((item, index) => (
                  <div
                    key={item.digit}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <Badge className={`${getRankColor(index + 1)} min-w-[2.5rem] text-center`}>
                      #{index + 1}
                    </Badge>
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-mono text-xl font-bold">
                      {item.digit}
                    </span>
                    <div className="flex-1">
                      <Progress value={item.probability} className="h-2 bg-gray-700" />
                    </div>
                    <span className={`text-sm font-mono ${getProbabilityColor(item.probability)}`}>
                      {item.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 综合推荐 */}
      {currentPrediction && currentPrediction.combined.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              综合推荐号码
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {currentPrediction.combined.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center hover:border-purple-500/50 transition-colors"
                >
                  <Badge className={`mb-2 ${getRankColor(index + 1)}`}>
                    推荐 {index + 1}
                  </Badge>
                  <p className="text-2xl font-bold text-white font-mono tracking-wider">
                    {item.digits.join('')}
                  </p>
                  <p className={`text-sm mt-1 ${getProbabilityColor(item.score)}`}>
                    得分: {item.score}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 模式匹配详情 */}
      {currentPrediction && currentPrediction.patternMatches.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              模式匹配详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentPrediction.patternMatches.map((match, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <p className="text-gray-400 text-xs mb-1">{match.featureName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">匹配: {match.matchedCount}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      权重: {match.confidence}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
