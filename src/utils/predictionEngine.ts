import type { 
  LotteryDraw, 
  PredictionResult, 
  PatternMatch,
  FullFeatures 
} from '@/types/lottery';
import { 
  calculateAllFeatures,
  calculateHotCold,
  calculateStreaks,
  calculateSumValue,
  calculateSpan,
  calculateSizeRatio,
  calculateOddEvenRatio,
  calculateRoad012Ratio,
  calculatePositionStats,
  calculateHotWarmColdZone,
  calculateMissingLayers,
  calculateFollowRelations
} from './featureCalculator';

/**
 * 预测引擎 - 基于模式匹配生成预测
 */

// 特征匹配权重配置
const FEATURE_WEIGHTS = {
  hotCold: 1.0,
  streaks: 0.8,
  sumValue: 0.6,
  spanValue: 0.6,
  sizeRatio: 0.7,
  oddEvenRatio: 0.7,
  road012Ratio: 0.5,
  positionStats: 1.2,
  hotWarmColdZone: 0.9,
  missingLayers: 0.8,
  followRelations: 1.5
};

/**
 * 生成预测结果
 */
export function generatePrediction(
  draws: LotteryDraw[],
  windowSize: number = 30
): PredictionResult | null {
  if (draws.length < windowSize + 1) {
    return null;
  }

  const currentDraw = draws[draws.length - 1];
  const recentDraws = draws.slice(-windowSize - 1, -1);
  
  // 计算当前期特征
  const currentFeatures = calculateAllFeatures([currentDraw], windowSize);
  if (!currentFeatures) return null;

  // 模式匹配
  const patternMatches: PatternMatch[] = [];

  // 1. 冷热号模式匹配
  const hotColdMatch = matchHotColdPattern(recentDraws, currentFeatures);
  patternMatches.push(hotColdMatch);

  // 2. 连中连挂模式匹配
  const streakMatch = matchStreakPattern(recentDraws, currentFeatures);
  patternMatches.push(streakMatch);

  // 3. 和值模式匹配
  const sumMatch = matchSumPattern(recentDraws, currentFeatures);
  patternMatches.push(sumMatch);

  // 4. 跨度模式匹配
  const spanMatch = matchSpanPattern(recentDraws, currentFeatures);
  patternMatches.push(spanMatch);

  // 5. 大小比模式匹配
  const sizeMatch = matchSizePattern(recentDraws, currentFeatures);
  patternMatches.push(sizeMatch);

  // 6. 单双比模式匹配
  const oddEvenMatch = matchOddEvenPattern(recentDraws, currentFeatures);
  patternMatches.push(oddEvenMatch);

  // 7. 012路模式匹配
  const roadMatch = matchRoad012Pattern(recentDraws, currentFeatures);
  patternMatches.push(roadMatch);

  // 8. 位置统计模式匹配
  const positionMatch = matchPositionPattern(recentDraws, currentFeatures);
  patternMatches.push(positionMatch);

  // 9. 热温冷分区模式匹配
  const zoneMatch = matchHotWarmColdZonePattern(recentDraws, currentFeatures);
  patternMatches.push(zoneMatch);

  // 10. 遗漏分层模式匹配
  const missingMatch = matchMissingLayersPattern(recentDraws, currentFeatures);
  patternMatches.push(missingMatch);

  // 11. 跟随关系模式匹配
  const followMatch = matchFollowRelationsPattern(recentDraws);
  patternMatches.push(followMatch);

  // 综合各特征预测结果
  const hundredScores = new Array(10).fill(0);
  const tenScores = new Array(10).fill(0);
  const oneScores = new Array(10).fill(0);

  patternMatches.forEach(match => {
    match.nextDigits.forEach((count, digit) => {
      const score = count * match.confidence;
      // 根据历史模式，将分数分配到各个位置
      hundredScores[digit] += score * 0.4;
      tenScores[digit] += score * 0.3;
      oneScores[digit] += score * 0.3;
    });
  });

  // 添加位置特定分析
  const hundredStats = calculatePositionStats(draws, 'hundred', windowSize);
  const tenStats = calculatePositionStats(draws, 'ten', windowSize);
  const oneStats = calculatePositionStats(draws, 'one', windowSize);

  // 位置振幅分析 - 预测下期可能数字
  const hundredAmplitudePrediction = predictByAmplitude(hundredStats);
  const tenAmplitudePrediction = predictByAmplitude(tenStats);
  const oneAmplitudePrediction = predictByAmplitude(oneStats);

  hundredAmplitudePrediction.forEach(d => hundredScores[d] += 2);
  tenAmplitudePrediction.forEach(d => tenScores[d] += 2);
  oneAmplitudePrediction.forEach(d => oneScores[d] += 2);

  // 归一化并排序
  const hundredRanking = normalizeAndSort(hundredScores);
  const tenRanking = normalizeAndSort(tenScores);
  const oneRanking = normalizeAndSort(oneScores);

  // 计算综合推荐
  const combined = generateCombinedRecommendation(hundredRanking, tenRanking, oneRanking);

  // 计算整体置信度
  const overallConfidence = calculateOverallConfidence(patternMatches);

  // 生成下一期期号
  const nextPeriod = generateNextPeriod(currentDraw.period);

  return {
    period: nextPeriod,
    windowSize,
    hundred: hundredRanking,
    ten: tenRanking,
    one: oneRanking,
    combined,
    overallConfidence,
    patternMatches,
    generatedAt: new Date().toISOString()
  };
}

/**
 * 冷热号模式匹配
 */
function matchHotColdPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentHotCold = currentFeatures.basic.hotCold;
  const hotDigits = currentHotCold.filter(h => h.category === 'hot').map(h => h.digit);
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    
    const features = calculateHotCold([draw], 1);
    const drawHotDigits = features.filter(h => h.category === 'hot').map(h => h.digit);
    
    // 如果热号相似，记录下期数字
    const similarity = calculateArraySimilarity(hotDigits, drawHotDigits);
    if (similarity >= 0.5) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '冷热号模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.hotCold
  };
}

/**
 * 连中连挂模式匹配
 */
function matchStreakPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentStreaks = currentFeatures.basic.streaks;
  const hotStreaks = currentStreaks.filter(s => s.consecutiveHits >= 2).map(s => s.digit);
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 1; i < historicalDraws.length - 1; i++) {
    const prevDraw = historicalDraws[i - 1];
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    
    const streaks = calculateStreaks([prevDraw, draw]);
    const drawHotStreaks = streaks.filter(s => s.consecutiveHits >= 2).map(s => s.digit);
    
    if (calculateArraySimilarity(hotStreaks, drawHotStreaks) >= 0.5) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '连中连挂模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.streaks
  };
}

/**
 * 和值模式匹配
 */
function matchSumPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentSum = currentFeatures.basic.sumValue;
  const sumRange = 3; // 允许±3的误差
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const sum = calculateSumValue(draw);
    
    if (Math.abs(sum - currentSum) <= sumRange) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '和值模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.sumValue
  };
}

/**
 * 跨度模式匹配
 */
function matchSpanPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentSpan = currentFeatures.basic.spanValue;
  const spanRange = 1; // 允许±1的误差
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const span = calculateSpan(draw);
    
    if (Math.abs(span - currentSpan) <= spanRange) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '跨度模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.spanValue
  };
}

/**
 * 大小比模式匹配
 */
function matchSizePattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentSize = currentFeatures.basic.sizeRatio;
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const size = calculateSizeRatio(draw);
    
    if (size.big === currentSize.big && size.small === currentSize.small) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '大小比模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.sizeRatio
  };
}

/**
 * 单双比模式匹配
 */
function matchOddEvenPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentOddEven = currentFeatures.basic.oddEvenRatio;
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const oddEven = calculateOddEvenRatio(draw);
    
    if (oddEven.odd === currentOddEven.odd && oddEven.even === currentOddEven.even) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '单双比模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.oddEvenRatio
  };
}

/**
 * 012路模式匹配
 */
function matchRoad012Pattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const currentRoad = currentFeatures.basic.road012Ratio;
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const road = calculateRoad012Ratio(draw);
    
    if (road.road0 === currentRoad.road0 && 
        road.road1 === currentRoad.road1 && 
        road.road2 === currentRoad.road2) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '012路模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.road012Ratio
  };
}

/**
 * 位置统计模式匹配
 */
function matchPositionPattern(historicalDraws: LotteryDraw[], currentFeatures: FullFeatures): PatternMatch {
  const nextDigits = new Map<number, number>();
  
  // 基于位置遗漏值进行匹配
  const hundredMissing = currentFeatures.position.hundred.currentMissing;
  const tenMissing = currentFeatures.position.ten.currentMissing;
  const oneMissing = currentFeatures.position.one.currentMissing;
  
  for (let i = 1; i < historicalDraws.length - 1; i++) {
    const prevDraws = historicalDraws.slice(0, i + 1);
    const nextDraw = historicalDraws[i + 1];
    
    const hStats = calculatePositionStats(prevDraws, 'hundred', 30);
    const tStats = calculatePositionStats(prevDraws, 'ten', 30);
    const oStats = calculatePositionStats(prevDraws, 'one', 30);
    
    if (Math.abs(hStats.currentMissing - hundredMissing) <= 2 &&
        Math.abs(tStats.currentMissing - tenMissing) <= 2 &&
        Math.abs(oStats.currentMissing - oneMissing) <= 2) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '位置统计模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.positionStats
  };
}

/**
 * 热温冷分区模式匹配
 */
function matchHotWarmColdZonePattern(
  historicalDraws: LotteryDraw[], 
  currentFeatures: FullFeatures
): PatternMatch {
  const currentZone = currentFeatures.composite.hotWarmColdZone;
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws[i];
    const nextDraw = historicalDraws[i + 1];
    const zone = calculateHotWarmColdZone([draw], 1);
    
    const hotSimilarity = calculateArraySimilarity(currentZone.hot, zone.hot);
    const warmSimilarity = calculateArraySimilarity(currentZone.warm, zone.warm);
    const coldSimilarity = calculateArraySimilarity(currentZone.cold, zone.cold);
    
    if ((hotSimilarity + warmSimilarity + coldSimilarity) / 3 >= 0.5) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '热温冷分区模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.hotWarmColdZone
  };
}

/**
 * 遗漏分层模式匹配
 */
function matchMissingLayersPattern(
  historicalDraws: LotteryDraw[], 
  currentFeatures: FullFeatures
): PatternMatch {
  const currentLayers = currentFeatures.composite.missingLayers;
  
  const nextDigits = new Map<number, number>();
  
  for (let i = 0; i < historicalDraws.length - 1; i++) {
    const draw = historicalDraws.slice(0, i + 1);
    const nextDraw = historicalDraws[i + 1];
    const layers = calculateMissingLayers(draw);
    
    const l1Similarity = calculateArraySimilarity(currentLayers.layer1, layers.layer1);
    const l2Similarity = calculateArraySimilarity(currentLayers.layer2, layers.layer2);
    const l3Similarity = calculateArraySimilarity(currentLayers.layer3, layers.layer3);
    
    if ((l1Similarity + l2Similarity + l3Similarity) / 3 >= 0.4) {
      [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
        nextDigits.set(d, (nextDigits.get(d) || 0) + 1);
      });
    }
  }
  
  return {
    featureName: '遗漏分层模式',
    matchedCount: nextDigits.size > 0 ? historicalDraws.length : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.missingLayers
  };
}

/**
 * 跟随关系模式匹配
 */
function matchFollowRelationsPattern(
  historicalDraws: LotteryDraw[]
): PatternMatch {
  const currentDraw = historicalDraws[historicalDraws.length - 1];
  const relations = calculateFollowRelations(historicalDraws, 30);
  
  const nextDigits = new Map<number, number>();
  
  // 基于当前出现的数字，获取其跟随数字
  [currentDraw.hundred, currentDraw.ten, currentDraw.one].forEach(d => {
    const followers = relations.get(d) || [];
    followers.forEach(f => {
      nextDigits.set(f, (nextDigits.get(f) || 0) + 2);
    });
  });
  
  return {
    featureName: '跟随关系模式',
    matchedCount: nextDigits.size > 0 ? 3 : 0,
    nextDigits,
    confidence: FEATURE_WEIGHTS.followRelations
  };
}

/**
 * 基于振幅预测
 */
function predictByAmplitude(stats: { digit: number; amplitude: number }): number[] {
  const predictions: number[] = [];
  const currentDigit = stats.digit;
  const amplitude = stats.amplitude;
  
  // 基于振幅预测下期可能数字
  if (amplitude <= 2) {
    // 小振幅，可能继续附近数字
    predictions.push(currentDigit);
    predictions.push((currentDigit + 1) % 10);
    predictions.push((currentDigit + 9) % 10);
  } else if (amplitude >= 5) {
    // 大振幅，可能反弹
    predictions.push((currentDigit + 5) % 10);
    predictions.push((currentDigit + 4) % 10);
    predictions.push((currentDigit + 6) % 10);
  } else {
    // 中等振幅
    predictions.push((currentDigit + 2) % 10);
    predictions.push((currentDigit + 8) % 10);
    predictions.push(currentDigit);
  }
  
  return [...new Set(predictions)];
}

/**
 * 归一化并排序
 */
function normalizeAndSort(scores: number[]): { digit: number; score: number; probability: number }[] {
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore || 1;
  
  const normalized = scores.map((score, digit) => ({
    digit,
    score: Math.round(score * 10) / 10,
    probability: Math.round(((score - minScore) / range) * 100)
  }));
  
  return normalized.sort((a, b) => b.score - a.score);
}

/**
 * 生成综合推荐
 */
function generateCombinedRecommendation(
  hundred: { digit: number; score: number; probability: number }[],
  ten: { digit: number; score: number; probability: number }[],
  one: { digit: number; score: number; probability: number }[]
): { digits: number[]; score: number }[] {
  const combinations: { digits: number[]; score: number }[] = [];
  
  // 取前5名生成组合
  const topH = hundred.slice(0, 5);
  const topT = ten.slice(0, 5);
  const topO = one.slice(0, 5);
  
  for (const h of topH) {
    for (const t of topT) {
      for (const o of topO) {
        const score = h.probability * 0.4 + t.probability * 0.3 + o.probability * 0.3;
        combinations.push({
          digits: [h.digit, t.digit, o.digit],
          score: Math.round(score)
        });
      }
    }
  }
  
  return combinations.sort((a, b) => b.score - a.score).slice(0, 10);
}

/**
 * 计算整体置信度
 */
function calculateOverallConfidence(patternMatches: PatternMatch[]): number {
  if (patternMatches.length === 0) return 0;
  
  const totalConfidence = patternMatches.reduce((sum, m) => sum + m.confidence, 0);
  const avgConfidence = totalConfidence / patternMatches.length;
  
  // 基于匹配数量调整置信度
  const totalMatches = patternMatches.reduce((sum, m) => sum + m.matchedCount, 0);
  const matchFactor = Math.min(totalMatches / 100, 1);
  
  return Math.round(avgConfidence * matchFactor * 100);
}

/**
 * 计算数组相似度
 */
function calculateArraySimilarity(arr1: number[], arr2: number[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1;
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * 生成下一期期号
 */
function generateNextPeriod(currentPeriod: string): string {
  // 假设期号是数字格式
  const num = parseInt(currentPeriod);
  if (!isNaN(num)) {
    return String(num + 1).padStart(currentPeriod.length, '0');
  }
  
  // 如果是日期格式，加1天
  if (currentPeriod.length === 8) {
    const year = currentPeriod.slice(0, 4);
    const month = currentPeriod.slice(4, 6);
    const day = currentPeriod.slice(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  
  return currentPeriod + '-下一期';
}

/**
 * 验证预测
 */
export function validatePrediction(
  prediction: PredictionResult,
  actualDraw: LotteryDraw
): {
  hundredHit: boolean;
  tenHit: boolean;
  oneHit: boolean;
  hundredRank: number;
  tenRank: number;
  oneRank: number;
} {
  const hundredRank = prediction.hundred.findIndex(h => h.digit === actualDraw.hundred) + 1;
  const tenRank = prediction.ten.findIndex(t => t.digit === actualDraw.ten) + 1;
  const oneRank = prediction.one.findIndex(o => o.digit === actualDraw.one) + 1;
  
  return {
    hundredHit: hundredRank > 0 && hundredRank <= 3, // 前3名算命中
    tenHit: tenRank > 0 && tenRank <= 3,
    oneHit: oneRank > 0 && oneRank <= 3,
    hundredRank: hundredRank || 11,
    tenRank: tenRank || 11,
    oneRank: oneRank || 11
  };
}
