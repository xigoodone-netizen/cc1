import { generatePrediction } from './src/utils/predictionEngine';
// 模拟历史数据
const mockDraws = [
    { id: '1', period: '2026020101', hundred: 1, ten: 2, one: 3, timestamp: Date.now() },
    { id: '2', period: '2026020102', hundred: 2, ten: 3, one: 4, timestamp: Date.now() },
    { id: '3', period: '2026020103', hundred: 3, ten: 4, one: 5, timestamp: Date.now() },
    { id: '4', period: '2026020104', hundred: 4, ten: 5, one: 6, timestamp: Date.now() },
    { id: '5', period: '2026020105', hundred: 5, ten: 6, one: 7, timestamp: Date.now() },
    { id: '6', period: '2026020106', hundred: 6, ten: 7, one: 8, timestamp: Date.now() },
    { id: '7', period: '2026020107', hundred: 7, ten: 8, one: 9, timestamp: Date.now() },
    { id: '8', period: '2026020108', hundred: 8, ten: 9, one: 0, timestamp: Date.now() },
    { id: '9', period: '2026020109', hundred: 9, ten: 0, one: 1, timestamp: Date.now() },
    { id: '10', period: '2026020110', hundred: 0, ten: 1, one: 2, timestamp: Date.now() },
];
function testPredictionLogic() {
    console.log('--- 启动预测引擎逻辑自检 ---');
    // 1. 检查预测输出格式
    const prediction = generatePrediction(mockDraws, 10);
    if (!prediction) {
        console.error('❌ 错误: 预测引擎未能生成结果');
        return;
    }
    console.log('✅ 基础输出格式检查通过');
    // 2. 检查趋势分析逻辑 (1-2-3-4-5... 应该预测下一个数字)
    const lastHundred = mockDraws[mockDraws.length - 1].hundred;
    const predictedHundred = prediction.hundred[0].digit;
    console.log(`[趋势测试] 最后一期百位: ${lastHundred}, 预测下一期百位首选: ${predictedHundred}`);
    // 3. 检查马尔可夫链转移 (0后面经常跟1, 1后面跟2...)
    const tenTransitions = prediction.ten.slice(0, 3).map(d => d.digit);
    console.log(`[马尔可夫测试] 十位转移推荐: ${tenTransitions.join(', ')}`);
    // 4. 检查概率归一化
    const totalProb = prediction.hundred.reduce((sum, d) => sum + d.probability, 0);
    console.log(`[归一化测试] 百位总概率和: ${totalProb}%`);
    if (totalProb < 95 || totalProb > 105) {
        console.error('❌ 警告: 概率归一化偏差过大');
    }
    else {
        console.log('✅ 概率归一化检查通过');
    }
    console.log('--- 逻辑自检完成 ---');
}
testPredictionLogic();
