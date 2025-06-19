import { HelpCircle, CheckCircle, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Questions",
      value: stats.totalQuestions,
      change: "+12%",
      changeLabel: "from last month",
      icon: HelpCircle,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600"
    },
    {
      title: "Active Questions", 
      value: stats.activeQuestions,
      change: "+8%",
      changeLabel: "from last month",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Reading Passages",
      value: stats.totalPassages,
      change: "+5%",
      changeLabel: "from last month", 
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Attempts",
      value: stats.totalAttempts,
      change: "+23%",
      changeLabel: "from last month",
      icon: TrendingUp,
      iconBg: "bg-yellow-100", 
      iconColor: "text-yellow-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-secondary-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-secondary-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-secondary-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-secondary-200 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-secondary-200 rounded-lg animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ title, value, change, changeLabel, icon: Icon, iconBg, iconColor }) => (
        <Card key={title} className="bg-white border border-secondary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{title}</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600 font-medium">{change}</span>
                  <span className="text-secondary-500 ml-1">{changeLabel}</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${iconColor} text-xl`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
