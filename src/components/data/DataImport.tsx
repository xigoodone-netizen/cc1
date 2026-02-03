import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, Trash2, FileDown, Database } from 'lucide-react';
import { toast } from 'sonner';
import type { LotteryDraw } from '@/types/lottery';

interface DataImportProps {
  draws: LotteryDraw[];
  onImport: (data: string) => { success: boolean; message: string };
  onAdd: (period: string, hundred: number, ten: number, one: number) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onGenerateSample: () => void;
}

export function DataImport({ 
  draws, 
  onImport, 
  onAdd, 
  onDelete, 
  onClear,
  onGenerateSample 
}: DataImportProps) {
  const [inputData, setInputData] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');
  const [newHundred, setNewHundred] = useState('');
  const [newTen, setNewTen] = useState('');
  const [newOne, setNewOne] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!inputData.trim()) {
      toast.error('请输入数据');
      return;
    }
    const result = onImport(inputData);
    if (result.success) {
      toast.success(result.message);
      setInputData('');
    } else {
      toast.error(result.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputData(content);
      toast.success('文件已读取，请点击导入');
    };
    reader.readAsText(file);
  };

  const handleAdd = () => {
    const h = parseInt(newHundred);
    const t = parseInt(newTen);
    const o = parseInt(newOne);
    
    if (!newPeriod || isNaN(h) || isNaN(t) || isNaN(o)) {
      toast.error('请填写完整信息');
      return;
    }
    
    if (h < 0 || h > 9 || t < 0 || t > 9 || o < 0 || o > 9) {
      toast.error('数字必须在0-9之间');
      return;
    }
    
    onAdd(newPeriod, h, t, o);
    toast.success('添加成功');
    setNewPeriod('');
    setNewHundred('');
    setNewTen('');
    setNewOne('');
    setShowAddForm(false);
  };

  const exportData = () => {
    const data = draws.map(d => `${d.period}\t${d.hundred}\t${d.ten}\t${d.one}`).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lottery_data.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  return (
    <div className="space-y-6">
      {/* 数据导入区域 */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            数据导入
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="file"
              accept=".txt,.csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              选择文件
            </Button>
            <Button
              variant="outline"
              onClick={exportData}
              disabled={draws.length === 0}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FileDown className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button
              variant="outline"
              onClick={onGenerateSample}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Database className="w-4 h-4 mr-2" />
              生成示例
            </Button>
          </div>
          
          <Textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={`格式：期号 百位 十位 个位（每行一条）
例如：
20240101001 3 5 7
20240101002 1 8 4
20240101003 9 2 6`}
            className="min-h-[150px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            >
              导入数据
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              单条添加
            </Button>
          </div>
          
          {showAddForm && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-gray-300">期号</Label>
                  <Input
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    placeholder="如: 20240101"
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">百位</Label>
                  <Input
                    value={newHundred}
                    onChange={(e) => setNewHundred(e.target.value)}
                    placeholder="0-9"
                    maxLength={1}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">十位</Label>
                  <Input
                    value={newTen}
                    onChange={(e) => setNewTen(e.target.value)}
                    placeholder="0-9"
                    maxLength={1}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">个位</Label>
                  <Input
                    value={newOne}
                    onChange={(e) => setNewOne(e.target.value)}
                    placeholder="0-9"
                    maxLength={1}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
              >
                确认添加
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史数据列表 */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            历史数据
            <span className="text-sm font-normal text-gray-400">
              (共 {draws.length} 期)
            </span>
          </CardTitle>
          {draws.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onClear}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left p-2">期号</th>
                  <th className="text-center p-2">百位</th>
                  <th className="text-center p-2">十位</th>
                  <th className="text-center p-2">个位</th>
                  <th className="text-center p-2">和值</th>
                  <th className="text-center p-2">跨度</th>
                  <th className="text-center p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {[...draws].reverse().slice(0, 50).map((draw) => (
                  <tr
                    key={draw.id}
                    className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-2 text-gray-300">{draw.period}</td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold">
                        {draw.hundred}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-mono font-bold">
                        {draw.ten}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                        {draw.one}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-400 font-mono">
                      {draw.hundred + draw.ten + draw.one}
                    </td>
                    <td className="p-2 text-center text-gray-400 font-mono">
                      {Math.max(draw.hundred, draw.ten, draw.one) - Math.min(draw.hundred, draw.ten, draw.one)}
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(draw.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {draws.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无数据，请导入或生成示例数据
              </div>
            )}
            {draws.length > 50 && (
              <div className="text-center py-2 text-gray-500 text-sm">
                仅显示最近50期，共{draws.length}期
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
