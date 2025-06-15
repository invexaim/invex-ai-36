
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExpiryDateFieldProps {
  expiryDate: Date | undefined;
  onExpiryDateChange: (date: Date | undefined) => void;
}

export const ExpiryDateField = ({ expiryDate, onExpiryDateChange }: ExpiryDateFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Expiry Date (Optional)</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !expiryDate && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {expiryDate ? format(expiryDate, "PPP") : <span>Pick expiry date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={expiryDate}
            onSelect={onExpiryDateChange}
            disabled={(date) => date < new Date()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {expiryDate && (
        <p className="text-sm text-muted-foreground">
          This will automatically create an expiry record on the Expiry page.
        </p>
      )}
    </div>
  );
};
