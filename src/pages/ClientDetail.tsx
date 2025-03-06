
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Package, 
  Phone, 
  ShoppingCart, 
  Trash, 
  UserPlus 
} from "lucide-react";
import { LineChart } from "@/components/charts/LineChart";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, removeClient } = useAppStore();
  
  // Find the client by id
  const client = clients.find(c => c.id.toString() === clientId);
  
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-2">Client Not Found</h1>
        <p className="text-muted-foreground mb-6">The client you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    );
  }
  
  const handleDelete = () => {
    removeClient(client.id);
    toast.success("Client deleted successfully");
    navigate('/clients');
  };
  
  // Mock data for charts
  const purchaseData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 3908 },
    { name: 'May', value: 4800 },
    { name: 'Jun', value: 3800 },
  ];
  
  const paymentData = [
    { name: 'Jan', value: 2000 },
    { name: 'Feb', value: 1200 },
    { name: 'Mar', value: 9000 },
    { name: 'Apr', value: 3500 },
    { name: 'May', value: 4000 },
    { name: 'Jun', value: 3000 },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950">
            <Trash className="w-4 h-4 mr-1" />
            Delete Client
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{client.phone || "No phone number"}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Client since {client.joinDate}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Total Spent</span>
              </div>
              <span className="font-medium">${client.totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Open Invoices</span>
              </div>
              <span className="font-medium">{client.openInvoices || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Last Purchase</span>
              </div>
              <span className="font-medium">{client.lastPurchase || "Never"}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Add Products
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserPlus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="purchases">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart 
                  data={purchaseData} 
                  xKey="name" 
                  yKey="value" 
                  title="Monthly Purchases" 
                  color="#3b82f6" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <LineChart 
                  data={paymentData} 
                  xKey="name" 
                  yKey="value" 
                  title="Monthly Payments" 
                  color="#10b981" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
