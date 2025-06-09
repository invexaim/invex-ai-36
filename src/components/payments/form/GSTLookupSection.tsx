
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { lookupGSTDetails, validateGSTNumber } from "@/services/gstService";
import { toast } from "sonner";

interface GSTLookupSectionProps {
  gstNumber: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGSTDetailsUpdate: (details: {
    companyName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => void;
  error: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GSTLookupSection = ({ 
  gstNumber,
  companyName,
  address,
  city,
  state,
  pincode,
  onChange, 
  onGSTDetailsUpdate,
  error, 
  isLoading,
  setIsLoading
}: GSTLookupSectionProps) => {
  const handleGSTLookup = async () => {
    if (!gstNumber.trim()) {
      toast.error("Please enter a GST number");
      return;
    }

    if (!validateGSTNumber(gstNumber)) {
      toast.error("Invalid GST number format");
      return;
    }

    setIsLoading(true);
    try {
      const gstDetails = await lookupGSTDetails(gstNumber);
      
      if (gstDetails) {
        onGSTDetailsUpdate({
          companyName: gstDetails.companyName,
          address: gstDetails.address,
          city: gstDetails.city,
          state: gstDetails.state,
          pincode: gstDetails.pincode
        });
        toast.success("GST details retrieved successfully");
      } else {
        toast.error("GST number not found in database");
      }
    } catch (error) {
      toast.error("Failed to retrieve GST details");
    } finally {
      setIsLoading(false);
    }
  };

  const hasGSTData = companyName || address || city || state || pincode;

  return (
    <div className="space-y-4">
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
            onClick={handleGSTLookup}
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

      {hasGSTData && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Registered Address</Label>
              <Input
                value={address}
                placeholder="Address"
                readOnly
                className="bg-white border-gray-200"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={city}
                  placeholder="City"
                  readOnly
                  className="bg-white border-gray-200"
                />
                <Input
                  value={pincode}
                  placeholder="Pincode"
                  readOnly
                  className="bg-white border-gray-200"
                />
              </div>
              <Input
                value={state}
                placeholder="State"
                readOnly
                className="bg-white border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Company Name</Label>
              <Input
                value={companyName}
                placeholder="Company Name"
                readOnly
                className="bg-white border-gray-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTLookupSection;
