
import { Users, Phone } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { Client } from "@/types";

interface StatsCardsProps {
  clients: Client[];
}

export const StatsCards = ({ clients }: StatsCardsProps) => {
  const totalClients = clients.length;
  
  // Calculate recent contacts (clients added in the last 7 days)
  const recentContacts = clients.filter(client => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(client.lastPurchase) >= oneWeekAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CardStat 
        title="Total Clients" 
        value={totalClients} 
        icon={<Users className="w-5 h-5 text-primary" />}
      >
        <p className="text-xs text-muted-foreground mt-1">{totalClients} active</p>
      </CardStat>
      
      <CardStat 
        title="Recent Contacts" 
        value={recentContacts}
        icon={<Phone className="w-5 h-5 text-blue-500" />} 
        className="bg-card"
      >
        <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
      </CardStat>
      
      <CardStat 
        title="Communication Status" 
        value="85%"
        icon={<Phone className="w-5 h-5 text-green-500" />} 
        className="bg-card"
      >
        <p className="text-xs text-muted-foreground mt-1">Response rate</p>
      </CardStat>
    </div>
  );
};
