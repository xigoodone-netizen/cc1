// 简化测试脚本，直接在 JS 环境运行以规避复杂的 TS 路径配置
const { generatePrediction } = require('./src/utils/predictionEngine');

const mockDraws = [
  { id: '1', period: '2026020101', hundred: 1, ten: 2, one: 3 },
  { id: '2', period: '2026020102', hundred: 2, ten: 3, one: 4 },
  { id: '3', period: '2026020103', hundred: 3, ten: 4, one: 5 },
  { id: '4', period: '2026020104', hundred: 4, ten: 5, one: 6 },
  { id: '5', period: '2026020105', hundred: 5, ten: 6, one: 7 },
  { id: '6', period: '2026020106', hundred: 6, ten: 7, one: 8 },
  { id: '7', period: '2026020107', hundred: 7, ten: 8, one: 9 },
  { id: '8', period: '2026020108', hundred: 8, ten: 9, one: 0 },
  { id: '9', period: '2026020109', hundred: 9, ten: 0, one: 1 },
  { id: '10', period: '2026020110', hundred: 0, ten: 1, one: 2 },
];

function test() {
  console.log('--- 启动预测引擎逻辑自检 (JS) ---');
  try {
    const prediction = generatePrediction(mockDraws, 10);
    if (!prediction) {
      console.log('预测引擎返回空结果（可能是数据量不足）');
      return;
    }
    
    console.log('✅ 基础预测生成成功');
    console.log('百位首选:', prediction.hundred[0].digit, '概率:', prediction.hundred[0].probability + '%');
    console.log('十位首选:', prediction.ten[0].digit, '概率:', prediction.ten[0].probability + '%');
    console.log('个位首选:', prediction.one[0].digit, '概率:', prediction.one[0].probability + '%');
    
    const totalProb = prediction.hundred.reduce((s, d) => s + d.probability, 0);
    console.log('归一化检查 (百位总概率):', totalProb + '%');
    
    console.log('--- 自检完成 ---');
  } catch (e) {
    console.log('测试运行出错:', e.message);
  }
}

test();
