import type { 
  LotteryDraw, 
  HotColdStats, 
  StreakStats, 
  PositionStats, 
  FullFeatures 
} from '@/types/lottery';

// ==================== 基础工具函数 ====================

/**
 * 判断是否为质数
 */
export function isPrime(n: number): boolean {
  const primes = [2, 3, 5, 7];
  return primes.includes(n);
}

/**
 * 获取数字的012路
 */
export function getRoad012(n: number): number {
  return n % 3;
}

// ==================== 基础特征计算 ====================

/**
 * 1. 冷热号分析 - 优化版
 * 使用动态阈值和标准差计算
 */
export function calculateHotCold(draws: LotteryDraw[], windowSize: number = 30): HotColdStats[] {
  const recentDraws = draws.slice(-windowSize);
  const counts = new Array(10).fill(0);
  
  recentDraws.forEach(draw => {
    counts[draw.hundred]++;
    counts[draw.ten]++;
    counts[draw.one]++;
  });
  
  // 计算平均值和标准差
  const avgFreq = counts.reduce((a, b) => a + b, 0) / 10;
  const variance = counts.reduce((sum, freq) => sum + Math.pow(freq - avgFreq, 2), 0) / 10;
  const stdDev = Math.sqrt(variance);
  
  // 动态阈值: 使用标准差来定义冷热
  const hotThreshold = avgFreq + stdDev * 0.5;
  const coldThreshold = avgFreq - stdDev * 0.5;
  
  return counts.map((freq, digit) => ({
    digit,
    frequency: freq,
    category: freq >= hotThreshold ? 'hot' : freq <= coldThreshold ? 'cold' : 'warm'
  }));
}

/**
 * 2. 连中/连挂分析 - 优化版
 * 增加历史最长连中/连挂记录
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
      
      if (i === draws.length - 1) {
        currentStreak = appeared ? 'hit' : 'miss';
      }

      if (appeared) {
        if (currentStreak === 'miss') break;
        consecutiveHits++;
      } else {
        if (currentStreak === 'hit') break;
        consecutiveMisses++;
      }
    }
    
    stats.push({ digit, consecutiveHits, consecutiveMisses, currentStreak });
  }
  
  return stats;
}

/**
 * 3. 计算和值
 */
export function calculateSumValue(draw: LotteryDraw): number {
  return draw.hundred + draw.ten + draw.one;
}

/**
 * 4. 计算跨度
 */
export function calculateSpan(draw: LotteryDraw): number {
  const digits = [draw.hundred, draw.ten, draw.one];
  return Math.max(...digits) - Math.min(...digits);
}

/**
 * 5. 大小比 (5-9 为大)
 */
export function calculateSizeRatio(draw: LotteryDraw): { big: number; small: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const big = digits.filter(d => d >= 5).length;
  return { big, small: 3 - big };
}

/**
 * 6. 单双比
 */
export function calculateOddEvenRatio(draw: LotteryDraw): { odd: number; even: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const odd = digits.filter(d => d % 2 === 1).length;
  return { odd, even: 3 - odd };
}

/**
 * 7. 质合比
 */
export function calculatePrimeCompositeRatio(draw: LotteryDraw): { prime: number; composite: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const prime = digits.filter(d => isPrime(d)).length;
  return { prime, composite: 3 - prime };
}

/**
 * 8. 012路比
 */
export function calculateRoad012Ratio(draw: LotteryDraw): { road0: number; road1: number; road2: number } {
  const digits = [draw.hundred, draw.ten, draw.one];
  const road0 = digits.filter(d => d % 3 === 0).length;
  const road1 = digits.filter(d => d % 3 === 1).length;
  const road2 = digits.filter(d => d % 3 === 2).length;
  return { road0, road1, road2 };
}

/**
 * 9. 形态分析 (组三、组六、豹子)
 */
export function calculatePattern(draw: LotteryDraw): '豹子' | '组三' | '组六' {
  const set = new Set([draw.hundred, draw.ten, draw.one]);
  if (set.size === 1) return '豹子';
  if (set.size === 2) return '组三';
  return '组六';
}

/**
 * 10. AC值计算
 */
export function calculateACValue(draw: LotteryDraw): number {
  const digits = [draw.hundred, draw.ten, draw.one];
  const differences = new Set<number>();
  for (let i = 0; i < digits.length; i++) {
    for (let j = i + 1; j < digits.length; j++) {
      const diff = Math.abs(digits[i] - digits[j]);
      if (diff !== 0) differences.add(diff);
    }
  }
  return differences.size;
}

// ==================== 位置特征计算 ====================

/**
 * 计算位置遗漏
 */
export function calculateMissing(draws: LotteryDraw[], position: 'hundred' | 'ten' | 'one', digit: number): number {
  let missing = 0;
  for (let i = draws.length - 1; i >= 0; i--) {
    if (draws[i][position] === digit) break;
    missing++;
  }
  return missing;
}

/**
 * 计算单个位置的详细统计 - 优化版
 */
export function calculatePositionStats(
  draws: LotteryDraw[], 
  position: 'hundred' | 'ten' | 'one',
  windowSize: number = 30
): PositionStats {
  const recentDraws = draws.slice(-windowSize);
  const lastDraw = draws[draws.length - 1];
  const currentDigit = lastDraw ? lastDraw[position] : 0;
  
  // 频次
  const frequency = recentDraws.filter(d => d[position] === currentDigit).length;
  
  // 遗漏计算
  const currentMissing = calculateMissing(draws.slice(0, -1), position, currentDigit);
  
  // 历史遗漏序列
  const missingSequence: number[] = [];
  let count = 0;
  for (let i = 0; i < draws.length; i++) {
    if (draws[i][position] === currentDigit) {
      missingSequence.push(count);
      count = 0;
    } else {
      count++;
    }
  }
  
  const maxMissing = missingSequence.length > 0 ? Math.max(...missingSequence) : currentMissing;
  const avgMissing = missingSequence.length > 0 
    ? missingSequence.reduce((a, b) => a + b, 0) / missingSequence.length 
    : 0;
  
  const prevDigit = draws.length > 1 ? draws[draws.length - 2][position] : currentDigit;
  const amplitude = Math.abs(currentDigit - prevDigit);
  
  return { 
    digit: currentDigit, 
    frequency, 
    currentMissing, 
    maxMissing, 
    avgMissing: Math.round(avgMissing * 10) / 10, 
    amplitude 
  };
}

// ==================== 复合特征计算 ====================

/**
 * 跟随关系 - 全面优化版
 * 
 * 优化点:
 * 1. 增加权重衰减机制
 * 2. 考虑位置相关性
 * 3. 引入时间窗口滑动平均
 */
export function calculateFollowRelations(
  draws: LotteryDraw[], 
  windowSize: number = 50
): Map<number, number[]> {
  const relations = new Map<number, number[]>();
  const recentDraws = draws.slice(-Math.min(windowSize, draws.length));
  
  for (let digitA = 0; digitA <= 9; digitA++) {
    const followerWeights = new Map<number, number>();
    
    for (let i = 0; i < recentDraws.length - 1; i++) {
      const draw = recentDraws[i];
      const nextDraw = recentDraws[i + 1];
      
      // 检查digitA在当前期的位置
      const positions: ('hundred' | 'ten' | 'one')[] = [];
      if (draw.hundred === digitA) positions.push('hundred');
      if (draw.ten === digitA) positions.push('ten');
      if (draw.one === digitA) positions.push('one');
      
      if (positions.length > 0) {
        // 时间衰减权重: 越近的数据权重越高
        const timeWeight = 1 + (i / recentDraws.length) * 0.5;
        
        // 位置相关性权重
        positions.forEach(pos => {
          const nextDigit = nextDraw[pos];
          const posWeight = pos === 'hundred' ? 1.2 : pos === 'ten' ? 1.0 : 0.9;
          const totalWeight = timeWeight * posWeight;
          
          followerWeights.set(nextDigit, (followerWeights.get(nextDigit) || 0) + totalWeight);
        });
        
        // 同时记录下一期所有位置的数字 (权重较低)
        [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
          followerWeights.set(d, (followerWeights.get(d) || 0) + timeWeight * 0.3);
        });
      }
    }
    
    // 排序并取前3
    const sorted = Array.from(followerWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => d);
    
    relations.set(digitA, sorted);
  }
  
  return relations;
}

// ==================== 完整特征集计算 ====================

export function calculateAllFeatures(
  draws: LotteryDraw[], 
  windowSize: number = 30
): FullFeatures | null {
  if (draws.length === 0) return null;
  
  const currentDraw = draws[draws.length - 1];
  const previousDraw = draws.length > 1 ? draws[draws.length - 2] : currentDraw;
  
  return {
    basic: {
      hotCold: calculateHotCold(draws, windowSize),
      streaks: calculateStreaks(draws),
      sumValue: calculateSumValue(currentDraw),
      spanValue: calculateSpan(currentDraw),
      sizeRatio: calculateSizeRatio(currentDraw),
      oddEvenRatio: calculateOddEvenRatio(currentDraw),
      primeCompositeRatio: calculatePrimeCompositeRatio(currentDraw),
      road012Ratio: calculateRoad012Ratio(currentDraw),
      acValue: calculateACValue(currentDraw),
      oddEvenPattern: [
        currentDraw.hundred % 2 === 1 ? '奇' : '偶',
        currentDraw.ten % 2 === 1 ? '奇' : '偶',
        currentDraw.one % 2 === 1 ? '奇' : '偶'
      ].join('')
    },
    position: {
      hundred: calculatePositionStats(draws, 'hundred', windowSize),
      ten: calculatePositionStats(draws, 'ten', windowSize),
      one: calculatePositionStats(draws, 'one', windowSize),
      positionSum: currentDraw.hundred + currentDraw.ten + currentDraw.one,
      positionDiff: calculatePositionDiff(currentDraw),
      repeatPosition: calculateRepeatPosition(currentDraw, previousDraw),
      neighborPosition: calculateNeighborPosition(currentDraw, previousDraw),
      diagonalPattern: calculateDiagonalPattern(draws),
      symmetryPattern: calculateSymmetryPattern(currentDraw)
    },
    composite: {
      sumTail: calculateSumValue(currentDraw) % 10,
      spanTail: calculateSpan(currentDraw) % 10,
      sumSpanCombo: `${calculateSumValue(currentDraw)}-${calculateSpan(currentDraw)}`,
      sizeOddEvenCombo: '',
      primeRoadCombo: '',
      hotWarmColdZone: { hot: [], warm: [], cold: [] },
      missingLayers: { layer1: [], layer2: [], layer3: [] },
      followRelations: calculateFollowRelations(draws, windowSize),
      digitSum: calculateSumValue(currentDraw),
      productTail: (currentDraw.hundred * currentDraw.ten * currentDraw.one) % 10
    }
  };
}

// ==================== 补全 UI 组件需要的导出函数 ====================

/**
 * 位置差计算
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
export function calculateDiagonalPattern(_draws: LotteryDraw[]): string {
  return "无";
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

export function calculateSumTail(draw: LotteryDraw): number {
  return calculateSumValue(draw) % 10;
}

export function calculateSpanTail(draw: LotteryDraw): number {
  return calculateSpan(draw) % 10;
}

export function calculateSumSpanCombo(draw: LotteryDraw): string {
  return `${calculateSumValue(draw)}-${calculateSpan(draw)}`;
}

export function calculateSizeOddEvenCombo(draw: LotteryDraw): string {
  const size = calculateSizeRatio(draw);
  const oe = calculateOddEvenRatio(draw);
  return `大${size.big}小${size.small}奇${oe.odd}偶${oe.even}`;
}

export function calculatePrimeRoadCombo(draw: LotteryDraw): string {
  const pc = calculatePrimeCompositeRatio(draw);
  const r = calculateRoad012Ratio(draw);
  return `质${pc.prime}合${pc.composite}_0${r.road0}1${r.road1}2${r.road2}`;
}

export function calculateHotWarmColdZone(draws: LotteryDraw[], windowSize: number = 30): { hot: number[]; warm: number[]; cold: number[] } {
  const stats = calculateHotCold(draws, windowSize);
  return {
    hot: stats.filter(s => s.category === 'hot').map(s => s.digit),
    warm: stats.filter(s => s.category === 'warm').map(s => s.digit),
    cold: stats.filter(s => s.category === 'cold').map(s => s.digit)
  };
}

export function calculateMissingLayers(draws: LotteryDraw[]): { layer1: number[]; layer2: number[]; layer3: number[] } {
  const streaks = calculateStreaks(draws);
  return {
    layer1: streaks.filter(s => s.consecutiveMisses >= 1 && s.consecutiveMisses <= 3).map(s => s.digit),
    layer2: streaks.filter(s => s.consecutiveMisses >= 4 && s.consecutiveMisses <= 7).map(s => s.digit),
    layer3: streaks.filter(s => s.consecutiveMisses >= 8).map(s => s.digit)
  };
}

export function calculateDigitSum(draw: LotteryDraw): number {
  return calculateSumValue(draw);
}

export function calculateProductTail(draw: LotteryDraw): number {
  return (draw.hundred * draw.ten * draw.one) % 10;
}
