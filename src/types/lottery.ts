// 彩票数据类型定义

// 基础开奖数据
export interface LotteryDraw {
  id: string;
  period: string;      // 期号
  hundred: number;     // 百位 0-9
  ten: number;         // 十位 0-9
  one: number;         // 个位 0-9
  drawDate?: string;   // 开奖日期
}

// 预测记录
export interface PredictionRecord {
  id: string;
  period: string;           // 预测期号
  predictedAt: string;      // 预测时间
  windowSize: number;       // 统计窗口
  hundredRanking: number[]; // 百位排序 0-9
  tenRanking: number[];     // 十位排序 0-9
  oneRanking: number[];     // 个位排序 0-9
  confidence: number;       // 置信度 0-100
}

// 验证记录
export interface ValidationRecord {
  id: string;
  period: string;           // 期号
  prediction: PredictionRecord;
  actualHundred: number;
  actualTen: number;
  actualOne: number;
  hundredHit: boolean;
  tenHit: boolean;
  oneHit: boolean;
  hundredRank: number;      // 实际百位在预测中的排名 1-10
  tenRank: number;          // 实际十位在预测中的排名
  oneRank: number;          // 实际个位在预测中的排名
  validatedAt: string;
}

// 冷热号统计
export interface HotColdStats {
  digit: number;           // 数字 0-9
  frequency: number;       // 出现频次
  category: 'hot' | 'warm' | 'cold';  // 热/温/冷
}

// 连中连挂统计
export interface StreakStats {
  digit: number;
  consecutiveHits: number;   // 连续出现期数
  consecutiveMisses: number; // 连续未出现期数
  currentStreak: 'hit' | 'miss' | 'none';
}

// 位置统计
export interface PositionStats {
  digit: number;
  frequency: number;
  currentMissing: number;    // 当前遗漏
  maxMissing: number;        // 最大遗漏
  avgMissing: number;        // 平均遗漏
  amplitude: number;         // 振幅
}

// 基础特征
export interface BasicFeatures {
  hotCold: HotColdStats[];           // 冷热号
  streaks: StreakStats[];            // 连中连挂
  sumValue: number;                  // 和值
  spanValue: number;                 // 跨度
  sizeRatio: { big: number; small: number };  // 大小比
  oddEvenRatio: { odd: number; even: number }; // 单双比
  primeCompositeRatio: { prime: number; composite: number }; // 质合比
  road012Ratio: { road0: number; road1: number; road2: number }; // 012路比
  acValue: number;                   // AC值
  oddEvenPattern: string;            // 奇偶模式
}

// 位置特征
export interface PositionFeatures {
  hundred: PositionStats;
  ten: PositionStats;
  one: PositionStats;
  positionSum: number;      // 位置和
  positionDiff: { ht: number; to: number; ho: number }; // 位置差
  repeatPosition: boolean[]; // 重号位置
  neighborPosition: boolean[]; // 邻号位置
  diagonalPattern: string;   // 斜连模式
  symmetryPattern: string;   // 对称模式
}

// 复合特征
export interface CompositeFeatures {
  sumTail: number;           // 和值尾
  spanTail: number;          // 跨度尾
  sumSpanCombo: string;      // 和跨组合
  sizeOddEvenCombo: string;  // 大小单双组合
  primeRoadCombo: string;    // 质合012路组合
  hotWarmColdZone: { hot: number[]; warm: number[]; cold: number[] };
  missingLayers: { layer1: number[]; layer2: number[]; layer3: number[] };
  followRelations: Map<number, number[]>; // 跟随关系
  digitSum: number;          // 数字和
  productTail: number;       // 乘积尾
}

// 完整特征集
export interface FullFeatures {
  basic: BasicFeatures;
  position: PositionFeatures;
  composite: CompositeFeatures;
}

// 模式匹配结果
export interface PatternMatch {
  featureName: string;
  matchedCount: number;      // 匹配到的历史案例数
  nextDigits: Map<number, number>; // 下期各数字出现次数
  confidence: number;        // 该特征的置信度
}

// 预测结果
export interface PredictionResult {
  period: string;
  windowSize: number;
  hundred: { digit: number; score: number; probability: number }[];
  ten: { digit: number; score: number; probability: number }[];
  one: { digit: number; score: number; probability: number }[];
  combined: { digits: number[]; score: number }[];
  overallConfidence: number;
  patternMatches: PatternMatch[];
  generatedAt: string;
}

// 统计摘要
export interface StatisticsSummary {
  totalDraws: number;
  totalPredictions: number;
  overallAccuracy: number;
  hundredAccuracy: number;
  tenAccuracy: number;
  oneAccuracy: number;
  currentStreak: number;
  maxStreak: number;
  recentAccuracy: number[];  // 近期准确率走势
}

// 应用状态
export interface AppState {
  draws: LotteryDraw[];
  predictions: PredictionRecord[];
  validations: ValidationRecord[];
  currentWindow: number;
  selectedFeatures: string[];
}
