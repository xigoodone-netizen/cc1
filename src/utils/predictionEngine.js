import { calculateAllFeatures, calculateHotCold, calculatePositionStats, calculateFollowRelations, calculateStreaks } from './featureCalculator';
/**
 * 预测引擎 - 全面优化版
 *
 * 优化点:
 * 1. 引入马尔可夫链转移概率矩阵
 * 2. 增强时间序列周期性分析
 * 3. 多维度权重自适应调整
 * 4. 改进平滑归一化算法
 * 5. 增加遗漏值回补机制
 * 6. 优化冷热号动态阈值
 */
const FEATURE_WEIGHTS = {
    hotCold: 1.5, // 提升冷热号权重
    streaks: 1.2, // 提升连中连挂权重
    sumValue: 0.9,
    spanValue: 0.9,
    sizeRatio: 0.8,
    oddEvenRatio: 0.8,
    road012Ratio: 0.7,
    positionStats: 1.8, // 提升位置统计权重
    followRelations: 2.2, // 大幅提升跟随关系权重
    markovChain: 2.0, // 新增马尔可夫链权重
    missingValue: 1.6, // 新增遗漏值权重
    periodicPattern: 1.4 // 新增周期模式权重
};
/**
 * 核心归一化算法 - 改进版 Laplace Smoothing
 * 使用动态平滑因子,确保概率分布更合理
 */
function smoothNormalize(scores) {
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const scoreRange = maxScore - minScore;
    // 动态平滑因子: 分数差距越大,平滑越少
    const smoothFactor = scoreRange > 10 ? 0.5 : 1.5;
    const smoothedScores = scores.map(s => s + smoothFactor);
    const totalScore = smoothedScores.reduce((a, b) => a + b, 0);
    return smoothedScores.map((score, digit) => ({
        digit,
        score: Math.round(scores[digit] * 10) / 10,
        probability: Math.round((score / totalScore) * 100)
    })).sort((a, b) => b.score - a.score);
}
/**
 * 新增: 马尔可夫链转移概率矩阵
 * 计算从数字A到数字B的转移概率
 */
function buildMarkovTransitionMatrix(draws, position, windowSize = 50) {
    const matrix = new Map();
    const recentDraws = draws.slice(-windowSize);
    // 初始化矩阵
    for (let i = 0; i <= 9; i++) {
        matrix.set(i, new Map());
    }
    // 统计转移频次
    for (let i = 0; i < recentDraws.length - 1; i++) {
        const current = recentDraws[i][position];
        const next = recentDraws[i + 1][position];
        const transitions = matrix.get(current);
        transitions.set(next, (transitions.get(next) || 0) + 1);
    }
    // 转换为概率 (添加平滑)
    matrix.forEach((transitions) => {
        const total = Array.from(transitions.values()).reduce((a, b) => a + b, 0);
        if (total > 0) {
            transitions.forEach((count, to) => {
                transitions.set(to, (count + 0.1) / (total + 1)); // Laplace平滑
            });
        }
    });
    return matrix;
}
/**
 * 新增: 遗漏值分析
 * 计算每个数字的遗漏期数,遗漏越久权重越高
 */
function calculateMissingWeights(draws, position) {
    const weights = new Map();
    for (let digit = 0; digit <= 9; digit++) {
        let missing = 0;
        for (let i = draws.length - 1; i >= 0; i--) {
            if (draws[i][position] === digit)
                break;
            missing++;
        }
        // 遗漏权重公式: 遗漏期数越多,权重越高,但有上限
        const weight = Math.min(missing * 0.3, 8);
        weights.set(digit, weight);
    }
    return weights;
}
/**
 * 新增: 周期性模式识别
 * 检测数字出现的周期性规律
 */
function detectPeriodicPattern(draws, position, digit) {
    const appearances = [];
    // 记录该数字每次出现的位置
    draws.forEach((draw, index) => {
        if (draw[position] === digit) {
            appearances.push(index);
        }
    });
    if (appearances.length < 3)
        return 0;
    // 计算间隔
    const intervals = [];
    for (let i = 1; i < appearances.length; i++) {
        intervals.push(appearances[i] - appearances[i - 1]);
    }
    // 检测是否有稳定周期
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    // 周期稳定性评分: 标准差越小,周期性越强
    const stability = Math.max(0, 5 - stdDev);
    // 计算当前遗漏是否接近周期
    const lastAppearance = appearances[appearances.length - 1];
    const currentMissing = draws.length - 1 - lastAppearance;
    const cycleDiff = Math.abs(currentMissing - avgInterval);
    // 如果当前遗漏接近平均周期,返回高权重
    if (cycleDiff <= 2 && stability > 2) {
        return stability * 1.5;
    }
    return 0;
}
/**
 * 新增: 连号趋势分析
 * 分析数字是否有连续递增/递减趋势
 */
function analyzeTrendPattern(draws, position) {
    const weights = new Map();
    if (draws.length < 3) {
        for (let i = 0; i <= 9; i++)
            weights.set(i, 0);
        return weights;
    }
    const recent = draws.slice(-3).map(d => d[position]);
    // 检测递增趋势
    if (recent[1] === recent[0] + 1 && recent[2] === recent[1] + 1) {
        const next = (recent[2] + 1) % 10;
        weights.set(next, 3);
    }
    // 检测递减趋势
    if (recent[1] === recent[0] - 1 && recent[2] === recent[1] - 1) {
        const next = (recent[2] - 1 + 10) % 10;
        weights.set(next, 3);
    }
    // 检测波动趋势 (上-下-上 或 下-上-下)
    if (recent[1] > recent[0] && recent[2] < recent[1]) {
        const candidates = [recent[2] + 1, recent[2] + 2].map(n => n % 10);
        candidates.forEach(c => weights.set(c, 1.5));
    }
    if (recent[1] < recent[0] && recent[2] > recent[1]) {
        const candidates = [recent[2] - 1, recent[2] - 2].map(n => (n + 10) % 10);
        candidates.forEach(c => weights.set(c, 1.5));
    }
    return weights;
}
/**
 * 生成预测结果 - 全面优化版
 */
export function generatePrediction(draws, windowSize = 30) {
    if (draws.length < 5) {
        return null;
    }
    // 1. 计算当前特征
    const currentFeatures = calculateAllFeatures(draws, windowSize);
    if (!currentFeatures)
        return null;
    const patternMatches = [];
    const historicalData = draws.slice(0, -1);
    // 2. 冷热号模式匹配 (优化版)
    const hotColdStats = currentFeatures.basic.hotCold;
    const hotDigits = hotColdStats.filter(h => h.category === 'hot').map(h => h.digit);
    const coldDigits = hotColdStats.filter(h => h.category === 'cold').map(h => h.digit);
    const hotColdNextDigits = new Map();
    const searchWindow = Math.min(windowSize, historicalData.length - 1);
    if (searchWindow > 0) {
        for (let i = searchWindow; i < historicalData.length; i++) {
            const historicalWindow = historicalData.slice(i - searchWindow, i);
            const histHotCold = calculateHotCold(historicalWindow, searchWindow);
            const histHotDigits = histHotCold.filter(h => h.category === 'hot').map(h => h.digit);
            const similarity = calculateArraySimilarity(hotDigits, histHotDigits);
            if (similarity >= 0.5) {
                const nextDraw = historicalData[i];
                if (nextDraw) {
                    [nextDraw.hundred, nextDraw.ten, nextDraw.one].forEach(d => {
                        hotColdNextDigits.set(d, (hotColdNextDigits.get(d) || 0) + similarity * 1.5);
                    });
                }
            }
        }
    }
    // 冷号回补机制: 冷号也给予一定权重
    coldDigits.forEach(d => {
        hotColdNextDigits.set(d, (hotColdNextDigits.get(d) || 0) + 0.8);
    });
    patternMatches.push({
        featureName: '冷热号模式',
        matchedCount: hotColdNextDigits.size,
        nextDigits: hotColdNextDigits,
        confidence: FEATURE_WEIGHTS.hotCold
    });
    // 3. 跟随关系模式 (优化版)
    const lastDraw = draws[draws.length - 1];
    const relations = calculateFollowRelations(draws, Math.min(80, draws.length));
    const followNextDigits = new Map();
    [lastDraw.hundred, lastDraw.ten, lastDraw.one].forEach(d => {
        const followers = relations.get(d) || [];
        followers.forEach((f, index) => {
            const weight = 4 - index; // 权重递减
            followNextDigits.set(f, (followNextDigits.get(f) || 0) + weight);
        });
    });
    patternMatches.push({
        featureName: '跟随关系模式',
        matchedCount: followNextDigits.size,
        nextDigits: followNextDigits,
        confidence: FEATURE_WEIGHTS.followRelations
    });
    // 4. 新增: 连中连挂模式
    const streaks = calculateStreaks(draws);
    const streakNextDigits = new Map();
    streaks.forEach(s => {
        // 连挂多期的数字,给予回补权重
        if (s.consecutiveMisses >= 5) {
            streakNextDigits.set(s.digit, s.consecutiveMisses * 0.4);
        }
        // 连中多期的数字,降低权重
        if (s.consecutiveHits >= 3) {
            streakNextDigits.set(s.digit, -s.consecutiveHits * 0.3);
        }
    });
    patternMatches.push({
        featureName: '连中连挂模式',
        matchedCount: streakNextDigits.size,
        nextDigits: streakNextDigits,
        confidence: FEATURE_WEIGHTS.streaks
    });
    // 5. 综合评分 - 初始化
    const hundredScores = new Array(10).fill(0);
    const tenScores = new Array(10).fill(0);
    const oneScores = new Array(10).fill(0);
    // 应用模式匹配权重
    patternMatches.forEach(match => {
        match.nextDigits.forEach((weight, digit) => {
            const score = weight * match.confidence;
            hundredScores[digit] += score * 0.35;
            tenScores[digit] += score * 0.35;
            oneScores[digit] += score * 0.30;
        });
    });
    // 6. 新增: 马尔可夫链转移概率
    const hundredMarkov = buildMarkovTransitionMatrix(draws, 'hundred', Math.min(60, draws.length));
    const tenMarkov = buildMarkovTransitionMatrix(draws, 'ten', Math.min(60, draws.length));
    const oneMarkov = buildMarkovTransitionMatrix(draws, 'one', Math.min(60, draws.length));
    const hundredTransitions = hundredMarkov.get(lastDraw.hundred) || new Map();
    const tenTransitions = tenMarkov.get(lastDraw.ten) || new Map();
    const oneTransitions = oneMarkov.get(lastDraw.one) || new Map();
    hundredTransitions.forEach((prob, digit) => {
        hundredScores[digit] += prob * FEATURE_WEIGHTS.markovChain * 10;
    });
    tenTransitions.forEach((prob, digit) => {
        tenScores[digit] += prob * FEATURE_WEIGHTS.markovChain * 10;
    });
    oneTransitions.forEach((prob, digit) => {
        oneScores[digit] += prob * FEATURE_WEIGHTS.markovChain * 10;
    });
    // 7. 新增: 遗漏值权重
    const hundredMissing = calculateMissingWeights(draws, 'hundred');
    const tenMissing = calculateMissingWeights(draws, 'ten');
    const oneMissing = calculateMissingWeights(draws, 'one');
    hundredMissing.forEach((weight, digit) => {
        hundredScores[digit] += weight * FEATURE_WEIGHTS.missingValue;
    });
    tenMissing.forEach((weight, digit) => {
        tenScores[digit] += weight * FEATURE_WEIGHTS.missingValue;
    });
    oneMissing.forEach((weight, digit) => {
        oneScores[digit] += weight * FEATURE_WEIGHTS.missingValue;
    });
    // 8. 新增: 周期性模式
    for (let digit = 0; digit <= 9; digit++) {
        const hundredPeriodic = detectPeriodicPattern(draws, 'hundred', digit);
        const tenPeriodic = detectPeriodicPattern(draws, 'ten', digit);
        const onePeriodic = detectPeriodicPattern(draws, 'one', digit);
        hundredScores[digit] += hundredPeriodic * FEATURE_WEIGHTS.periodicPattern;
        tenScores[digit] += tenPeriodic * FEATURE_WEIGHTS.periodicPattern;
        oneScores[digit] += onePeriodic * FEATURE_WEIGHTS.periodicPattern;
    }
    // 9. 新增: 趋势分析
    const hundredTrend = analyzeTrendPattern(draws, 'hundred');
    const tenTrend = analyzeTrendPattern(draws, 'ten');
    const oneTrend = analyzeTrendPattern(draws, 'one');
    hundredTrend.forEach((weight, digit) => {
        hundredScores[digit] += weight * 1.2;
    });
    tenTrend.forEach((weight, digit) => {
        tenScores[digit] += weight * 1.2;
    });
    oneTrend.forEach((weight, digit) => {
        oneScores[digit] += weight * 1.2;
    });
    // 10. 位置振幅修正 (保持原有逻辑)
    ['hundred', 'ten', 'one'].forEach((pos, idx) => {
        const stats = calculatePositionStats(draws, pos, windowSize);
        const scores = idx === 0 ? hundredScores : idx === 1 ? tenScores : oneScores;
        const currentDigit = stats.digit;
        if (stats.amplitude >= 5) {
            // 大振幅: 倾向于回归或继续大跳
            [(currentDigit + 1) % 10, (currentDigit + 9) % 10, currentDigit].forEach(d => scores[d] += 2.5);
        }
        else {
            // 小振幅: 倾向于中等跳跃
            [(currentDigit + 4) % 10, (currentDigit + 6) % 10].forEach(d => scores[d] += 2);
        }
    });
    // 11. 生成结果
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
 * 辅助: 计算数组相似度 (Jaccard相似系数)
 */
function calculateArraySimilarity(arr1, arr2) {
    if (arr1.length === 0 && arr2.length === 0)
        return 1;
    const s1 = new Set(arr1);
    const s2 = new Set(arr2);
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    return intersection.size / union.size;
}
/**
 * 辅助: 计算整体置信度
 */
function calculateOverallConfidence(matches) {
    const validMatches = matches.filter(m => m.matchedCount > 0);
    if (validMatches.length === 0)
        return 0;
    const avgConf = validMatches.reduce((a, b) => a + b.confidence, 0) / validMatches.length;
    return Math.min(Math.round(avgConf * 35), 92);
}
/**
 * 辅助: 生成下一期期号
 */
function generateNextPeriod(current) {
    // 时间戳格式 (14位: YYYYMMDDHHmmss)
    if (current.length === 14 && /^\d+$/.test(current)) {
        const year = parseInt(current.slice(0, 4));
        const month = parseInt(current.slice(4, 6)) - 1;
        const day = parseInt(current.slice(6, 8));
        const hour = parseInt(current.slice(8, 10));
        const min = parseInt(current.slice(10, 12));
        const sec = parseInt(current.slice(12, 14));
        const date = new Date(year, month, day, hour, min, sec);
        date.setMinutes(date.getMinutes() + 1);
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }
    // 普通递增格式
    if (/^\d+$/.test(current)) {
        try {
            const next = BigInt(current) + 1n;
            return next.toString().padStart(current.length, '0');
        }
        catch (e) {
            return (parseInt(current) + 1).toString().padStart(current.length, '0');
        }
    }
    return current + '_next';
}
/**
 * 验证预测结果
 */
export function validatePrediction(prediction, actual, count = 3) {
    const hRank = prediction.hundred.findIndex(d => d.digit === actual.hundred) + 1;
    const tRank = prediction.ten.findIndex(d => d.digit === actual.ten) + 1;
    const oRank = prediction.one.findIndex(d => d.digit === actual.one) + 1;
    return {
        hundredHit: hRank <= count,
        tenHit: tRank <= count,
        oneHit: oRank <= count,
        hundredRank: hRank,
        tenRank: tRank,
        oneRank: oRank
    };
}
