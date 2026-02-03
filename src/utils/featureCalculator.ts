import type { 
  LotteryDraw, 
  HotColdStats, 
  StreakStats, 
  PositionStats, 
  BasicFeatures, 
  PositionFeatures, 
  CompositeFeatures,
  FullFeatures 
} from '@/types/lottery';

// ==================== 基础特征计算 ====================

/**
 * 1. 冷热号分析 - 各数字在最近N期的出现频次
 */
export function calculateHotCold(draws: LotteryDraw[], windowSize: number = 30): HotColdStats[] {
  const recentDraws = draws.slice(-windowSize);
  const counts = new Array(10).fill(0);
  
  recentDraws.forEach(draw => {
    counts[draw.hundred]++;
    counts[draw.ten]++;
    counts[draw.one]++;
  });
  
  const maxFreq = Math.max(...counts);
  const minFreq = Math.min(...counts);
  const threshold = (maxFreq + minFreq) / 2;
  const hotThreshold = maxFreq * 0.7;
  
  return counts.map((freq, digit) => ({
    digit,
    frequency: freq,
    category: freq >= hotThreshold ? 'hot' : freq >= threshold ? 'warm' : 'cold'
  }));
}

/**
 * 2. 连中/连挂分析 - 数字连续出现/未出现的期数
 */
export function calculateStreaks(draws: LotteryDraw[]): StreakStats[] {
  const stats: StreakStats[] = [];
  
  for (let digit = 0; digit <= 9; digit++) {
    let consecutiveHits = 0;
    let consecutiveMisses = 0;
    let currentStreak: 'hit' | 'miss' | 'none' = 'none';
    
    // 从最近一期往前遍历
    for (let i = draws.length - 1; i >= 0; i--) {
      const draw = draws[i];
      const appeared = draw.hundred === digit || draw.ten === digit || draw.one === digit;
      
      if (appeared) {
        if (currentStreak === 'miss') {
          break;
        }
        if (currentStreak === 'none') {
          consecutiveHits = 1;
          currentStreak = 'hit';
        } else {
          consecutiveHits++;
        }
      } else {
        if (currentStreak === 'hit') {
          break;
        }
        consecutiveMisses++;
        currentStreak = 'miss';
      }
    }
    
    stats.push({ digit, consecutiveHits, consecutiveMisses, currentStreak });
  }
  
  return stats;
}

/**
 * 3. 计算和值 - 所有号码之和
 */
export function calculateSumValue(draw: LotteryDraw): number {
  return draw.hundred + draw.ten + draw.one;
}

/**
 * 4. 计算跨度 - 最大号 - 最小号
 */
export function calculateSpan(draw: LotteryDraw): number {
  const digits = [draw.hundred, draw.ten, draw.one];
  return Math.max(...digits) - Math.min(...digits);
}

/**
 * 5. 大小比 - 大数(5-9) vs 小数(0-4)
 */
export function calculateSizeRatio(draw: LotteryDraw): { big: number; small: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const big = digits.filter(d => d >= 5).length;
  const small = digits.filter(d => d < 5).length;
  return { big, small };
}

/**
 * 6. 单双比 - 奇数 vs 偶数
 */
export function calculateOddEvenRatio(draw: LotteryDraw): { odd: number; even: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const odd = digits.filter(d => d % 2 === 1).length;
  const even = digits.filter(d => d % 2 === 0).length;
  return { odd, even };
}

/**
 * 7. 质合比 - 质数(2,3,5,7) vs 合数
 */
export function calculatePrimeCompositeRatio(draw: LotteryDraw): { prime: number; composite: number } {
  const primes = [2, 3, 5, 7];
  const digits = [draw.hundred, draw.ten, draw.one];
  const prime = digits.filter(d => primes.includes(d)).length;
  const composite = digits.filter(d => d > 1 && !primes.includes(d)).length;
  return { prime, composite };
}

/**
 * 8. 012路比 - 除3余数的分布
 */
export function calculateRoad012Ratio(draw: LotteryDraw): { road0: number; road1: number; road2: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const road0 = digits.filter(d => d % 3 === 0).length;
  const road1 = digits.filter(d => d % 3 === 1).length;
  const road2 = digits.filter(d => d % 3 === 2).length;
  return { road0, road1, road2 };
}

/**
 * 9. AC值 - 号码的复杂度指标
 * AC值 = 所有两两差值中不同值的个数
 */
export function calculateACValue(draw: LotteryDraw): number {
  const digits = [draw.hundred, draw.ten, draw.one];
  const differences = new Set<number>();
  
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      differences.add(Math.abs(digits[i] - digits[j]));
    }
  }
  
  return differences.size;
}

/**
 * 10. 奇偶连号模式
 */
export function calculateOddEvenPattern(draw: LotteryDraw): string {
  const pattern = [
    draw.hundred % 2 === 1 ? '奇' : '偶',
    draw.ten % 2 === 1 ? '奇' : '偶',
    draw.one % 2 === 1 ? '奇' : '偶'
  ];
  return pattern.join('');
}

// ==================== 位置特征计算 ====================

/**
 * 计算单个位置的统计信息
 */
export function calculatePositionStats(
  draws: LotteryDraw[], 
  position: 'hundred' | 'ten' | 'one',
  windowSize: number = 30
): PositionStats {
  const recentDraws = draws.slice(-windowSize);
  const digit = draws[draws.length - 1]?.[position] ?? 0;
  
  // 频次统计
  const counts = new Array(10).fill(0);
  recentDraws.forEach(draw => {
    counts[draw[position]]++;
  });
  const frequency = counts[digit];
  
  // 当前遗漏
  let currentMissing = 0;
  for (let i = draws.length - 1; i >= 0; i--) {
    if (draws[i][position] === digit) break;
    currentMissing++;
  }
  
  // 最大遗漏
  let maxMissing = 0;
  let currentMiss = 0;
  for (let i = 0; i < draws.length; i++) {
    if (draws[i][position] === digit) {
      maxMissing = Math.max(maxMissing, currentMiss);
      currentMiss = 0;
    } else {
      currentMiss++;
    }
  }
  
  // 平均遗漏
  const totalMissing = draws.reduce((sum, draw, idx) => {
    if (idx === 0) return 0;
    let miss = 0;
    for (let i = idx - 1; i >= 0; i--) {
      if (draws[i][position] === draw[position]) break;
      miss++;
    }
    return sum + miss;
  }, 0);
  const avgMissing = draws.length > 0 ? totalMissing / draws.length : 0;
  
  // 振幅 = |本期数字 - 上期数字|
  const prevDigit = draws.length > 1 ? draws[draws.length - 2][position] : digit;
  const amplitude = Math.abs(digit - prevDigit);
  
  return { digit, frequency, currentMissing, maxMissing, avgMissing: Math.round(avgMissing * 10) / 10, amplitude };
}

/**
 * 计算位置和
 */
export function calculatePositionSum(draws: LotteryDraw[]): number {
  if (draws.length === 0) return 0;
  const lastDraw = draws[draws.length - 1];
  return lastDraw.hundred + lastDraw.ten + lastDraw.one;
}

/**
 * 计算位置差
 */
export function calculatePositionDiff(draw: LotteryDraw): { ht: number; to: number; ho: number } {
  return {
    ht: Math.abs(draw.hundred - draw.ten),
    to: Math.abs(draw.ten - draw.one),
    ho: Math.abs(draw.hundred - draw.one)
  };
}

/**
 * 重号位置分析
 */
export function calculateRepeatPosition(current: LotteryDraw, previous: LotteryDraw): boolean[] {
  return [
    current.hundred === previous.hundred,
    current.ten === previous.ten,
    current.one === previous.one
  ];
}

/**
 * 邻号位置分析
 */
export function calculateNeighborPosition(current: LotteryDraw, previous: LotteryDraw): boolean[] {
  return [
    Math.abs(current.hundred - previous.hundred) === 1,
    Math.abs(current.ten - previous.ten) === 1,
    Math.abs(current.one - previous.one) === 1
  ];
}

/**
 * 斜连号模式
 */
export function calculateDiagonalPattern(draws: LotteryDraw[]): string {
  if (draws.length < 3) return '无';
  const last3 = draws.slice(-3);
  const hTrend = last3[2].hundred - last3[1].hundred;
  const tTrend = last3[1].ten - last3[0].ten;
  const oTrend = last3[0].one - (draws[draws.length - 4]?.one ?? last3[0].one);
  
  if (hTrend === tTrend && tTrend === oTrend && hTrend !== 0) {
    return hTrend > 0 ? '上升斜连' : '下降斜连';
  }
  return '无';
}

/**
 * 对称号模式
 */
export function calculateSymmetryPattern(draw: LotteryDraw): string {
  if (draw.hundred === draw.one) return '百个对称';
  if (draw.hundred === draw.ten) return '百十对称';
  if (draw.ten === draw.one) return '十个对称';
  return '无对称';
}

// ==================== 复合特征计算 ====================

/**
 * 1. 和值尾
 */
export function calculateSumTail(draw: LotteryDraw): number {
  return calculateSumValue(draw) % 10;
}

/**
 * 2. 跨度尾
 */
export function calculateSpanTail(draw: LotteryDraw): number {
  return calculateSpan(draw) % 10;
}

/**
 * 3. 和跨组合
 */
export function calculateSumSpanCombo(draw: LotteryDraw): string {
  const sum = calculateSumValue(draw);
  const span = calculateSpan(draw);
  return `${sum}-${span}`;
}

/**
 * 4. 大小单双组合
 */
export function calculateSizeOddEvenCombo(draw: LotteryDraw): string {
  const size = calculateSizeRatio(draw);
  const oddEven = calculateOddEvenRatio(draw);
  return `大${size.big}小${size.small}奇${oddEven.odd}偶${oddEven.even}`;
}

/**
 * 5. 质合012路组合
 */
export function calculatePrimeRoadCombo(draw: LotteryDraw): string {
  const prime = calculatePrimeCompositeRatio(draw);
  const road = calculateRoad012Ratio(draw);
  return `质${prime.prime}合${prime.composite}_0${road.road0}1${road.road1}2${road.road2}`;
}

/**
 * 6. 热温冷分区
 */
export function calculateHotWarmColdZone(
  draws: LotteryDraw[], 
  windowSize: number = 30
): { hot: number[]; warm: number[]; cold: number[] } {
  const hotCold = calculateHotCold(draws, windowSize);
  return {
    hot: hotCold.filter(h => h.category === 'hot').map(h => h.digit),
    warm: hotCold.filter(h => h.category === 'warm').map(h => h.digit),
    cold: hotCold.filter(h => h.category === 'cold').map(h => h.digit)
  };
}

/**
 * 7. 遗漏分层
 */
export function calculateMissingLayers(draws: LotteryDraw[]): { 
  layer1: number[]; 
  layer2: number[]; 
  layer3: number[] 
} {
  const streaks = calculateStreaks(draws);
  return {
    layer1: streaks.filter(s => s.consecutiveMisses >= 1 && s.consecutiveMisses <= 3).map(s => s.digit),
    layer2: streaks.filter(s => s.consecutiveMisses >= 4 && s.consecutiveMisses <= 7).map(s => s.digit),
    layer3: streaks.filter(s => s.consecutiveMisses >= 8).map(s => s.digit)
  };
}

/**
 * 8. 跟随关系 - A出现后B出现的概率
 */
export function calculateFollowRelations(
  draws: LotteryDraw[], 
  windowSize: number = 30
): Map<number, number[]> {
  const relations = new Map<number, number[]>();
  const recentDraws = draws.slice(-windowSize - 1, -1);
  
  for (let digitA = 0; digitA <= 9; digitA++) {
    const followers: number[] = [];
    
    for (let i = 0; i < recentDraws.length; i++) {
      const draw = recentDraws[i];
      const appeared = draw.hundred === digitA || draw.ten === digitA || draw.one === digitA;
      
      if (appeared && i + 1 < recentDraws.length) {
        const nextDraw = recentDraws[i + 1];
        followers.push(nextDraw.hundred, nextDraw.ten, nextDraw.one);
      }
    }
    
    // 统计出现频率最高的跟随数字
    const freqMap = new Map<number, number>();
    followers.forEach(d => {
      freqMap.set(d, (freqMap.get(d) || 0) + 1);
    });
    
    const sorted = Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => d);
    
    relations.set(digitA, sorted);
  }
  
  return relations;
}

/**
 * 9. 数字和 - 各位相加之和
 */
export function calculateDigitSum(draw: LotteryDraw): number {
  return draw.hundred + draw.ten + draw.one;
}

/**
 * 10. 乘积尾 - 各位相乘的尾数
 */
export function calculateProductTail(draw: LotteryDraw): number {
  return (draw.hundred * draw.ten * draw.one) % 10;
}

// ==================== 完整特征集计算 ====================

/**
 * 计算所有特征
 */
export function calculateAllFeatures(
  draws: LotteryDraw[], 
  windowSize: number = 30
): FullFeatures | null {
  if (draws.length === 0) return null;
  
  const currentDraw = draws[draws.length - 1];
  const previousDraw = draws.length > 1 ? draws[draws.length - 2] : currentDraw;
  
  const basic: BasicFeatures = {
    hotCold: calculateHotCold(draws, windowSize),
    streaks: calculateStreaks(draws),
    sumValue: calculateSumValue(currentDraw),
    spanValue: calculateSpan(currentDraw),
    sizeRatio: calculateSizeRatio(currentDraw),
    oddEvenRatio: calculateOddEvenRatio(currentDraw),
    primeCompositeRatio: calculatePrimeCompositeRatio(currentDraw),
    road012Ratio: calculateRoad012Ratio(currentDraw),
    acValue: calculateACValue(currentDraw),
    oddEvenPattern: calculateOddEvenPattern(currentDraw)
  };
  
  const position: PositionFeatures = {
    hundred: calculatePositionStats(draws, 'hundred', windowSize),
    ten: calculatePositionStats(draws, 'ten', windowSize),
    one: calculatePositionStats(draws, 'one', windowSize),
    positionSum: calculatePositionSum(draws),
    positionDiff: calculatePositionDiff(currentDraw),
    repeatPosition: calculateRepeatPosition(currentDraw, previousDraw),
    neighborPosition: calculateNeighborPosition(currentDraw, previousDraw),
    diagonalPattern: calculateDiagonalPattern(draws),
    symmetryPattern: calculateSymmetryPattern(currentDraw)
  };
  
  const composite: CompositeFeatures = {
    sumTail: calculateSumTail(currentDraw),
    spanTail: calculateSpanTail(currentDraw),
    sumSpanCombo: calculateSumSpanCombo(currentDraw),
    sizeOddEvenCombo: calculateSizeOddEvenCombo(currentDraw),
    primeRoadCombo: calculatePrimeRoadCombo(currentDraw),
    hotWarmColdZone: calculateHotWarmColdZone(draws, windowSize),
    missingLayers: calculateMissingLayers(draws),
    followRelations: calculateFollowRelations(draws, windowSize),
    digitSum: calculateDigitSum(currentDraw),
    productTail: calculateProductTail(currentDraw)
  };
  
  return { basic, position, composite };
}

// ==================== 辅助函数 ====================

/**
 * 判断是否为质数
 */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * 获取数字的012路
 */
export function getRoad012(n: number): number {
  return n % 3;
}
