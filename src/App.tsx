import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { 
  Database, 
  BarChart3, 
  MapPin, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Grid3X3,
  Settings,
  Trash2
} from 'lucide-react';

import { useLotteryData } from '@/hooks/useLotteryData';
import { DataOverview } from '@/components/data/DataOverview';
import { DataImport } from '@/components/data/DataImport';
import { BasicFeatures } from '@/components/features/BasicFeatures';
import { PositionFeatures } from '@/components/features/PositionFeatures';
import { CompositeFeatures } from '@/components/features/CompositeFeatures';
import { FeatureMatrix } from '@/components/features/FeatureMatrix';
import { PredictionCenter } from '@/components/prediction/PredictionCenter';
import { StatisticsValidation } from '@/components/statistics/StatisticsValidation';

function App() {
  const [activeTab, setActiveTab] = useState('data');
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    draws,
    predictions,
    validations,
    windowSize,
    currentPrediction,
    setWindowSize,
    importData,
    addDraw,
    deleteDraw,
    clearData,
    generateNewPrediction,
    getStatistics,
    generateSampleData
  } = useLotteryData();

  const stats = getStatistics();
  const latestPeriod = draws.length > 0 ? draws[draws.length - 1].period : undefined;

  const handleGenerateSample = () => {
    generateSampleData();
    toast.success('已生成100期示例数据');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  彩票数据分析预测系统
                </h1>
                <p className="text-xs text-gray-500">30维特征 · 智能预测 · 统计验证</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <Database className="w-4 h-4" />
                <span>{draws.length} 期数据</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <label className="text-gray-400 text-sm mb-2 block">
                  统计窗口大小: <span className="text-white font-mono">{windowSize}</span> 期
                </label>
                <Slider
                  value={[windowSize]}
                  onValueChange={(value) => setWindowSize(value[0])}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full md:w-64"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSample}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Database className="w-4 h-4 mr-2" />
                  生成示例数据
                </Button>
                {draws.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空数据
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Data Overview */}
        <div className="mb-6">
          <DataOverview stats={stats} latestPeriod={latestPeriod} />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800 p-1 flex flex-wrap gap-1">
            <TabsTrigger 
              value="data" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              数据管理
            </TabsTrigger>
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              基础特征
            </TabsTrigger>
            <TabsTrigger 
              value="position" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              位置特征
            </TabsTrigger>
            <TabsTrigger 
              value="composite" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Layers className="w-4 h-4 mr-2" />
              复合特征
            </TabsTrigger>
            <TabsTrigger 
              value="matrix" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              特征矩阵
            </TabsTrigger>
            <TabsTrigger 
              value="prediction" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              预测中心
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              统计验证
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-0">
            <DataImport
              draws={draws}
              onImport={importData}
              onAdd={addDraw}
              onDelete={deleteDraw}
              onClear={clearData}
              onGenerateSample={handleGenerateSample}
            />
          </TabsContent>

          <TabsContent value="basic" className="mt-0">
            <BasicFeatures draws={draws} windowSize={windowSize} />
          </TabsContent>

          <TabsContent value="position" className="mt-0">
            <PositionFeatures draws={draws} windowSize={windowSize} />
          </TabsContent>

          <TabsContent value="composite" className="mt-0">
            <CompositeFeatures draws={draws} windowSize={windowSize} />
          </TabsContent>

          <TabsContent value="matrix" className="mt-0">
            <FeatureMatrix draws={draws} windowSize={windowSize} />
          </TabsContent>

          <TabsContent value="prediction" className="mt-0">
            <PredictionCenter
              draws={draws}
              windowSize={windowSize}
              currentPrediction={currentPrediction}
              onGeneratePrediction={generateNewPrediction}
            />
          </TabsContent>

          <TabsContent value="statistics" className="mt-0">
            <StatisticsValidation stats={stats} validations={validations} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              <p>彩票数据分析预测系统 - 基于30维特征的智能分析工具</p>
              <p className="text-xs mt-1">
                本工具仅供学习研究使用，不构成任何投注建议
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>数据期数: <Badge variant="outline" className="ml-1">{draws.length}</Badge></span>
              <span>预测次数: <Badge variant="outline" className="ml-1">{predictions.length}</Badge></span>
              <span>验证记录: <Badge variant="outline" className="ml-1">{validations.length}</Badge></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
