import { useState, useCallback, useEffect } from 'react';
import type { 
  LotteryDraw, 
  PredictionResult, 
  PredictionRecord,
  ValidationRecord,
  StatisticsSummary 
} from '@/types/lottery';
import { generatePrediction, validatePrediction } from '@/utils/predictionEngine';

const STORAGE_KEY = 'lottery_data_v1';

export function useLotteryData() {
  // 历史开奖数据
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  // 预测记录
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  // 验证记录
  const [validations, setValidations] = useState<ValidationRecord[]>([]);
  // 统计窗口大小
  const [windowSize, setWindowSize] = useState<number>(30);
  // 当前预测
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 从localStorage加载数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.draws) setDraws(data.draws);
        if (data.predictions) setPredictions(data.predictions);
        if (data.validations) setValidations(data.validations);
        if (data.windowSize) setWindowSize(data.windowSize);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    const data = { draws, predictions, validations, windowSize };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [draws, predictions, validations, windowSize]);

  // 导入数据
  const importData = useCallback((data: string): { success: boolean; message: string } => {
    setIsLoading(true);
    try {
      const lines = data.trim().split('\n');
      const newDraws: LotteryDraw[] = [];
      
      for (const line of lines) {
        const parts = line.trim().split(/[\s,\t]+/);
        if (parts.length >= 4) {
          const period = parts[0];
          const hundred = parseInt(parts[1]);
          const ten = parseInt(parts[2]);
          const one = parseInt(parts[3]);
          
          if (!isNaN(hundred) && !isNaN(ten) && !isNaN(one) &&
              hundred >= 0 && hundred <= 9 &&
              ten >= 0 && ten <= 9 &&
              one >= 0 && one <= 9) {
            newDraws.push({
              id: `${period}_${Date.now()}_${Math.random()}`,
              period,
              hundred,
              ten,
              one
            });
          }
        }
      }
      
      if (newDraws.length === 0) {
        return { success: false, message: '未找到有效的开奖数据' };
      }
      
      // 按期号排序
      newDraws.sort((a, b) => a.period.localeCompare(b.period));
      
      setDraws(prev => {
        const combined = [...prev, ...newDraws];
        // 去重
        const unique = combined.filter((draw, index, self) =>
          index === self.findIndex(d => d.period === draw.period)
        );
        return unique.sort((a, b) => a.period.localeCompare(b.period));
      });
      
      return { success: true, message: `成功导入 ${newDraws.length} 条数据` };
    } catch (error) {
      return { success: false, message: '数据格式错误' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 添加单条数据
  const addDraw = useCallback((period: string, hundred: number, ten: number, one: number) => {
    const newDraw: LotteryDraw = {
      id: `${period}_${Date.now()}`,
      period,
      hundred,
      ten,
      one
    };
    
    setDraws(prev => {
      const exists = prev.find(d => d.period === period);
      if (exists) {
        return prev.map(d => d.period === period ? newDraw : d);
      }
      return [...prev, newDraw].sort((a, b) => a.period.localeCompare(b.period));
    });
  }, []);

  // 删除数据
  const deleteDraw = useCallback((id: string) => {
    setDraws(prev => prev.filter(d => d.id !== id));
  }, []);

  // 清空数据
  const clearData = useCallback(() => {
    if (confirm('确定要清空所有数据吗？')) {
      setDraws([]);
      setPredictions([]);
      setValidations([]);
      setCurrentPrediction(null);
    }
  }, []);

  // 生成预测
  const generateNewPrediction = useCallback(() => {
    if (draws.length < windowSize + 1) {
      return null;
    }
    
    const prediction = generatePrediction(draws, windowSize);
    if (prediction) {
      setCurrentPrediction(prediction);
      setPredictions(prev => [...prev, prediction]);
    }
    return prediction;
  }, [draws, windowSize]);

  // 验证预测
  const validateCurrentPrediction = useCallback((actualDraw: LotteryDraw) => {
    if (!currentPrediction) return null;
    
    const result = validatePrediction(currentPrediction, actualDraw);
    
    // 将PredictionResult转换为PredictionRecord
    const predictionRecord: PredictionRecord = {
      id: `${currentPrediction.period}_${Date.now()}`,
      period: currentPrediction.period,
      predictedAt: currentPrediction.generatedAt,
      windowSize: currentPrediction.windowSize,
      hundredRanking: currentPrediction.hundred.map(h => h.digit),
      tenRanking: currentPrediction.ten.map(t => t.digit),
      oneRanking: currentPrediction.one.map(o => o.digit),
      confidence: currentPrediction.overallConfidence
    };
    
    const validation: ValidationRecord = {
      id: `${actualDraw.period}_${Date.now()}`,
      period: actualDraw.period,
      prediction: predictionRecord,
      actualHundred: actualDraw.hundred,
      actualTen: actualDraw.ten,
      actualOne: actualDraw.one,
      hundredHit: result.hundredHit,
      tenHit: result.tenHit,
      oneHit: result.oneHit,
      hundredRank: result.hundredRank,
      tenRank: result.tenRank,
      oneRank: result.oneRank,
      validatedAt: new Date().toISOString()
    };
    
    setValidations(prev => [...prev, validation]);
    return validation;
  }, [currentPrediction]);

  // 计算统计摘要
  const getStatistics = useCallback((): StatisticsSummary => {
    const totalDraws = draws.length;
    const totalPredictions = predictions.length;
    
    if (validations.length === 0) {
      return {
        totalDraws,
        totalPredictions,
        overallAccuracy: 0,
        hundredAccuracy: 0,
        tenAccuracy: 0,
        oneAccuracy: 0,
        currentStreak: 0,
        maxStreak: 0,
        recentAccuracy: []
      };
    }
    
    const hundredHits = validations.filter(v => v.hundredHit).length;
    const tenHits = validations.filter(v => v.tenHit).length;
    const oneHits = validations.filter(v => v.oneHit).length;
    const overallHits = validations.filter(v => v.hundredHit && v.tenHit && v.oneHit).length;
    
    // 计算连续命中
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    for (const v of validations) {
      if (v.hundredHit || v.tenHit || v.oneHit) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    currentStreak = tempStreak;
    
    // 近期准确率走势 (最近20期)
    const recent = validations.slice(-20);
    const recentAccuracy = recent.map((_, idx) => {
      const slice = recent.slice(0, idx + 1);
      const hits = slice.filter(v => v.hundredHit || v.tenHit || v.oneHit).length;
      return Math.round((hits / slice.length) * 100);
    });
    
    return {
      totalDraws,
      totalPredictions,
      overallAccuracy: Math.round((overallHits / validations.length) * 100),
      hundredAccuracy: Math.round((hundredHits / validations.length) * 100),
      tenAccuracy: Math.round((tenHits / validations.length) * 100),
      oneAccuracy: Math.round((oneHits / validations.length) * 100),
      currentStreak,
      maxStreak,
      recentAccuracy
    };
  }, [draws, predictions, validations]);

  // 生成示例数据
  const generateSampleData = useCallback(() => {
    const sampleData: LotteryDraw[] = [];
    const baseDate = new Date('2024-01-01');
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + Math.floor(i / 1));
      const period = date.toISOString().slice(0, 10).replace(/-/g, '') + String(i % 100).padStart(2, '0');
      
      sampleData.push({
        id: `${period}_${Date.now()}_${i}`,
        period,
        hundred: Math.floor(Math.random() * 10),
        ten: Math.floor(Math.random() * 10),
        one: Math.floor(Math.random() * 10)
      });
    }
    
    setDraws(sampleData);
  }, []);

  return {
    draws,
    predictions,
    validations,
    windowSize,
    currentPrediction,
    isLoading,
    setWindowSize,
    importData,
    addDraw,
    deleteDraw,
    clearData,
    generateNewPrediction,
    validateCurrentPrediction,
    getStatistics,
    generateSampleData
  };
}
