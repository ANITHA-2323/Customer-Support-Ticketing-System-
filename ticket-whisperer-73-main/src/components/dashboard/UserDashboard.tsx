import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import TicketList from "./TicketList";
import CreateTicketDialog from "./CreateTicketDialog";
import TicketDetailsDialog from "./TicketDetailsDialog";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: tickets, isLoading, refetch, error: queryError } = useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: async () => {
      console.log("Fetching tickets for user:", user?.id);
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles!tickets_user_id_fkey(full_name, email),
          assigned_agent:profiles!tickets_assigned_to_fkey(full_name, email)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }
      console.log("Fetched tickets:", data);
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["user-ticket-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("status")
        .eq("user_id", user?.id);

      if (error) throw error;
      
      return {
        total: data.length,
        open: data.filter(t => t.status === "open").length,
        inProgress: data.filter(t => t.status === "in_progress").length,
        resolved: data.filter(t => t.status === "resolved").length,
      };
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DashboardLayout
      title="My Tickets"
      actions={
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
          <Button onClick={handleSignOut} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tickets</h3>
          <p className="text-3xl font-bold mt-2">{stats?.total || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Open</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">{stats?.open || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
          <p className="text-3xl font-bold mt-2 text-warning">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Resolved</h3>
          <p className="text-3xl font-bold mt-2 text-success">{stats?.resolved || 0}</p>
        </div>
      </div>

      <TicketList
        tickets={tickets || []}
        isLoading={isLoading}
        onTicketClick={setSelectedTicketId}
      />

      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />

      {selectedTicketId && (
        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
          onUpdate={refetch}
        />
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;
