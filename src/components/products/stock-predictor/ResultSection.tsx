
import React from "react";
import { Dices, Calendar, TrendingUp, Package } from "lucide-react";
import { PredictionData } from "./types";

interface ResultSectionProps {
  predictionResult: string | null;
  aiAnalysis: boolean;
  restockDate: Date;
  reviewDate: Date;
  nextAnalysisDate: Date;
  predictionData: PredictionData;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  predictionResult,
  aiAnalysis,
  restockDate,
  reviewDate,
  nextAnalysisDate,
  predictionData,
}) => {
  if (!predictionResult && !aiAnalysis) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format prediction dates if available
  const predictionPeriod = predictionData.start_date && predictionData.end_date
    ? `${new Date(predictionData.start_date).toLocaleDateString()} - ${new Date(predictionData.end_date).toLocaleDateString()}`
    : "Next 30 days";

  return (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Dices className="mr-2 h-5 w-5 text-primary" />
        Prediction Results
      </h3>

      {predictionResult && (
        <div className="bg-primary/5 p-6 rounded-lg mb-6 border border-primary/10">
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-primary" />
            Sales Forecast for {predictionPeriod}
          </h4>
          <p className="text-muted-foreground">{predictionResult}</p>
        </div>
      )}

      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center mb-2">
              <Package className="h-4 w-4 text-yellow-500 mr-2" />
              <h4 className="font-medium">Restock By</h4>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(restockDate)}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <h4 className="font-medium">Review Strategy</h4>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(reviewDate)}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="font-medium">Next Analysis</h4>
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(nextAnalysisDate)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
