import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import type { StatisticsSummary } from '@/types/lottery';

interface DataOverviewProps {
  stats: StatisticsSummary;
  latestPeriod?: string;
}

export function DataOverview({ stats, latestPeriod }: DataOverviewProps) {
  const items = [
    {
      icon: Calendar,
      label: '总期数',
      value: stats.totalDraws.toString(),
      color: 'from-blue-500 to-blue-700',
      iconColor: 'text-blue-400'
    },
    {
      icon: TrendingUp,
      label: '最新期号',
      value: latestPeriod || '-',
      color: 'from-green-500 to-green-700',
      iconColor: 'text-green-400'
    },
    {
      icon: Target,
      label: '预测准确率',
      value: `${stats.overallAccuracy}%`,
      color: 'from-amber-500 to-amber-700',
      iconColor: 'text-amber-400'
    },
    {
      icon: Zap,
      label: '连续命中',
      value: stats.currentStreak.toString(),
      color: 'from-purple-500 to-purple-700',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                <p className="text-3xl font-bold text-white font-mono">
                  {item.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                <item.icon className={`w-6 h-6 text-white`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
