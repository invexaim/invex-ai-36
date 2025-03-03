
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
    },
    {
      title: "Price Optimization",
      description: "Consider raising prices for 'Premium Desk Chair' by 5-7%. Market analysis shows customers are willing to pay more.",
      type: "success"
    },
    {
      title: "Supply Chain Alert",
      description: "Potential delays from your main supplier detected. Plan for a 10-15 day lead time increase in the next quarter.",
      type: "warning"
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
