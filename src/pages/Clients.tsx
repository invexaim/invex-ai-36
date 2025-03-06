
import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Plus, RefreshCw, Search, Trash2, User, Users } from "lucide-react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useAppStore from "@/store/appStore";

const Clients = () => {
  const { clients, addClient, deleteClient } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const totalClients = clients.length;
  
  // Calculate recent contacts (clients added in the last 7 days)
  const recentContacts = clients.filter(client => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(client.lastPurchase) >= oneWeekAgo;
  }).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }
    
    // Add client
    addClient(formData);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    
    // Close dialog
    setIsAddClientOpen(false);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button
          onClick={() => setIsAddClientOpen(true)}
          className="self-start sm:self-auto"
        >
          <User className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <h3 className="text-3xl font-bold mt-1">{totalClients}</h3>
              <p className="text-xs text-muted-foreground mt-1">{totalClients} active</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Contacts</p>
              <h3 className="text-3xl font-bold mt-1">{recentContacts}</h3>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Communication Status</p>
              <h3 className="text-3xl font-bold mt-1">85%</h3>
              <p className="text-xs text-muted-foreground mt-1">Response rate</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold flex items-center">
            Client List
            <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <select 
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {clients.length > 0 ? (
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
                      <TableCell className="font-medium">
                        <Link 
                          to={`/clients/${client.id}`}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {client.name}
                        </Link>
                      </TableCell>
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
                          onClick={() => deleteClient(client.id)}
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
                      No clients found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Clients Yet</h3>
            <p className="text-muted-foreground mt-1 mb-6">Add your first client to get started</p>
            <Button onClick={() => setIsAddClientOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Client
            </Button>
          </div>
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the details for the new client below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter client's full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter client's email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter client's phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddClientOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              <User className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
