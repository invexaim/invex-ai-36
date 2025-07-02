
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { lookupGSTDetails } from '@/services/gstService';

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
  disabled?: boolean;
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
  setIsLoading,
  disabled = false
}: GSTLookupSectionProps) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastLookedUpGST, setLastLookedUpGST] = useState<string>('');

  const handleGSTLookup = async () => {
    if (!gstNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter a GST number' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await lookupGSTDetails(gstNumber);
      
      if (result.success && result.data) {
        onGSTDetailsUpdate({
          companyName: result.data.companyName,
          address: result.data.address,
          city: result.data.city,
          state: result.data.state,
          pincode: result.data.pincode
        });
        setLastLookedUpGST(gstNumber);
        setMessage({ 
          type: 'success', 
          text: `Successfully retrieved details for ${result.data.companyName}` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to fetch GST details' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGSTLookup();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5" />
          GST Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="gst-number">GST Number</Label>
            <Input
              id="gst-number"
              name="gstNumber"
              value={gstNumber}
              onChange={onChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter 15-digit GST number (e.g., 27AABCU9603R1ZX)"
              maxLength={15}
              disabled={disabled || isLoading}
              className={`mt-1 ${error ? 'border-red-500' : ''}`}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleGSTLookup}
              disabled={disabled || isLoading || !gstNumber.trim()}
              className="mb-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {lastLookedUpGST && (
          <div className="text-sm text-muted-foreground">
            <p>Last lookup: {lastLookedUpGST}</p>
            <p className="mt-1">
              <span className="text-blue-600">Tip:</span> You can manually edit any auto-populated fields below if needed.
            </p>
          </div>
        )}

        {/* Auto-populated fields display */}
        {(companyName || address || city || state || pincode) && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <Label className="text-sm font-medium text-gray-700">Auto-populated Details</Label>
            
            {companyName && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Company Name</Label>
                <Input
                  name="companyName"
                  value={companyName}
                  onChange={onChange}
                  disabled={disabled}
                  className="bg-white border-gray-200"
                />
              </div>
            )}
            
            {address && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Address</Label>
                <Input
                  name="address"
                  value={address}
                  onChange={onChange}
                  disabled={disabled}
                  className="bg-white border-gray-200"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {city && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">City</Label>
                  <Input
                    name="city"
                    value={city}
                    onChange={onChange}
                    disabled={disabled}
                    className="bg-white border-gray-200"
                  />
                </div>
              )}
              
              {pincode && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Pincode</Label>
                  <Input
                    name="pincode"
                    value={pincode}
                    onChange={onChange}
                    disabled={disabled}
                    className="bg-white border-gray-200"
                  />
                </div>
              )}
            </div>
            
            {state && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">State</Label>
                <Input
                  name="state"
                  value={state}
                  onChange={onChange}
                  disabled={disabled}
                  className="bg-white border-gray-200"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GSTLookupSection;
