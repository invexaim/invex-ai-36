
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PaymentGSTSectionProps {
  gstNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLookup: () => void;
  error: boolean;
  isLoading: boolean;
}

const PaymentGSTSection = ({ 
  gstNumber, 
  onChange, 
  onLookup, 
  error, 
  isLoading 
}: PaymentGSTSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
      <div className="flex gap-2">
        <Input
          id="gstNumber"
          name="gstNumber"
          value={gstNumber}
          onChange={onChange}
          placeholder="Enter GST number (e.g., 27AABCU9603R1ZX)"
          className={error ? "border-red-500" : ""}
          maxLength={15}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onLookup}
          disabled={isLoading || !gstNumber}
          className="px-3"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500">Invalid GST number format</p>
      )}
    </div>
  );
};

export default PaymentGSTSection;
