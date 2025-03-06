
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAppStore from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, payments, deleteClient } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the client by ID
  const client = clients.find((c) => c.id === Number(clientId));

  // Get client's payment history
  const clientPayments = payments.filter(
    (payment) => client && payment.clientName === client.name
  );

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The client you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link to="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const handleDeleteClient = () => {
    setIsDeleting(true);
    setTimeout(() => {
      deleteClient(client.id);
      toast.success("Client deleted successfully");
      navigate("/clients");
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full h-8 w-8"
          >
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Back to Clients</h1>
        </div>
        <Button
          variant="destructive"
          onClick={handleDeleteClient}
          disabled={isDeleting}
          className="flex-shrink-0"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Client
        </Button>
      </div>

      <div className="bg-card border shadow-sm rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-muted-foreground mt-1">Client Details</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{client.email || "No email provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-foreground">{client.phone || "No phone provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-foreground">{"marzlet" || "No company provided"}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Activity Status</p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                active
              </span>
              <span className="text-sm text-muted-foreground">
                Last purchase: {new Date(client.lastPurchase).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border shadow-sm rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Purchase History</h2>
        </div>
        <div className="p-6">
          {clientPayments.length > 0 ? (
            <div className="space-y-4">
              {clientPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.description || "Payment"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No purchase history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
