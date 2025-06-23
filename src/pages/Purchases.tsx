
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, FileText, RotateCcw, Users, List, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Purchases = () => {
  const navigate = useNavigate();

  const purchaseModules = [
    {
      title: "Purchase Orders",
      description: "Create and manage purchase orders for suppliers",
      icon: <FileText className="h-8 w-8" />,
      path: "/purchases/orders",
      color: "bg-blue-500"
    },
    {
      title: "Purchase Returns",
      description: "Handle returns and refunds to suppliers",
      icon: <RotateCcw className="h-8 w-8" />,
      path: "/purchases/returns",
      color: "bg-orange-500"
    },
    {
      title: "Supplier Management",
      description: "Manage supplier information and contacts",
      icon: <Users className="h-8 w-8" />,
      path: "/purchases/suppliers",
      color: "bg-green-500"
    },
    {
      title: "Purchase List & Import",
      description: "View all purchases and import from CSV/Excel",
      icon: <List className="h-8 w-8" />,
      path: "/purchases/list",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Purchases Management</h1>
          <p className="text-muted-foreground">Manage your purchase operations efficiently</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {purchaseModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(module.path)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.color} text-white`}>
                  {module.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
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
          <CardDescription>Common purchase operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/purchases/orders")}>
              <FileText className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
            <Button variant="outline" onClick={() => navigate("/purchases/suppliers")}>
              <Users className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
            <Button variant="outline" onClick={() => navigate("/purchases/list")}>
              <Download className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchases;
