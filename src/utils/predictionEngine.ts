import type { 
  LotteryDraw, 
  PredictionResult, 
  PatternMatch
} from '@/types/lottery';
import { 
  calculateAllFeatures,
  calculateHotCold,
  calculatePositionStats,
  calculateFollowRelations
} from './featureCalculator';

/**
 * 预测引擎 - 优化版
 */

const FEATURE_WEIGHTS = {
  hotCold: 1.2,
  streaks: 1.0,
  sumValue: 0.8,
  spanValue: 0.8,
  sizeRatio: 0.7,
  oddEvenRatio: 0.7,
  road012Ratio: 0.6,
  positionStats: 1.5,
  followRelations: 1.8
};

/**
 * 核心归一化算法 - 引入平滑处理 (Laplace Smoothing 思想)
 * 确保即使是最低分的数字也有一定的基础概率，避免 0%
 */
function smoothNormalize(scores: number[]): { digit: number; score: number; probability: number }[] {
  const minBase = 1; // 基础分
  const smoothedScores = scores.map(s => s + minBase);
  const totalScore = smoothedScores.reduce((a, b) => a + b, 0);
  
  return smoothedScores.map((score, digit) => ({
    digit,
    score: Math.round(scores[digit] * 10) / 10,
    probability: Math.round((score / totalScore) * 100)
  })).sort((a, b) => b.score - a.score);
}

/**
 * 生成预测结果
 */
export function generatePrediction(
  draws: LotteryDraw[],
  windowSize: number = 30
): PredictionResult | null {
  // 需要至少一些数据来进行预测
  if (draws.length < 5) {
    return null;
  }

  // 1. 计算当前特征 (基于最近 windowSize 期)
  const currentFeatures = calculateAllFeatures(draws, windowSize);
  if (!currentFeatures) return null;

  const patternMatches: PatternMatch[] = [];
  const historicalData = draws.slice(0, -1); // 用于寻找模式的历史数据

  // 2. 模式匹配
  
  // 冷热号匹配
  const hotDigits = currentFeatures.basic.hotCold.filter(h => h.category === 'hot').map(h => h.digit);
  const hotColdNextDigits = new Map<number, number>();
  
  const searchWindow = Math.min(windowSize, historicalData.length - 1);
  if (searchWindow > 0) {
    for (let i = searchWindow; i < historicalData.length; i++) {
      const historicalWindow = historicalData.slice(i - searchWindow, i);
      const histHotCold = calculateHotCold(historicalWindow, searchWindow);
      const histHotDigits = histHotCold.filter(h => h.category === 'hot').map(h => h.digit);
      
      const similarity = calculateArraySimilarity(hotDigits, histHotDigits);
      if (similarity >= 0.6) {
        const nextDraw = historicalData[i];
        if (nextDraw) {
          [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
            hotColdNextDigits.set(d, (hotColdNextDigits.get(d) || 0) + similarity);
          });
        }
      }
    }
  }
  patternMatches.push({
    featureName: '冷热号模式',
    matchedCount: hotColdNextDigits.size,
    nextDigits: hotColdNextDigits,
    confidence: FEATURE_WEIGHTS.hotCold
  });

  // 跟随关系匹配
  const lastDraw = draws[draws.length - 1];
  const relations = calculateFollowRelations(draws, 50);
  const followNextDigits = new Map<number, number>();
  
  [lastDraw.hundred, lastDraw.ten, lastDraw.one].forEach(d => {
    const followers = relations.get(d) || [];
    followers.forEach((f, index) => {
      followNextDigits.set(f, (followNextDigits.get(f) || 0) + (3 - index));
    });
  });
  patternMatches.push({
    featureName: '跟随关系模式',
    matchedCount: 3,
    nextDigits: followNextDigits,
    confidence: FEATURE_WEIGHTS.followRelations
  });

  // 3. 综合评分
  const hundredScores = new Array(10).fill(0);
  const tenScores = new Array(10).fill(0);
  const oneScores = new Array(10).fill(0);

  patternMatches.forEach(match => {
    match.nextDigits.forEach((weight, digit) => {
      const score = weight * match.confidence;
      hundredScores[digit] += score * 0.4;
      tenScores[digit] += score * 0.3;
      oneScores[digit] += score * 0.3;
    });
  });

  // 4. 位置振幅修正
  ['hundred', 'ten', 'one'].forEach((pos, idx) => {
    const stats = calculatePositionStats(draws, pos as any, windowSize);
    const scores = idx === 0 ? hundredScores : idx === 1 ? tenScores : oneScores;
    
    const currentDigit = stats.digit;
    if (stats.amplitude >= 5) {
      [ (currentDigit + 1) % 10, (currentDigit + 9) % 10, currentDigit ].forEach(d => scores[d] += 2);
    } else {
      [ (currentDigit + 4) % 10, (currentDigit + 6) % 10 ].forEach(d => scores[d] += 1.5);
    }
  });

  // 5. 生成结果
  // 核心：基于最后一次开奖的期号推算下一次期号
  const nextPeriod = generateNextPeriod(lastDraw.period);

  return {
    period: nextPeriod,
    windowSize,
    hundred: smoothNormalize(hundredScores),
    ten: smoothNormalize(tenScores),
    one: smoothNormalize(oneScores),
    combined: [],
    overallConfidence: calculateOverallConfidence(patternMatches),
    patternMatches,
    generatedAt: new Date().toISOString()
  };
}

/**
 * 辅助：计算数组相似度
 */
function calculateArraySimilarity(arr1: number[], arr2: number[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1;
  const s1 = new Set(arr1);
  const s2 = new Set(arr2);
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

/**
 * 辅助：计算整体置信度
 */
function calculateOverallConfidence(matches: PatternMatch[]): number {
  const validMatches = matches.filter(m => m.matchedCount > 0);
  if (validMatches.length === 0) return 0;
  const avgConf = validMatches.reduce((a, b) => a + b.confidence, 0) / validMatches.length;
  return Math.min(Math.round(avgConf * 40), 95);
}

/**
 * 辅助：生成下一期期号 (适配时间戳格式)
 */
function generateNextPeriod(current: string): string {
  // 如果期号是时间戳格式 (14位: YYYYMMDDHHmmss)
  if (current.length === 14 && /^\d+$/.test(current)) {
    const year = parseInt(current.slice(0, 4));
    const month = parseInt(current.slice(4, 6)) - 1;
    const day = parseInt(current.slice(6, 8));
    const hour = parseInt(current.slice(8, 10));
    const min = parseInt(current.slice(10, 12));
    const sec = parseInt(current.slice(12, 14));
    
    const date = new Date(year, month, day, hour, min, sec);
    // 假设每分钟一期，推算下一分钟
    date.setMinutes(date.getMinutes() + 1);
    
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }
  
  // 如果是普通递增格式
  if (/^\d+$/.test(current)) {
    try {
      const next = BigInt(current) + 1n;
      return next.toString().padStart(current.length, '0');
    } catch(e) {
      return (parseInt(current) + 1).toString().padStart(current.length, '0');
    }
  }

  return current + '_next';
}

/**
 * 验证预测结果
 */
export function validatePrediction(prediction: PredictionResult, actual: LotteryDraw) {
  const hRank = prediction.hundred.findIndex(d => d.digit === actual.hundred) + 1;
  const tRank = prediction.ten.findIndex(d => d.digit === actual.ten) + 1;
  const oRank = prediction.one.findIndex(d => d.digit === actual.one) + 1;

  return {
    hundredHit: hRank <= 3,
    tenHit: tRank <= 3,
    oneHit: oRank <= 3,
    hundredRank: hRank,
    tenRank: tRank,
    oneRank: oRank
  };
}
