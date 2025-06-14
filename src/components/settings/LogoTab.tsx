
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import useAppStore from "@/store/appStore";

const LogoTab = () => {
  const { logo, updateLogo } = useAppStore();
  const [preview, setPreview] = useState<string>(logo.logoUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        updateLogo({ logoUrl: dataUrl, logoFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setPreview('');
    updateLogo({ logoUrl: '', logoFile: undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Upload Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Company logo"
                  className="h-24 w-24 object-contain border rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Choose File</span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a logo for your company. Recommended size: 200x200px
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Logo Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use PNG or JPG format</li>
            <li>• Maximum file size: 2MB</li>
            <li>• Square aspect ratio works best</li>
            <li>• Transparent background recommended for PNG files</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoTab;
