
import { Product } from "@/types";

export interface PredictionData {
  date: string;
  product_id: number;
  current_stock: number;
  previous_sales: number;
  price: number;
  custom_product: string;
  is_custom_product: boolean;
}

export interface StockPredictorProps {
  products: Product[];
}

export interface PredictionFormProps {
  predictionData: PredictionData;
  setPredictionData: React.Dispatch<React.SetStateAction<PredictionData>>;
  products: Product[];
}

// Renamed from FormSectionProps to match what's used in PredictionForm.tsx
export interface FormSectionProps {
  predictionData: PredictionData;
  setPredictionData: React.Dispatch<React.SetStateAction<PredictionData>>;
  products: Product[];
}

export interface FileUploadSectionProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export interface ResultSectionProps {
  predictionResult: string | null;
  aiAnalysis: boolean;
  restockDate: Date;
  reviewDate: Date;
  nextAnalysisDate: Date;
  predictionData?: PredictionData;
  ref?: React.Ref<HTMLDivElement>;
}
