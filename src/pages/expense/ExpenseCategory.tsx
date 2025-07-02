import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Tags, Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import MainLayout from "@/components/layout/MainLayout";

interface CategoryForm {
  name: string;
  description: string;
  color: string;
}

const ExpenseCategory = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the enhanced store methods for immediate auto-save
  const { saveDataToSupabase } = useAppStore();

  const form = useForm<CategoryForm>({
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
    },
  });

  const onSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true);
    try {
      const categoryData = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      console.log("EXPENSE CATEGORY: Creating category with immediate save:", categoryData);
      
      // Immediately save to prevent data loss on tab switches
      await saveDataToSupabase();
      
      toast.success("Expense category created and saved successfully");
      navigate("/expense/category-list");
    } catch (error) {
      console.error("EXPENSE CATEGORY: Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/expense/category-list")}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Category List
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tags className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">New Expense Category</h1>
            <p className="text-muted-foreground">Define a new type of expense for better organization</p>
          </div>
        </div>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/expense/category-list")}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <FolderOpen className="h-4 w-4" />
                View All Categories
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/expense/new")}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Record Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Category Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Office Supplies, Marketing, Travel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of this expense category..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="color"
                              {...field}
                              className="w-16 h-10 p-1 rounded border"
                            />
                            <span className="text-sm text-muted-foreground">
                              Choose a color to identify this category
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-sm text-muted-foreground mr-2">Quick colors:</span>
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                                style={{ backgroundColor: color }}
                                onClick={() => form.setValue("color", color)}
                              />
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/expense/category-list")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExpenseCategory;
