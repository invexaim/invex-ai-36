
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { AIInsight } from "@/types";

export const InsightsSection = () => {
  const insights: AIInsight[] = [
    {
      title: "Stock Optimization",
      description: "Your inventory has 5 products below reorder levels. Consider restocking soon to avoid stockouts.",
      type: "warning"
    },
    {
      title: "Seasonal Trend",
      description: "Based on historical data, you may need to increase stock of 'Office Supplies' for the upcoming back-to-school season.",
      type: "info"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {insights.map((insight, index) => (
        <AIInsightCard key={index} insight={insight} />
      ))}
    </div>
  );
};
