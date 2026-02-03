import { useState, useCallback, useEffect, useRef } from 'react';
import type { 
  LotteryDraw, 
  PredictionResult, 
  ValidationRecord,
  StatisticsSummary 
} from '@/types/lottery';
import { generatePrediction, validatePrediction } from '@/utils/predictionEngine';

const STORAGE_KEY = 'lottery_data_v1';

export function useLotteryData() {
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [validations, setValidations] = useState<ValidationRecord[]>([]);
  const [windowSize, setWindowSize] = useState<number>(30);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const drawsLengthRef = useRef(draws.length);

  // 远程同步逻辑
  const syncRemoteData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const API_URL = 'https://myip.xigoodone.workers.dev';
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const newDraws: LotteryDraw[] = data.map((item: any) => {
          const statNumStr = String(item.statisticalnumber).padStart(3, '0');
          const lastThree = statNumStr.slice(-3);
          
          return {
            id: `${item.gametime}_${item.statisticalnumber}`,
            // 核心：统一期号格式为 14 位数字时间戳
            period: item.gametime.replace(/\D/g, '').padEnd(14, '0').slice(0, 14), 
            hundred: parseInt(lastThree[0]),
            ten: parseInt(lastThree[1]),
            one: parseInt(lastThree[2])
          };
        });

        setDraws(prev => {
          const combined = [...prev, ...newDraws];
          const uniqueMap = new Map();
          combined.forEach(d => uniqueMap.set(d.period, d));
          return Array.from(uniqueMap.values()).sort((a, b) => a.period.localeCompare(b.period));
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 开启定时同步 (每分钟)
  useEffect(() => {
    syncRemoteData();
    const timer = setInterval(syncRemoteData, 60000);
    return () => clearInterval(timer);
  }, [syncRemoteData]);

  // 初始化加载
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.draws) {
          setDraws(data.draws);
          drawsLengthRef.current = data.draws.length;
        }
        if (data.predictions) setPredictions(data.predictions);
        if (data.validations) setValidations(data.validations);
        if (data.windowSize) setWindowSize(data.windowSize);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // 自动保存
  useEffect(() => {
    const data = { draws, predictions, validations, windowSize };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [draws, predictions, validations, windowSize]);

  // 批量验证逻辑
  useEffect(() => {
    if (draws.length === 0 || predictions.length === 0) return;

    const newValidations: ValidationRecord[] = [];
    const existingValidationPeriods = new Set(validations.map(v => v.period));

    draws.forEach(draw => {
      if (existingValidationPeriods.has(draw.period)) return;

      // 寻找匹配的预测
      const matchingPrediction = predictions.find(p => p.period === draw.period);
      if (matchingPrediction) {
        const result = validatePrediction(matchingPrediction, draw);
        newValidations.push({
          id: `${draw.period}_${Date.now()}_${Math.random()}`,
          period: draw.period,
          prediction: {
            id: matchingPrediction.period,
            period: matchingPrediction.period,
            predictedAt: matchingPrediction.generatedAt,
            windowSize: matchingPrediction.windowSize,
            hundredRanking: matchingPrediction.hundred.map(h => h.digit),
            tenRanking: matchingPrediction.ten.map(t => t.digit),
            oneRanking: matchingPrediction.one.map(o => o.digit),
            confidence: matchingPrediction.overallConfidence
          },
          actualHundred: draw.hundred,
          actualTen: draw.ten,
          actualOne: draw.one,
          hundredHit: result.hundredHit,
          tenHit: result.tenHit,
          oneHit: result.oneHit,
          hundredRank: result.hundredRank,
          tenRank: result.tenRank,
          oneRank: result.oneRank,
          validatedAt: new Date().toISOString()
        });
      }
    });

    if (newValidations.length > 0) {
      setValidations(prev => [...prev, ...newValidations].sort((a, b) => a.period.localeCompare(b.period)).slice(-200));
    }
  }, [draws, predictions, validations]);

  // 自动预测逻辑
  useEffect(() => {
    if (draws.length > drawsLengthRef.current) {
      const prediction = generatePrediction(draws, windowSize);
      if (prediction) {
        setCurrentPrediction(prediction);
        setPredictions(prev => {
          const filtered = prev.filter(p => p.period !== prediction.period);
          return [...filtered, prediction].slice(-100);
        });
      }
    }
    drawsLengthRef.current = draws.length;
  }, [draws, windowSize]);

  const importData = useCallback((data: string) => {
    setIsLoading(true);
    try {
      const lines = data.trim().split('\n');
      const newDraws: LotteryDraw[] = [];
      for (const line of lines) {
        const matches = line.trim().match(/^(\d+)[\s,\t]+(\d)[\s,\t]*(\d)[\s,\t]*(\d)/);
        if (matches) {
          const [, period, h, t, o] = matches;
          newDraws.push({ id: `${period}_${Math.random()}`, period, hundred: parseInt(h), ten: parseInt(t), one: parseInt(o) });
        }
      }
      setDraws(prev => {
        const combined = [...prev, ...newDraws];
        const uniqueMap = new Map();
        combined.forEach(d => uniqueMap.set(d.period, d));
        return Array.from(uniqueMap.values()).sort((a, b) => a.period.localeCompare(b.period));
      });
      return { success: true, message: '导入成功' };
    } catch (e) { return { success: false, message: '错误' }; } finally { setIsLoading(false); }
  }, []);

  const addDraw = useCallback((period: string, hundred: number, ten: number, one: number) => {
    const newDraw: LotteryDraw = { id: `${period}_${Date.now()}`, period, hundred, ten, one };
    setDraws(prev => {
      const filtered = prev.filter(d => d.period !== period);
      return [...filtered, newDraw].sort((a, b) => a.period.localeCompare(b.period));
    });
  }, []);

  const generateNewPrediction = useCallback(() => {
    const prediction = generatePrediction(draws, windowSize);
    if (prediction) {
      setCurrentPrediction(prediction);
      setPredictions(prev => [...prev.filter(p => p.period !== prediction.period), prediction].slice(-100));
    }
    return prediction;
  }, [draws, windowSize]);

  const getStatistics = useCallback((): StatisticsSummary => {
    if (validations.length === 0) {
      return {
        totalDraws: draws.length, totalPredictions: predictions.length,
        overallAccuracy: 0, hundredAccuracy: 0, tenAccuracy: 0, oneAccuracy: 0,
        currentStreak: 0, maxStreak: 0, recentAccuracy: []
      };
    }
    
    const anyHits = validations.filter(v => v.hundredHit || v.tenHit || v.oneHit).length;
    let currentStreak = 0;
    const sortedValidations = [...validations].sort((a, b) => b.period.localeCompare(a.period));
    for (const v of sortedValidations) {
      if (v.hundredHit || v.tenHit || v.oneHit) currentStreak++;
      else break;
    }

    return {
      totalDraws: draws.length,
      totalPredictions: predictions.length,
      overallAccuracy: Math.round((anyHits / validations.length) * 100),
      hundredAccuracy: Math.round((validations.filter(v => v.hundredHit).length / validations.length) * 100),
      tenAccuracy: Math.round((validations.filter(v => v.tenHit).length / validations.length) * 100),
      oneAccuracy: Math.round((validations.filter(v => v.oneHit).length / validations.length) * 100),
      currentStreak,
      maxStreak: 0,
      recentAccuracy: validations.slice(-20).map(v => (v.hundredHit || v.tenHit || v.oneHit ? 100 : 0))
    };
  }, [draws, predictions, validations]);

  return {
    draws, predictions, validations, windowSize, currentPrediction, isLoading, isSyncing,
    syncRemoteData, setWindowSize, importData, addDraw, generateNewPrediction, getStatistics,
    clearData: () => { if(confirm('清空？')) { setDraws([]); setPredictions([]); setValidations([]); } },
    deleteDraw: (id: string) => setDraws(prev => prev.filter(d => d.id !== id)),
    generateSampleData: () => {
      const sampleData: LotteryDraw[] = [];
      const now = new Date();
      for (let i = 0; i < 100; i++) {
        const date = new Date(now.getTime() - (100 - i) * 60000);
        const pad = (n: number) => String(n).padStart(2, '0');
        const period = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
        sampleData.push({ id: period, period, hundred: Math.floor(Math.random()*10), ten: Math.floor(Math.random()*10), one: Math.floor(Math.random()*10) });
      }
      setDraws(sampleData);
    }
  };
}
