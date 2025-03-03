
import { useState } from "react";
import { CardStat } from "@/components/ui/card-stat";
import { DollarSign, Search, ShoppingCart, Users, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
}

const mockClients: Client[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    totalPurchases: 12,
    totalSpent: 45000,
    lastPurchase: "2023-10-15",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 87654 32109",
    totalPurchases: 8,
    totalSpent: 32000,
    lastPurchase: "2023-10-12",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    phone: "+91 76543 21098",
    totalPurchases: 5,
    totalSpent: 18000,
    lastPurchase: "2023-10-08",
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha.singh@example.com",
    phone: "+91 65432 10987",
    totalPurchases: 3,
    totalSpent: 12000,
    lastPurchase: "2023-10-05",
  },
  {
    id: 5,
    name: "Vikram Desai",
    email: "vikram.desai@example.com",
    phone: "+91 54321 09876",
    totalPurchases: 10,
    totalSpent: 40000,
    lastPurchase: "2023-10-01",
  },
];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");

  const totalClients = clients.length;
  const totalSpent = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const totalPurchases = clients.reduce((sum, client) => sum + client.totalPurchases, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    toast.success("Client deleted successfully");
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground mt-1">
          Manage your clients and their information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat
          title="Total Clients"
          value={totalClients.toString()}
          icon={<Users className="w-5 h-5 text-primary" />}
          className="bg-blue-50"
        />
        <CardStat
          title="Total Purchases"
          value={totalPurchases.toString()}
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          className="bg-green-50"
        />
        <CardStat
          title="Revenue Generated"
          value={`₹${totalSpent.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          className="bg-purple-50"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold">Client List</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.totalPurchases}</TableCell>
                    <TableCell>₹{client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(client.lastPurchase).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
