
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  FileText, 
  RotateCcw, 
  Users, 
  Calculator,
  Percent,
  Mail
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const { products, sales, deleteSale, pendingEstimateForSale, setPendingEstimateForSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenRecordSale = () => {
    navigate("/sales/record");
  };

  const filteredSales = sales.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const clientNameMatch = sale.clientName 
      ? sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    return productName.includes(searchTerm.toLowerCase()) || clientNameMatch;
  });

  const salesModules = [
    {
      title: "New Invoice",
      description: "Create professional invoices with GST calculations",
      icon: <FileText className="h-8 w-8" />,
      path: "/sales/invoices",
      color: "bg-blue-500"
    },
    {
      title: "Invoice List",
      description: "View and manage all invoices with printing & emailing",
      icon: <FileText className="h-8 w-8" />,
      path: "/sales/invoices",
      color: "bg-green-500"
    },
    {
      title: "Sales Returns",
      description: "Process returns and refunds for customers",
      icon: <RotateCcw className="h-8 w-8" />,
      path: "/sales/returns",
      color: "bg-orange-500"
    },
    {
      title: "Customers",
      description: "Manage customer database and information",
      icon: <Users className="h-8 w-8" />,
      path: "/clients",
      color: "bg-purple-500"
    },
    {
      title: "GST Calculations",
      description: "Automated tax calculations and reporting",
      icon: <Calculator className="h-8 w-8" />,
      path: "/sales/gst",
      color: "bg-indigo-500"
    },
    {
      title: "Discounts & Offers",
      description: "Manage discount schemes and promotional offers",
      icon: <Percent className="h-8 w-8" />,
      path: "/sales/discounts",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Manage your sales operations efficiently</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(module.path)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.color} text-white`}>
                  {module.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-2">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation();
                navigate(module.path);
              }}>
                Access {module.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common sales operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/sales/record")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Record Sale
            </Button>
            <Button variant="outline" onClick={() => navigate("/sales/invoices")}>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
            <Button variant="outline" onClick={() => navigate("/sales/returns")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Process Return
            </Button>
            <Button variant="outline" onClick={() => navigate("/clients")}>
              <Users className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      <SalesListSection
        sales={filteredSales}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDeleteSale={deleteSale}
        totalSales={sales.length}
      />
    </div>
  );
};

export default Sales;
